# backend/db/models.py
"""
SQLAlchemy ORM models for the Sermon Translation System.

Tables:
- Sermon: Sermon metadata and status
- Segment: Individual text segments with translations
- Log: General system logs
- LiveSession: Tracks complete live streaming sessions
- LiveSessionLog: Tracks individual events during live sessions (matches, skips, errors)
- VettingHistory: Tracks segment review decisions for quality metrics
- ActivityLog: Tracks user/system activities for the activity feed
"""

from sqlalchemy import Column, Integer, String, Text, Float, Boolean, ForeignKey, DateTime, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.db.session import Base


# =============================================================================
# CORE TABLES
# =============================================================================

class Sermon(Base):
    """
    Stores sermon metadata.
    Status flow: draft -> uploaded_raw -> segmented -> translated -> vetted -> delivered
    """
    __tablename__ = "sermons"
    
    sermon_id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    speaker = Column(String(150))
    date_uploaded = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String(32), default="draft")
    raw_text = Column(Text, nullable=True)
    
    # Delivery tracking
    delivered_count = Column(Integer, default=0)
    last_delivered_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    segments = relationship("Segment", back_populates="sermon", cascade="all, delete-orphan")
    live_sessions = relationship("LiveSession", back_populates="sermon", cascade="all, delete-orphan")


class Segment(Base):
    """
    Stores individual text segments with translations.
    Each sermon is divided into multiple segments for alignment.
    """
    __tablename__ = "segments"
    
    segment_id = Column(Integer, primary_key=True, index=True)
    sermon_id = Column(Integer, ForeignKey("sermons.sermon_id", ondelete="CASCADE"), nullable=False, index=True)
    segment_order = Column(Integer, nullable=False, index=True)
    malay_text = Column(Text, nullable=False)
    english_text = Column(Text, nullable=True)
    confidence_score = Column(Float, nullable=True)
    
    # Vetting status
    is_vetted = Column(Boolean, default=False)
    needs_revision = Column(Boolean, default=False)
    revision_notes = Column(Text, nullable=True)
    vetted_by = Column(String(150), nullable=True)
    vetted_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    sermon = relationship("Sermon", back_populates="segments")


class Log(Base):
    """General system logs for debugging and monitoring."""
    __tablename__ = "logs"
    
    id = Column(Integer, primary_key=True, index=True)
    sermon_id = Column(Integer, ForeignKey("sermons.sermon_id", ondelete="CASCADE"), nullable=True, index=True)
    level = Column(String(16), default="INFO")
    message = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# =============================================================================
# LIVE SESSION TRACKING TABLES
# =============================================================================

class LiveSession(Base):
    """
    Tracks complete live streaming sessions.
    Created when a live session starts, updated with aggregated stats when it ends.
    Used for: Live Delivery Success rate, Sermons Delivered count
    """
    __tablename__ = "live_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), unique=True, nullable=False, index=True)
    sermon_id = Column(Integer, ForeignKey("sermons.sermon_id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Timing
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    ended_at = Column(DateTime(timezone=True), nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    
    # Aggregated statistics (computed when session ends)
    total_segments_matched = Column(Integer, default=0)
    total_segments_skipped = Column(Integer, default=0)
    total_wrong_matches = Column(Integer, default=0)
    total_manual_overrides = Column(Integer, default=0)
    avg_match_score = Column(Float, nullable=True)
    min_match_score = Column(Float, nullable=True)
    max_match_score = Column(Float, nullable=True)
    
    # Session status: 'active', 'completed', 'interrupted', 'error'
    status = Column(String(32), default="active")
    error_message = Column(Text, nullable=True)
    
    # Relationships
    sermon = relationship("Sermon", back_populates="live_sessions")
    events = relationship("LiveSessionLog", back_populates="session", cascade="all, delete-orphan")
    
    # Indexes for common queries
    __table_args__ = (
        Index('idx_live_sessions_status', 'status'),
        Index('idx_live_sessions_started_at', 'started_at'),
    )


class LiveSessionLog(Base):
    """
    Tracks individual events during live sessions.
    
    Event types:
    - 'matched': Successful alignment (spoken -> segment)
    - 'skipped': Segment(s) were skipped during live playback
    - 'wrong_match': User flagged a match as incorrect
    - 'manual_override': User manually selected a different segment
    - 'low_confidence': Match below threshold but shown anyway
    
    Used for: 
    - Avg Match Score calculation
    - Skipped segments report (for retraining)
    - Wrong matches report (for retraining)
    - Live session analytics
    """
    __tablename__ = "live_session_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), ForeignKey("live_sessions.session_id", ondelete="CASCADE"), nullable=False, index=True)
    sermon_id = Column(Integer, ForeignKey("sermons.sermon_id", ondelete="CASCADE"), nullable=False, index=True)
    segment_id = Column(Integer, ForeignKey("segments.segment_id", ondelete="SET NULL"), nullable=True, index=True)
    
    # Event details
    event_type = Column(String(32), nullable=False, index=True)  # matched, skipped, wrong_match, manual_override
    
    # ASR and alignment data
    spoken_text = Column(Text, nullable=True)  # What ASR captured
    matched_segment_order = Column(Integer, nullable=True)  # Which segment was matched
    alignment_score = Column(Float, nullable=True)  # Match confidence score (0.0 - 1.0)
    threshold_used = Column(Float, nullable=True)  # Threshold at time of match
    
    # For skipped segments
    skipped_from_order = Column(Integer, nullable=True)  # Start of skipped range
    skipped_to_order = Column(Integer, nullable=True)  # End of skipped range
    skipped_count = Column(Integer, nullable=True)  # Number of segments skipped
    
    # For wrong matches / corrections
    expected_segment_id = Column(Integer, nullable=True)  # If user corrected, what was correct
    expected_segment_order = Column(Integer, nullable=True)
    correction_notes = Column(Text, nullable=True)  # User's note about the error
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    session = relationship("LiveSession", back_populates="events")
    
    # Indexes for analytics queries
    __table_args__ = (
        Index('idx_live_session_logs_event_type', 'event_type'),
        Index('idx_live_session_logs_created_at', 'created_at'),
        Index('idx_live_session_logs_session_event', 'session_id', 'event_type'),
    )


# =============================================================================
# VETTING & ACTIVITY TRACKING TABLES
# =============================================================================

class VettingHistory(Base):
    """
    Tracks segment review decisions for quality metrics.
    
    Actions:
    - 'approved': Segment translation approved
    - 'rejected': Segment translation rejected
    - 'edited': Segment translation was edited
    - 'revision_requested': Flagged for revision
    
    Used for: Vetting Approval Rate, Accuracy Rate, Quality metrics
    """
    __tablename__ = "vetting_history"
    
    id = Column(Integer, primary_key=True, index=True)
    segment_id = Column(Integer, ForeignKey("segments.segment_id", ondelete="CASCADE"), nullable=False, index=True)
    sermon_id = Column(Integer, ForeignKey("sermons.sermon_id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Action details
    action = Column(String(32), nullable=False, index=True)  # approved, rejected, edited, revision_requested
    
    # For edits - track changes
    previous_english_text = Column(Text, nullable=True)
    new_english_text = Column(Text, nullable=True)
    
    # Reviewer info
    reviewer_notes = Column(Text, nullable=True)
    reviewed_by = Column(String(150), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Indexes
    __table_args__ = (
        Index('idx_vetting_history_action', 'action'),
        Index('idx_vetting_history_created_at', 'created_at'),
    )


class ActivityLog(Base):
    """
    Tracks user/system activities for the Recent Activity feed.
    
    Event types:
    - 'sermon_uploaded': New sermon uploaded
    - 'sermon_segmented': Sermon split into segments
    - 'translation_completed': Translation finished
    - 'vetting_completed': Vetting finished
    - 'sermon_approved': Sermon fully approved
    - 'live_session_started': Live session began
    - 'live_session_completed': Live session finished
    - 'segment_edited': Segment was edited
    
    Used for: Recent Activity feed, System monitoring
    """
    __tablename__ = "activity_log"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Event classification
    event_type = Column(String(50), nullable=False, index=True)
    
    # Related entities (nullable - not all events relate to sermons)
    sermon_id = Column(Integer, ForeignKey("sermons.sermon_id", ondelete="SET NULL"), nullable=True, index=True)
    segment_id = Column(Integer, ForeignKey("segments.segment_id", ondelete="SET NULL"), nullable=True)
    session_id = Column(String(100), nullable=True)
    
    # Event display info
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Additional context (JSON-like string for flexibility)
    extra_data = Column(Text, nullable=True)  # Store as JSON string
    
    # Actor
    actor = Column(String(150), nullable=True)  # Username or 'system'
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Indexes
    __table_args__ = (
        Index('idx_activity_log_event_type', 'event_type'),
        Index('idx_activity_log_created_at', 'created_at'),
    )

