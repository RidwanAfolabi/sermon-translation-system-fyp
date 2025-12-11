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

from fastapi import APIRouter, Form, Depends, HTTPException, Body
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


# -------------------------------------------------------------------
# Bulk Vetting Endpoint
# -------------------------------------------------------------------
# Keep both prefixed and unprefixed routes for compatibility with frontend calls.
@router.post("/translation/vet_segments_bulk")
@router.post("/vet_segments_bulk")
def vet_segments_bulk(
    payload: dict = Body(...),
    db: Session = Depends(get_db),
):
    """
    Bulk vet multiple segments at once.

    Expected payload:
    {
      "segments": [
         {"segment_id": 123, "english_text": "optional override"},
         ...
      ],
      "reviewer": "Reviewer Name",
      "update_text": false  # if true, english_text overrides existing text
    }
    """

    segments_payload = payload.get("segments") or []
    reviewer = payload.get("reviewer")
    update_text = bool(payload.get("update_text", False))

    if not reviewer:
        raise HTTPException(status_code=400, detail="Reviewer is required")
    if not segments_payload:
        raise HTTPException(status_code=400, detail="No segments provided")

    updated_ids = []
    touched_sermon_ids = set()

    try:
        for item in segments_payload:
            seg_id = item.get("segment_id")
            if not seg_id:
                continue
            seg = db.query(models.Segment).filter(models.Segment.segment_id == seg_id).first()
            if not seg:
                continue

            text_override = item.get("english_text")
            if update_text and text_override is not None:
                seg.english_text = text_override

            # Ensure we do not vet empty translations
            if not seg.english_text:
                continue

            seg.is_vetted = True
            seg.last_reviewed_by = reviewer
            seg.last_reviewed_date = datetime.utcnow()
            touched_sermon_ids.add(seg.sermon_id)
            updated_ids.append(seg.segment_id)

        # If all segments for a sermon are vetted, mark the sermon as vetted for dashboard accuracy.
        for sermon_id in touched_sermon_ids:
            remaining = db.query(models.Segment).filter(
                models.Segment.sermon_id == sermon_id,
                models.Segment.is_vetted == False,
            ).count()
            if remaining == 0:
                sermon_row = db.query(models.Sermon).filter(models.Sermon.sermon_id == sermon_id).first()
                if sermon_row:
                    sermon_row.status = "vetted"

        db.commit()
    except Exception as e:
        db.rollback()
        logger.exception("Error during bulk vetting operation")
        raise HTTPException(status_code=500, detail="Bulk vetting failed due to a server error.")

    return {
        "status": "vetted",
        "count": len(updated_ids),
        "segment_ids": updated_ids,
        "reviewer": reviewer,
    }
