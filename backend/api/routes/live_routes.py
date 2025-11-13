# backend/api/routes/live_routes.py
"""
Live subtitle streaming route.
Real-time subtitle delivery for the Friday khutbah service.
"""

import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from backend.db.session import SessionLocal
from backend.api.utils import db_utils
from ml_pipeline.alignment_module.speech_listener import listen_and_transcribe
from ml_pipeline.alignment_module.aligner import match_spoken_to_segment

router = APIRouter()

@router.websocket("/stream")
async def live_stream(websocket: WebSocket):
    await websocket.accept()
    params = dict(websocket.query_params)
    sermon_id = int(params.get("sermon_id", 0))

    print(f"✅ Live speech alignment started for sermon {sermon_id}")

    with SessionLocal() as db:
        segments = db_utils.list_segments_for_sermon(db, sermon_id)

    try:
        batch = []
        for spoken_chunk in listen_and_transcribe():
            seg, score = match_spoken_to_segment(spoken_chunk, segments)
            if not seg or score < 0.6:
                continue

            english_text = seg.english_text or ""
            batch.append(english_text)
            await websocket.send_json({
                "english_text": english_text,
                "segment_id": seg.segment_id,
                "similarity": round(score, 2)
            })

            # After ~5 sentences, clear and start new batch
            if len(batch) >= 5:
                await websocket.send_json({"status": "batch_reset"})
                batch.clear()

            await asyncio.sleep(0.5)  # short delay between detected chunks

    except WebSocketDisconnect:
        print(f"❌ Client disconnected from sermon {sermon_id}")
