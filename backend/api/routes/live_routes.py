# backend/api/routes/live_routes.py
"""
Live subtitle streaming route.
Real-time subtitle delivery for the Friday khutbah service.
"""

import asyncio
import threading
import queue
import logging
from fastapi import APIRouter, WebSocket, HTTPException
from sqlalchemy.orm import Session
from backend.db.session import SessionLocal
from backend.db import models
from ml_pipeline.speech_recognition.whisper_listener import listen_and_transcribe, stop_listener
from ml_pipeline.alignment_module.aligner import match_spoken_to_segment
from starlette.websockets import WebSocketState  # ADD

logger = logging.getLogger(__name__)
router = APIRouter()

_text_q: "queue.Queue[str]" = queue.Queue(maxsize=32)

def _asr_worker():
    for txt in listen_and_transcribe():
        try:
            _text_q.put_nowait(txt)
        except queue.Full:
            pass

def _is_open(ws: WebSocket) -> bool:
    return ws.application_state != WebSocketState.DISCONNECTED

@router.websocket("/stream")
async def live_stream(websocket: WebSocket, sermon_id: int):
    await websocket.accept()
    db: Session = SessionLocal()
    try:
        sermon = db.query(models.Sermon).filter(models.Sermon.sermon_id == sermon_id).first()
        if not sermon:
            await websocket.send_text("Sermon not found.")
            if _is_open(websocket):
                await websocket.close()
            return
        segments = db.query(models.Segment).filter(models.Segment.sermon_id == sermon_id)\
            .order_by(models.Segment.segment_order.asc()).all()
        await websocket.send_json({"status": "started", "sermon_id": sermon_id, "segments_loaded": len(segments)})

        threading.Thread(target=_asr_worker, daemon=True).start()
        dynamic_thresh = 0.55
        miss_streak = 0

        while True:
            try:
                spoken = await asyncio.get_event_loop().run_in_executor(None, _text_q.get)
            except Exception as e:
                logger.error(f"[LIVE] queue error: {e}")
                break

            try:
                seg, score, cand_id, cand_order = match_spoken_to_segment(spoken, segments, min_score=dynamic_thresh)
                matched = bool(seg)
                if matched:
                    miss_streak = 0
                    dynamic_thresh = min(0.60, dynamic_thresh + 0.01)
                else:
                    miss_streak += 1
                    if miss_streak >= 3:
                        dynamic_thresh = max(0.50, dynamic_thresh - 0.02)

                if not _is_open(websocket):
                    break

                await websocket.send_json({
                    "spoken": spoken,
                    "score": score,
                    "matched": matched,
                    "segment": None if not matched else {
                        "segment_id": seg.segment_id,
                        "order": seg.segment_order,
                        "malay_text": seg.malay_text,
                        "english_text": seg.english_text
                    },
                    "candidate": {
                        "segment_id": cand_id,
                        "order": cand_order
                    },
                    "threshold": round(dynamic_thresh, 3)
                })
            except Exception as e:
                logger.error(f"[LIVE] send error: {e}")
                break
    finally:
        stop_listener()
        db.close()
        if _is_open(websocket):
            await websocket.close()
        logger.info(f"[LIVE] closed sermon_id={sermon_id}")
        logger.info(f"[LIVE] WebSocket accepted sermon_id={sermon_id}")
