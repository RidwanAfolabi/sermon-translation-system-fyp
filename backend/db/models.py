# backend/db/models.py
"""SQLAlchemy ORM models for the system"""

from sqlalchemy import Column, Integer, String, Text, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.sql import func
from backend.db.session import Base

class Sermon(Base):
    __tablename__ = "sermons"
    sermon_id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    speaker = Column(String(150))
    date_uploaded = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String(32), default="draft")  # draft, translated, vetted, ready

class Segment(Base):
    __tablename__ = "segments"
    segment_id = Column(Integer, primary_key=True, index=True)
    sermon_id = Column(Integer, ForeignKey("sermons.sermon_id", ondelete="CASCADE"), nullable=False, index=True)
    segment_order = Column(Integer, nullable=False, index=True)
    malay_text = Column(Text, nullable=False)
    english_text = Column(Text)
    confidence_score = Column(Float)
    is_vetted = Column(Boolean, default=False)
    last_reviewed_by = Column(String(150))
    last_reviewed_date = Column(DateTime(timezone=True))
    
class Log(Base):
    __tablename__ = "logs"
    log_id = Column(Integer, primary_key=True, index=True)
    sermon_id = Column(Integer, ForeignKey("sermons.sermon_id", ondelete="CASCADE"), nullable=False, index=True)
    segment_id = Column(Integer, ForeignKey("segments.segment_id", ondelete="SET NULL"))
    session_id = Column(String(100))
    event_time = Column(DateTime(timezone=True), server_default=func.now())
    alignment_confidence = Column(Float)
    display_time_seconds = Column(Float)
    flag = Column(String(32))
