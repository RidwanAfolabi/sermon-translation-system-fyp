# backend/api/routes/live_routes.py
"""
Live subtitle streaming route with ASR accumulation buffer.

Key behavior:
- Keeps a small rolling buffer of recent ASR chunks (configurable).
- Tries to align on (a) buffer_text and (b) latest_chunk; picks best.
- Ensures only forward matches (tracks last_matched_order per connection).
- Flushes buffer when a match is accepted; trims buffer when it grows too large.
- Uses rule-based aligner (match_spoken_to_segment) — semantic disabled.
"""

import os
import asyncio
import threading
import queue
import logging
from fastapi import APIRouter, WebSocket, HTTPException
from sqlalchemy.orm import Session
from backend.db.session import SessionLocal
from backend.db import models
from ml_pipeline.speech_recognition.whisper_listener import listen_and_transcribe, stop_listener
from ml_pipeline.alignment_module.aligner import match_spoken_to_segment  # rule-based aligner
from starlette.websockets import WebSocketState

logger = logging.getLogger(__name__)
router = APIRouter()

_text_q: "queue.Queue[str]" = queue.Queue(maxsize=64)
_asr_thread: threading.Thread | None = None
_asr_thread_lock = threading.Lock()

# Force rule-based aligner
ALIGNER_MODE = "rule"
SEMANTIC_ENABLED = False

# Buffer / accumulation settings (tunable via env)
BUFFER_MAX_CHUNKS = int(os.getenv("LIVE_BUFFER_CHUNKS", "4"))        # how many recent chunks to keep
BUFFER_MAX_CHARS = int(os.getenv("LIVE_BUFFER_CHARS", "300"))      # hard char cap on buffer
LOOKAHEAD_LIMIT = int(os.getenv("LIVE_LOOKAHEAD_LIMIT", "30"))     # segments to search ahead
INITIAL_THRESHOLD = float(os.getenv("LIVE_INITIAL_THRESHOLD", "0.55"))

# ---------------------------------------------------------
# ASR worker that pushes recognized text into local queue
# ---------------------------------------------------------
def _asr_worker():
    logger.info("[LIVE] ASR worker started.")
    for txt in listen_and_transcribe():
        try:
            _text_q.put_nowait(txt)
        except queue.Full:
            # drop if full (prevents blocking)
            logger.debug("[LIVE] ASR queue full; dropping chunk.")
            pass
    logger.info("[LIVE] ASR worker stopped.")

def _start_asr_thread_once():
    global _asr_thread
    with _asr_thread_lock:
        if _asr_thread is None or not _asr_thread.is_alive():
            _asr_thread = threading.Thread(target=_asr_worker, daemon=True)
            _asr_thread.start()
            logger.info("[LIVE] ASR thread spawned.")


def _is_open(ws: WebSocket) -> bool:
    return ws.application_state != WebSocketState.DISCONNECTED

# safe send wrapper
async def _safe_send_json(ws: WebSocket, payload):
    if not _is_open(ws):
        return
    try:
        await ws.send_json(payload)
    except Exception as e:
        logger.warning(f"[LIVE] websocket send_json failed: {e}")


@router.websocket("/stream")
async def live_stream(websocket: WebSocket, sermon_id: int):
    """
    Streams ASR -> alignment results to connected websocket clients.
    Implements ASR accumulation to improve partial-chunk alignment.
    """
    await websocket.accept()
    db: Session = SessionLocal()
    try:
        sermon = db.query(models.Sermon).filter(models.Sermon.sermon_id == sermon_id).first()
        if not sermon:
            await websocket.send_text("Sermon not found.")
            await websocket.close()
            return

        # Load vetted segments only (we align to vetted, pretranslated text)
        segments = db.query(models.Segment).filter(
            models.Segment.sermon_id == sermon_id,
            models.Segment.is_vetted == True,
            models.Segment.english_text != None
        ).order_by(models.Segment.segment_order.asc()).all()

        # Fallback: if there are no vetted segments, load all segments
        if not segments:
            segments = db.query(models.Segment).filter(
                models.Segment.sermon_id == sermon_id
            ).order_by(models.Segment.segment_order.asc()).all()

        await _safe_send_json(websocket, {
            "status": "started",
            "sermon_id": sermon_id,
            "segments_loaded": len(segments),
            "aligner": ALIGNER_MODE
        })

        # Start ASR thread (only once globally)
        _start_asr_thread_once()

        dynamic_thresh = INITIAL_THRESHOLD
        miss_streak = 0

        # Per-connection state
        last_matched_order = -1
        asr_buffer_chunks: list[str] = []  # recent ASR chunks, oldest first

        while True:
            try:
                # Blocking get from ASR queue (produced by the ASR thread)
                spoken = await asyncio.get_event_loop().run_in_executor(None, _text_q.get)
            except Exception as e:
                logger.error(f"[LIVE] queue error: {e}")
                break

            try:
                # add latest chunk to rolling buffer
                asr_buffer_chunks.append(spoken.strip())
                # trim by count
                if len(asr_buffer_chunks) > BUFFER_MAX_CHUNKS:
                    asr_buffer_chunks = asr_buffer_chunks[-BUFFER_MAX_CHUNKS:]
                # trim by char length
                buffer_text = " ".join(asr_buffer_chunks).strip()
                if len(buffer_text) > BUFFER_MAX_CHARS:
                    # keep last portion only
                    # attempt to keep last BUFFER_MAX_CHARS characters worth
                    joined = " ".join(asr_buffer_chunks)
                    buffer_text = joined[-BUFFER_MAX_CHARS:]
                    # regenerate chunk list from trimmed buffer_text
                    # keep only last N chunks until char cap satisfied
                    tmp = []
                    cur = ""
                    for c in reversed(asr_buffer_chunks):
                        tmp.insert(0, c)
                        cur = " ".join(tmp)
                        if len(cur) > BUFFER_MAX_CHARS:
                            tmp = tmp[1:]
                            break
                    asr_buffer_chunks = tmp
                    buffer_text = " ".join(asr_buffer_chunks)

                # Build segments_to_search that are forward of last_matched_order
                segments_to_search = [s for s in segments if s.segment_order > last_matched_order]
                if LOOKAHEAD_LIMIT and LOOKAHEAD_LIMIT < len(segments_to_search):
                    segments_to_search = segments_to_search[:LOOKAHEAD_LIMIT]

                # 1) Try matching buffer_text (accumulated)
                best_seg_buf, best_score_buf, best_id_buf, best_order_buf = (None, 0.0, None, None)
                if buffer_text:
                    best_seg_buf, best_score_buf, best_id_buf, best_order_buf = match_spoken_to_segment(
                        buffer_text, segments_to_search, min_score=0.0
                    )

                # 2) Try matching latest single chunk
                best_seg_single, best_score_single, best_id_single, best_order_single = match_spoken_to_segment(
                    spoken, segments_to_search, min_score=0.0
                )

                # Choose better candidate (higher score)
                # prefer buffer match if score significantly higher or same but buffer has >1 chunk
                chosen = None
                chosen_score = 0.0
                chosen_seg = None
                chosen_id = None
                chosen_order = None
                used_buffer = False

                if best_score_buf >= best_score_single:
                    chosen_seg, chosen_score, chosen_id, chosen_order = best_seg_buf, best_score_buf, best_id_buf, best_order_buf
                    used_buffer = True
                else:
                    chosen_seg, chosen_score, chosen_id, chosen_order = best_seg_single, best_score_single, best_id_single, best_order_single
                    used_buffer = False

                # Now decide if chosen_score meets dynamic threshold and is forward
                matched = False
                if chosen_seg and chosen_score is not None:
                    # ensure chosen_order is forward of last_matched_order
                    if chosen_order is not None and chosen_order > last_matched_order and chosen_score >= dynamic_thresh:
                        matched = True

                # dynamic threshold adapt
                if matched:
                    miss_streak = 0
                    dynamic_thresh = min(0.70, dynamic_thresh + 0.02)
                else:
                    miss_streak += 1
                    if miss_streak >= 3:
                        dynamic_thresh = max(0.45, dynamic_thresh - 0.03)

                # Prepare payload
                payload = {
                    "spoken": spoken,
                    "buffer_text": buffer_text,
                    "buffer_chunks": len(asr_buffer_chunks),
                    "score": round(chosen_score or 0.0, 3),
                    "matched": matched,
                    "aligner": ALIGNER_MODE,
                    "threshold": round(dynamic_thresh, 3),
                    "candidate": {"segment_id": chosen_id, "order": chosen_order},
                    "segment": None,
                    "used_buffer": used_buffer
                }

                if matched:
                    # populate segment details and update last matched order
                    payload["segment"] = {
                        "segment_id": chosen_seg.segment_id,
                        "order": chosen_seg.segment_order,
                        "malay_text": chosen_seg.malay_text,
                        "english_text": chosen_seg.english_text
                    }
                    last_matched_order = chosen_seg.segment_order

                    # Flush buffer on confirmed match (we assume those chunks were consumed)
                    asr_buffer_chunks = []

                else:
                    # No confirmed match: keep buffer but optionally shrink it if too many misses
                    if len(asr_buffer_chunks) > max(1, BUFFER_MAX_CHUNKS // 2) and miss_streak >= 4:
                        # drop the oldest chunk to keep buffer fresh
                        asr_buffer_chunks = asr_buffer_chunks[1:]

                # If websocket closed, break
                if not _is_open(websocket):
                    logger.info("[LIVE] client disconnected, stopping stream.")
                    break

                await _safe_send_json(websocket, payload)

            except Exception as e:
                logger.error(f"[LIVE] send error: {e}", exc_info=True)
                break

    finally:
        try:
            stop_listener()
        except Exception:
            pass
        try:
            db.close()
        except Exception:
            pass
        if _is_open(websocket):
            await websocket.close()
        logger.info(f"[LIVE] closed sermon_id={sermon_id}")
