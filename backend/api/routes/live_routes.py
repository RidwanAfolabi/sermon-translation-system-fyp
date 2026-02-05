# backend/api/routes/live_routes.py
"""
Live subtitle streaming route with ASR accumulation buffer and analytics logging.

Features:
- MULTI-CLIENT SAFE: multiple websockets can connect simultaneously
- ASR listener managed per-session
- Analytics logging: tracks matches, skips, and session stats
- stop_listener() only called when ALL clients disconnect
"""

import os
import asyncio
import threading
import queue
import logging
import uuid
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, WebSocket
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.db.session import SessionLocal
from backend.db import models
from ml_pipeline.speech_recognition.whisper_listener import listen_and_transcribe, stop_listener
from ml_pipeline.alignment_module.aligner import match_spoken_to_segment
from starlette.websockets import WebSocketState, WebSocketDisconnect

logger = logging.getLogger(__name__)
router = APIRouter()

# ---------------------------------------------------------
# Global shared ASR state
# ---------------------------------------------------------
_text_q: "queue.Queue[str]" = queue.Queue(maxsize=64)
_asr_thread: threading.Thread | None = None
_asr_thread_lock = threading.Lock()
_shutdown_flag = threading.Event()  # NEW: signal shutdown

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

BUFFER_MAX_CHUNKS = int(os.getenv("LIVE_BUFFER_CHUNKS", "5"))
BUFFER_MAX_CHARS = int(os.getenv("LIVE_BUFFER_CHARS", "400"))
LOOKAHEAD_LIMIT = int(os.getenv("LIVE_LOOKAHEAD_LIMIT", "10"))
STATIC_THRESHOLD = float(os.getenv("LIVE_INITIAL_THRESHOLD", "0.45"))  # Static threshold


# ---------------------------------------------------------
# Analytics Helper Functions
# ---------------------------------------------------------
def create_live_session(db: Session, sermon_id: int) -> models.LiveSession:
    """Create a new live session record when streaming starts."""
    session_id = f"live_{sermon_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}"
    
    live_session = models.LiveSession(
        session_id=session_id,
        sermon_id=sermon_id,
        status="active"
    )
    db.add(live_session)
    db.commit()
    db.refresh(live_session)
    
    # Log activity
    log_activity(
        db=db,
        event_type="live_session_started",
        sermon_id=sermon_id,
        session_id=session_id,
        title="Live Session Started",
        description=f"Live streaming session started for sermon {sermon_id}"
    )
    
    logger.info(f"[ANALYTICS] Created live session: {session_id}")
    return live_session


def log_matched_segment(
    db: Session,
    session_id: str,
    sermon_id: int,
    segment: models.Segment,
    spoken_text: str,
    alignment_score: float,
    threshold: float
) -> None:
    """Log a successful segment match."""
    try:
        event = models.LiveSessionLog(
            session_id=session_id,
            sermon_id=sermon_id,
            segment_id=segment.segment_id,
            event_type="matched",
            spoken_text=spoken_text,
            matched_segment_order=segment.segment_order,
            alignment_score=alignment_score,
            threshold_used=threshold
        )
        db.add(event)
        db.commit()
    except Exception as e:
        logger.error(f"[ANALYTICS] Failed to log matched segment: {e}")
        db.rollback()


def log_skipped_segments(
    db: Session,
    session_id: str,
    sermon_id: int,
    skipped_segments: List[dict],
    from_order: int,
    to_order: int
) -> None:
    """Log skipped segments for later review and ML retraining."""
    try:
        for seg in skipped_segments:
            event = models.LiveSessionLog(
                session_id=session_id,
                sermon_id=sermon_id,
                segment_id=seg.get("segment_id"),
                event_type="skipped",
                matched_segment_order=seg.get("order"),
                skipped_from_order=from_order,
                skipped_to_order=to_order,
                skipped_count=len(skipped_segments)
            )
            db.add(event)
        db.commit()
        logger.info(f"[ANALYTICS] Logged {len(skipped_segments)} skipped segment(s)")
    except Exception as e:
        logger.error(f"[ANALYTICS] Failed to log skipped segments: {e}")
        db.rollback()


def finalize_live_session(
    db: Session,
    session_id: str,
    sermon_id: int,
    status: str = "completed",
    error_message: Optional[str] = None
) -> None:
    """Finalize a live session with aggregated statistics."""
    try:
        live_session = db.query(models.LiveSession).filter(
            models.LiveSession.session_id == session_id
        ).first()
        
        if not live_session:
            logger.warning(f"[ANALYTICS] Live session not found: {session_id}")
            return
        
        # Calculate aggregated stats from logs
        stats = db.query(
            func.count(models.LiveSessionLog.id).label('total_events'),
            func.avg(models.LiveSessionLog.alignment_score).filter(
                models.LiveSessionLog.event_type == 'matched'
            ).label('avg_score'),
            func.min(models.LiveSessionLog.alignment_score).filter(
                models.LiveSessionLog.event_type == 'matched'
            ).label('min_score'),
            func.max(models.LiveSessionLog.alignment_score).filter(
                models.LiveSessionLog.event_type == 'matched'
            ).label('max_score'),
            func.count(models.LiveSessionLog.id).filter(
                models.LiveSessionLog.event_type == 'matched'
            ).label('matched_count'),
            func.count(models.LiveSessionLog.id).filter(
                models.LiveSessionLog.event_type == 'skipped'
            ).label('skipped_count'),
            func.count(models.LiveSessionLog.id).filter(
                models.LiveSessionLog.event_type == 'wrong_match'
            ).label('wrong_match_count'),
            func.count(models.LiveSessionLog.id).filter(
                models.LiveSessionLog.event_type == 'manual_override'
            ).label('manual_override_count')
        ).filter(
            models.LiveSessionLog.session_id == session_id
        ).first()
        
        # Update session with stats
        live_session.ended_at = datetime.utcnow()
        live_session.status = status
        live_session.error_message = error_message
        
        if live_session.started_at:
            duration = (live_session.ended_at - live_session.started_at).total_seconds()
            live_session.duration_seconds = int(duration)
        
        if stats:
            live_session.total_segments_matched = stats.matched_count or 0
            live_session.total_segments_skipped = stats.skipped_count or 0
            live_session.total_wrong_matches = stats.wrong_match_count or 0
            live_session.total_manual_overrides = stats.manual_override_count or 0
            live_session.avg_match_score = round(stats.avg_score, 3) if stats.avg_score else None
            live_session.min_match_score = round(stats.min_score, 3) if stats.min_score else None
            live_session.max_match_score = round(stats.max_score, 3) if stats.max_score else None
        
        # Update sermon delivery stats
        sermon = db.query(models.Sermon).filter(
            models.Sermon.sermon_id == sermon_id
        ).first()
        if sermon and status == "completed":
            sermon.delivered_count = (sermon.delivered_count or 0) + 1
            sermon.last_delivered_at = datetime.utcnow()
        
        db.commit()
        
        # Log activity
        log_activity(
            db=db,
            event_type="live_session_completed",
            sermon_id=sermon_id,
            session_id=session_id,
            title="Live Session Completed",
            description=f"Session completed. Matched: {stats.matched_count or 0}, Skipped: {stats.skipped_count or 0}",
            extra_data=f'{{"matched": {stats.matched_count or 0}, "skipped": {stats.skipped_count or 0}, "avg_score": {stats.avg_score or 0}}}'
        )
        
        logger.info(f"[ANALYTICS] Finalized live session: {session_id} (status={status}, matched={stats.matched_count}, skipped={stats.skipped_count})")
        
    except Exception as e:
        logger.error(f"[ANALYTICS] Failed to finalize session: {e}")
        db.rollback()


def log_activity(
    db: Session,
    event_type: str,
    title: str,
    sermon_id: Optional[int] = None,
    segment_id: Optional[int] = None,
    session_id: Optional[str] = None,
    description: Optional[str] = None,
    extra_data: Optional[str] = None,
    actor: str = "system"
) -> None:
    """Log an activity for the activity feed."""
    try:
        activity = models.ActivityLog(
            event_type=event_type,
            sermon_id=sermon_id,
            segment_id=segment_id,
            session_id=session_id,
            title=title,
            description=description,
            extra_data=extra_data,
            actor=actor
        )
        db.add(activity)
        db.commit()
    except Exception as e:
        logger.error(f"[ANALYTICS] Failed to log activity: {e}")
        db.rollback()


# ---------------------------------------------------------
# ASR Worker
# ---------------------------------------------------------
def _asr_worker():
    logger.info("[LIVE] ASR worker started.")
    try:
        for txt in listen_and_transcribe():
            if _shutdown_flag.is_set():
                break
            try:
                _text_q.put_nowait(txt)
            except queue.Full:
                logger.debug("[LIVE] ASR queue full; dropping chunk.")
    except Exception as e:
        if not _shutdown_flag.is_set():
            logger.error(f"[LIVE] ASR worker error: {e}")
    logger.info("[LIVE] ASR worker stopped.")


def _start_asr_thread_once():
    global _asr_thread
    with _asr_thread_lock:
        _shutdown_flag.clear()  # Reset shutdown flag
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
    """Send JSON to websocket, silently handling disconnects."""
    if not _is_open(ws):
        return False
    try:
        await ws.send_json(payload)
        return True
    except (WebSocketDisconnect, asyncio.CancelledError):
        # Expected during shutdown or client disconnect
        return False
    except Exception as e:
        # Only log truly unexpected errors
        err_str = str(e).lower()
        if "disconnect" not in err_str and "closed" not in err_str and "cancelled" not in err_str:
            logger.warning(f"[LIVE] websocket send failed: {e}")
        return False


# ---------------------------------------------------------
# Main WebSocket Route
# ---------------------------------------------------------
@router.websocket("/stream")
async def live_stream(websocket: WebSocket, sermon_id: int):
    global _connected_clients

    await websocket.accept()
    
    with _connected_clients_lock:
        _connected_clients += 1
        active = _connected_clients
    logger.info(f"[LIVE] client connected — total={active}")

    db: Session = SessionLocal()
    live_session: Optional[models.LiveSession] = None
    session_status = "completed"
    error_msg = None

    try:
        sermon = db.query(models.Sermon).filter(
            models.Sermon.sermon_id == sermon_id
        ).first()

        if not sermon:
            await websocket.send_text("Sermon not found.")
            await websocket.close()
            return

        segments = db.query(models.Segment).filter(
            models.Segment.sermon_id == sermon_id,
            models.Segment.is_vetted == True,
            models.Segment.english_text != None
        ).order_by(models.Segment.segment_order.asc()).all()

        if not segments:
            segments = db.query(models.Segment).filter(
                models.Segment.sermon_id == sermon_id
            ).order_by(models.Segment.segment_order.asc()).all()

        # -----------------------------------------------------
        # ANALYTICS: Create live session
        # -----------------------------------------------------
        live_session = create_live_session(db, sermon_id)
        
        await _safe_send_json(websocket, {
            "status": "started",
            "sermon_id": sermon_id,
            "session_id": live_session.session_id,
            "segments_loaded": len(segments),
            "aligner": ALIGNER_MODE
        })

        _start_asr_thread_once()

        static_thresh = STATIC_THRESHOLD
        last_matched_order = -1
        asr_buffer_chunks: list[str] = []

        # -----------------------------------------------------
        # MAIN LOOP
        # -----------------------------------------------------
        while True:
            try:
                spoken = await asyncio.get_event_loop().run_in_executor(None, _get_from_queue_with_timeout)
                if spoken is None:
                    # Timeout — check if we should exit
                    if not _is_open(websocket):
                        break
                    continue
            except asyncio.CancelledError:
                logger.info("[LIVE] ASR loop cancelled (shutdown).")
                session_status = "interrupted"
                break
            except Exception as e:
                logger.error(f"[LIVE] queue error: {e}")
                session_status = "error"
                error_msg = str(e)
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
                    if chosen_score >= static_thresh:
                        matched = True

                # payload
                payload = {
                    "spoken": spoken,
                    "buffer_text": buffer_text,
                    "buffer_chunks": len(asr_buffer_chunks),
                    "score": round(chosen_score or 0.0, 3),
                    "matched": matched,
                    "threshold": static_thresh,
                    "aligner": ALIGNER_MODE,
                    "candidate": {"segment_id": chosen_id, "order": chosen_order},
                    "segment": None,
                    "skipped_segments": []
                }

                if matched and chosen_seg:
                    # --------------------------------------------------
                    # Catch-up logic for skipped segments
                    # --------------------------------------------------
                    skipped = []
                    if chosen_order > last_matched_order + 1:
                        # Find all segments between last matched and current
                        for seg in segments:
                            if last_matched_order < seg.segment_order < chosen_order:
                                skipped.append({
                                    "segment_id": seg.segment_id,
                                    "order": seg.segment_order,
                                    "malay_text": seg.malay_text,
                                    "english_text": seg.english_text
                                })
                        if skipped:
                            logger.info(f"[LIVE] Catching up {len(skipped)} skipped segment(s): orders {[s['order'] for s in skipped]}")
                            
                            # -----------------------------------------------------
                            # ANALYTICS: Log skipped segments
                            # -----------------------------------------------------
                            log_skipped_segments(
                                db=db,
                                session_id=live_session.session_id,
                                sermon_id=sermon_id,
                                skipped_segments=skipped,
                                from_order=last_matched_order,
                                to_order=chosen_order
                            )
                    
                    payload["skipped_segments"] = skipped
                    payload["segment"] = {
                        "segment_id": chosen_seg.segment_id,
                        "order": chosen_seg.segment_order,
                        "malay_text": chosen_seg.malay_text,
                        "english_text": chosen_seg.english_text
                    }
                    
                    # -----------------------------------------------------
                    # ANALYTICS: Log matched segment
                    # -----------------------------------------------------
                    log_matched_segment(
                        db=db,
                        session_id=live_session.session_id,
                        sermon_id=sermon_id,
                        segment=chosen_seg,
                        spoken_text=buffer_text,
                        alignment_score=chosen_score,
                        threshold=static_thresh
                    )
                    
                    last_matched_order = chosen_seg.segment_order
                    asr_buffer_chunks = []  # flush accumulated buffer

                # websocket still alive?
                if not _is_open(websocket):
                    logger.info("[LIVE] client disconnected (loop break).")
                    break

                if not await _safe_send_json(websocket, payload):
                    # Send failed, client likely disconnected
                    break

            except asyncio.CancelledError:
                logger.info("[LIVE] send loop cancelled (shutdown).")
                session_status = "interrupted"
                break
            except Exception as e:
                logger.error(f"[LIVE] send loop error: {e}", exc_info=True)
                session_status = "error"
                error_msg = str(e)
                break

    except asyncio.CancelledError:
        logger.info("[LIVE] websocket handler cancelled (shutdown).")
        session_status = "interrupted"
    except Exception as e:
        logger.error(f"[LIVE] Unexpected error: {e}", exc_info=True)
        session_status = "error"
        error_msg = str(e)
    finally:
        # -----------------------------------------------------
        # ANALYTICS: Finalize live session
        # -----------------------------------------------------
        if live_session:
            finalize_live_session(
                db=db,
                session_id=live_session.session_id,
                sermon_id=sermon_id,
                status=session_status,
                error_message=error_msg
            )
        
        # -----------------------------------------------------
        # CLEANUP — MULTI-CLIENT SAFE
        # -----------------------------------------------------
        with _connected_clients_lock:
            if _connected_clients > 0:
                _connected_clients -= 1
            remaining = _connected_clients
        logger.info(f"[LIVE] client disconnected — remaining_clients={remaining}")

        if remaining <= 0:
            try:
                _shutdown_flag.set()  # Signal ASR thread to stop
                stop_listener()
                logger.info("[LIVE] stop_listener() called (no clients remain).")
            except Exception as e:
                logger.warning(f"[LIVE] stop_listener error: {e}")

        # Close database session
        db.close()

def _get_from_queue_with_timeout():
    """Helper to get from queue with timeout (for use with run_in_executor)."""
    try:
        return _text_q.get(block=True, timeout=1.0)
    except queue.Empty:
        return None
