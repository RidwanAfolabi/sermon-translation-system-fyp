# backend/api/routes/translation_routes.py
"""
Translation endpoints for the Sermon Translation System.

Endpoints:
- POST /translate_start : Run translation pipeline on stored Malay segments (machine translation)
- POST /vet_segment : Allow human reviewers to vet or correct translated English text
"""

import logging
from typing import List
from datetime import datetime  # added this

from fastapi import APIRouter, Form, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.db.session import SessionLocal
from backend.db import models
from backend.api.utils import db_utils
from ml_pipeline.translation_model.inference import translate_text_batch

# -------------------------------------------------------------------
# Setup
# -------------------------------------------------------------------
router = APIRouter()
logger = logging.getLogger(__name__)

# Dependency to get a database session
def get_db():
    with SessionLocal() as db:
        yield db


# -------------------------------------------------------------------
# Translation Endpoint
# -------------------------------------------------------------------
@router.post("/translate_start")
def translate_start(sermon_id: int = Form(...), db: Session = Depends(get_db)):
    """
    Translate all untranslated segments for a sermon using the MT pipeline (batch).
    Fetches all Malay text segments, runs batch translation, and stores results
    (English text + confidence score).
    """
    segments: List[models.Segment] = db_utils.list_segments_for_sermon(db, sermon_id)
    if not segments:
        raise HTTPException(status_code=404, detail="No segments found for this sermon.")

    logger.info(f"Starting translation for sermon_id={sermon_id}, segments={len(segments)}")

    # Extract Malay text content
    malay_texts = [s.malay_text for s in segments]

    # Call translation inference (stubbed model or API)
    translations = translate_text_batch(malay_texts)  # [{'text':..., 'confidence':...}]

    # Update database records
    for s, t in zip(segments, translations):
        s.english_text = t["text"]
        s.confidence_score = t["confidence"]

    db.commit()
    logger.info(f"Translation completed for sermon_id={sermon_id} ({len(translations)} segments).")

    return {
        "status": "success",
        "translated_count": len(translations),
        "sermon_id": sermon_id,
    }


# -------------------------------------------------------------------
# Vetting Endpoint
# -------------------------------------------------------------------
@router.post("/vet_segment")
def vet_segment(
    segment_id: int = Form(...),
    english_text: str = Form(...),
    reviewer: str = Form(...),
    db: Session = Depends(get_db),
):
    """
    Human vetting: reviewer provides corrected/approved English text for a segment.
    Updates `is_vetted`, `english_text`, and reviewer info.
    """
    seg = db.query(models.Segment).filter(models.Segment.segment_id == segment_id).first()
    if not seg:
        raise HTTPException(status_code=404, detail="Segment not found.")

    seg.english_text = english_text
    seg.is_vetted = True
    seg.last_reviewed_by = reviewer
    seg.last_reviewed_date = datetime.utcnow()   # <-- record timestamp

    db.commit()
    logger.info(f"Segment {segment_id} vetted by {reviewer} at {seg.last_reviewed_date}.")

    return {
        "status": "vetted",
        "segment_id": segment_id,
        "reviewer": reviewer,
        "reviewed_at": seg.last_reviewed_date,
    }
