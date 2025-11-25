# backend/api/routes/live_routes.py
"""
Live subtitle streaming route with ASR accumulation buffer.

Fixes included in this version:
- MULTI-CLIENT SAFE: multiple websockets (index.html + display.html) can connect
  simultaneously without interfering with each other.
- ASR listener is NOT stopped when a single client disconnects.
- stop_listener() is only called when ALL clients disconnect.
- No more websocket send_json crashes.
"""

import os
import asyncio
import threading
import queue
import logging
from fastapi import APIRouter, WebSocket
from sqlalchemy.orm import Session
from backend.db.session import SessionLocal
from backend.db import models
from ml_pipeline.speech_recognition.whisper_listener import listen_and_transcribe, stop_listener
from ml_pipeline.alignment_module.aligner import match_spoken_to_segment
from starlette.websockets import WebSocketState

logger = logging.getLogger(__name__)
router = APIRouter()

# ---------------------------------------------------------
# Global shared ASR state
# ---------------------------------------------------------
_text_q: "queue.Queue[str]" = queue.Queue(maxsize=64)
_asr_thread: threading.Thread | None = None
_asr_thread_lock = threading.Lock()

# ---------------------------------------------------------
# NEW — Multi-client tracking
# ---------------------------------------------------------
_connected_clients = 0
_connected_clients_lock = threading.Lock()

# ---------------------------------------------------------
# Config
# ---------------------------------------------------------
ALIGNER_MODE = "rule"
SEMANTIC_ENABLED = False

BUFFER_MAX_CHUNKS = int(os.getenv("LIVE_BUFFER_CHUNKS", "4"))
BUFFER_MAX_CHARS = int(os.getenv("LIVE_BUFFER_CHARS", "300"))
LOOKAHEAD_LIMIT = int(os.getenv("LIVE_LOOKAHEAD_LIMIT", "30"))
INITIAL_THRESHOLD = float(os.getenv("LIVE_INITIAL_THRESHOLD", "0.55"))


# ---------------------------------------------------------
# ASR Worker
# ---------------------------------------------------------
def _asr_worker():
    logger.info("[LIVE] ASR worker started.")
    for txt in listen_and_transcribe():
        try:
            _text_q.put_nowait(txt)
        except queue.Full:
            logger.debug("[LIVE] ASR queue full; dropping chunk.")
    logger.info("[LIVE] ASR worker stopped.")


def _start_asr_thread_once():
    global _asr_thread
    with _asr_thread_lock:
        if _asr_thread is None or not _asr_thread.is_alive():
            _asr_thread = threading.Thread(target=_asr_worker, daemon=True)
            _asr_thread.start()
            logger.info("[LIVE] ASR thread spawned.")


# ---------------------------------------------------------
# WebSocket helpers
# ---------------------------------------------------------
def _is_open(ws: WebSocket) -> bool:
    return ws.application_state != WebSocketState.DISCONNECTED


async def _safe_send_json(ws: WebSocket, payload):
    if not _is_open(ws):
        return
    try:
        await ws.send_json(payload)
    except Exception as e:
        logger.warning(f"[LIVE] websocket send_json failed: {e}", exc_info=True)


# ---------------------------------------------------------
# Main WebSocket Route
# ---------------------------------------------------------
@router.websocket("/stream")
async def live_stream(websocket: WebSocket, sermon_id: int):
    # declare global before any modification to avoid SyntaxError
    global _connected_clients

    # Accept (custom CORS headers here are unnecessary for WS; remove headers arg)
    await websocket.accept()
    # -----------------------------------------------------
    # Register client
    # -----------------------------------------------------
    with _connected_clients_lock:
        _connected_clients += 1
        active = _connected_clients
    logger.info(f"[LIVE] client connected — total={active}")

    # Database session
    db: Session = SessionLocal()

    try:
        sermon = db.query(models.Sermon).filter(
            models.Sermon.sermon_id == sermon_id
        ).first()

        if not sermon:
            await websocket.send_text("Sermon not found.")
            await websocket.close()
            return

        # Load segments
        segments = db.query(models.Segment).filter(
            models.Segment.sermon_id == sermon_id,
            models.Segment.is_vetted == True,
            models.Segment.english_text != None
        ).order_by(models.Segment.segment_order.asc()).all()

        if not segments:
            segments = db.query(models.Segment).filter(
                models.Segment.sermon_id == sermon_id
            ).order_by(models.Segment.segment_order.asc()).all()

        # Send handshake
        await _safe_send_json(websocket, {
            "status": "started",
            "sermon_id": sermon_id,
            "segments_loaded": len(segments),
            "aligner": ALIGNER_MODE
        })

        # Start ASR engine (global)
        _start_asr_thread_once()

        # Per-connection state
        dynamic_thresh = INITIAL_THRESHOLD
        miss_streak = 0
        last_matched_order = -1
        asr_buffer_chunks: list[str] = []

        # -----------------------------------------------------
        # MAIN LOOP
        # -----------------------------------------------------
        while True:
            try:
                spoken = await asyncio.get_event_loop().run_in_executor(None, _text_q.get)
            except Exception as e:
                logger.error(f"[LIVE] queue error: {e}")
                break

            try:
                # accumulate rolling ASR buffer
                asr_buffer_chunks.append(spoken.strip())

                if len(asr_buffer_chunks) > BUFFER_MAX_CHUNKS:
                    asr_buffer_chunks = asr_buffer_chunks[-BUFFER_MAX_CHUNKS:]

                buffer_text = " ".join(asr_buffer_chunks).strip()

                if len(buffer_text) > BUFFER_MAX_CHARS:
                    buffer_text = buffer_text[-BUFFER_MAX_CHARS:]

                # forward-only search
                segments_to_search = [
                    s for s in segments if s.segment_order > last_matched_order
                ]
                if LOOKAHEAD_LIMIT < len(segments_to_search):
                    segments_to_search = segments_to_search[:LOOKAHEAD_LIMIT]

                # 1) buffer match
                best_seg_buf, best_score_buf, best_id_buf, best_order_buf = \
                    match_spoken_to_segment(buffer_text, segments_to_search, min_score=0.0)

                # 2) single chunk match
                best_seg_single, best_score_single, best_id_single, best_order_single = \
                    match_spoken_to_segment(spoken, segments_to_search, min_score=0.0)

                # pick best
                if best_score_buf >= best_score_single:
                    chosen_seg, chosen_score, chosen_id, chosen_order = \
                        best_seg_buf, best_score_buf, best_id_buf, best_order_buf
                else:
                    chosen_seg, chosen_score, chosen_id, chosen_order = \
                        best_seg_single, best_score_single, best_id_single, best_order_single

                # evaluate match
                matched = False
                if chosen_seg and chosen_order and chosen_order > last_matched_order:
                    if chosen_score >= dynamic_thresh:
                        matched = True

                # adapt threshold
                if matched:
                    miss_streak = 0
                    dynamic_thresh = min(0.70, dynamic_thresh + 0.02)
                else:
                    miss_streak += 1
                    if miss_streak >= 3:
                        dynamic_thresh = max(0.45, dynamic_thresh - 0.03)

                # payload
                payload = {
                    "spoken": spoken,
                    "buffer_text": buffer_text,
                    "buffer_chunks": len(asr_buffer_chunks),
                    "score": round(chosen_score or 0.0, 3),
                    "matched": matched,
                    "threshold": round(dynamic_thresh, 3),
                    "candidate": {"segment_id": chosen_id, "order": chosen_order},
                    "aligner": ALIGNER_MODE,
                    "segment": None
                }

                if matched:
                    payload["segment"] = {
                        "segment_id": chosen_seg.segment_id,
                        "order": chosen_seg.segment_order,
                        "malay_text": chosen_seg.malay_text,
                        "english_text": chosen_seg.english_text
                    }
                    last_matched_order = chosen_seg.segment_order
                    asr_buffer_chunks = []  # flush accumulated buffer

                # websocket still alive?
                if not _is_open(websocket):
                    logger.info("[LIVE] client disconnected (loop break).")
                    break

                await _safe_send_json(websocket, payload)

            except Exception as e:
                logger.error(f"[LIVE] send loop error: {e}", exc_info=True)
                break

    finally:
        # -----------------------------------------------------
        # CLEANUP — MULTI-CLIENT SAFE
        # -----------------------------------------------------
        with _connected_clients_lock:
            if _connected_clients > 0:
                _connected_clients -= 1
            remaining = _connected_clients
        logger.info(f"[LIVE] client disconnected — remaining_clients={remaining}")

        # Only stop ASR when no clients remain
        if remaining <= 0:
            try:
                stop_listener()
                logger.info("[LIVE] stop_listener() called (no clients remain).")
            except Exception as e:
                logger.error(f"[LIVE] stop_listener() error: {e}", exc_info=True)

        try:
            db.close()
        except Exception:
            pass

        try:
            if _is_open(websocket):
                await websocket.close()
        except:
            pass

        logger.info(f"[LIVE] closed sermon_id={sermon_id}")
