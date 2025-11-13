# Database utility functions
# backend/api/utils/db_utils.py
"""
Helper functions for simple DB operations used by the API routes.
"""

from sqlalchemy.orm import Session
from backend.db import models
from typing import List

def create_sermon(db: Session, title: str, speaker: str = None):
    new = models.Sermon(title=title, speaker=speaker)
    db.add(new)
    db.commit()
    db.refresh(new)
    return new

def get_sermon(db: Session, sermon_id: int):
    return db.query(models.Sermon).filter(models.Sermon.sermon_id == sermon_id).first()

def create_segment(db: Session, sermon_id: int, order: int, malay_text: str, english_text: str = None, confidence: float = None):
    seg = models.Segment(
        sermon_id=sermon_id,
        segment_order=order,
        malay_text=malay_text,
        english_text=english_text,
        confidence_score=confidence
    )
    db.add(seg)
    db.commit()
    db.refresh(seg)
    return seg

def list_segments_for_sermon(db: Session, sermon_id: int) -> List[models.Segment]:
    return db.query(models.Segment).filter(models.Segment.sermon_id == sermon_id).order_by(models.Segment.segment_order).all()
