# backend/api/routes/sermon_routes.py
"""
API endpoints for sermon management: upload, list, get sermon and segments.
"""

from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
import csv, io
from backend.db.session import SessionLocal, engine
from backend.db import models
from backend.api.utils import db_utils

router = APIRouter()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/upload")
async def upload_sermon(
    title: str = Form(...),
    speaker: str = Form(None),
    file: UploadFile = File(...),
    auto_segment: bool = Form(False),
    db: Session = Depends(get_db)
):
    """
    Upload a sermon script (text or CSV).
    - If CSV: expects columns [segment_order, malay_text]
    - If plain text + auto_segment=True: automatically split into segments
    """
    # Create sermon metadata row
    sermon = db_utils.create_sermon(db, title=title, speaker=speaker)

    # Read file content safely
    contents = await file.read()
    try:
        text_data = contents.decode("utf-8")
    except Exception:
        text_data = contents.decode("latin-1")

    inserted = 0

    # --- CASE 1: CSV Upload ---
    if file.filename.lower().endswith(".csv") and not auto_segment:
        reader = csv.reader(io.StringIO(text_data))
        for row in reader:
            if not row:
                continue
            try:
                order = int(row[0])
                malay_text = row[1]
                db_utils.create_segment(db, sermon_id=sermon.sermon_id, order=order, malay_text=malay_text)
                inserted += 1
            except Exception:
                continue

    # --- CASE 2: Plain Text Upload (Auto-Segmentation) ---
    else:
        from ml_pipeline.alignment_module.segmenter import segment_text
        segments = segment_text(text_data)
        for idx, seg in enumerate(segments, start=1):
            db_utils.create_segment(db, sermon_id=sermon.sermon_id, order=idx, malay_text=seg)
            inserted += 1

        # Optional: update sermon status
        sermon.status = "segmented"
        db.commit()

    return {
        "sermon_id": sermon.sermon_id,
        "inserted_segments": inserted,
        "auto_segmented": auto_segment or not file.filename.lower().endswith(".csv")
    }


@router.get("/{sermon_id}")
def get_sermon(sermon_id: int, db: Session = Depends(get_db)):
    sermon = db_utils.get_sermon(db, sermon_id)
    if not sermon:
        raise HTTPException(status_code=404, detail="Sermon not found")
    segments = db_utils.list_segments_for_sermon(db, sermon_id)
    return {
        "sermon": {
            "sermon_id": sermon.sermon_id,
            "title": sermon.title,
            "speaker": sermon.speaker,
            "status": sermon.status
        },
        "segments": [
            {"segment_id": s.segment_id, "order": s.segment_order, "malay_text": s.malay_text, "is_vetted": s.is_vetted}
            for s in segments
        ]
    }

