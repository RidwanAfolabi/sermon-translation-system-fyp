# backend/api/routes/analytics_routes.py
"""
API endpoints for analytics: overview metrics, live performance stats,
retraining data, and activity feed.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, case
from datetime import datetime, timedelta
from typing import Optional, List
from pydantic import BaseModel

from backend.db.session import SessionLocal
from backend.db import models

router = APIRouter(prefix="/analytics", tags=["analytics"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ============================================================================
# Pydantic Response Models
# ============================================================================

class OverviewMetrics(BaseModel):
    """Key metrics for the analytics dashboard."""
    avg_match_score: float
    avg_match_score_change: float  # Percentage change from previous period
    sermons_delivered: int
    sermons_delivered_change: int  # Change from previous period
    total_segments: int
    accuracy_rate: float  # Percentage of approved segments
    accuracy_rate_change: float


class PerformanceMetrics(BaseModel):
    """Translation and live delivery performance metrics."""
    translation_speed: float  # Percentage of segments matched quickly
    theological_accuracy: float  # Based on vetting approval
    vetting_approval_rate: float
    live_delivery_success: float  # Percentage of successful live sessions


class UsageStatistics(BaseModel):
    """Monthly usage statistics."""
    total_uploads: int
    pending_review: int
    approved: int
    needs_revision: int


class ActivityItem(BaseModel):
    """Single activity item for the feed."""
    id: int
    activity_type: str
    title: str
    description: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class RetrainingItem(BaseModel):
    """Data for ML model retraining."""
    id: int
    session_id: str
    sermon_id: int
    sermon_title: str
    event_type: str  # 'skipped' or 'wrong_match'
    segment_order: Optional[int]
    spoken_text: Optional[str]
    alignment_score: Optional[float]
    created_at: datetime


class LiveSessionSummary(BaseModel):
    """Summary of a live session."""
    id: int
    session_id: str
    sermon_id: int
    sermon_title: str
    started_at: datetime
    ended_at: Optional[datetime]
    duration_minutes: Optional[float]
    total_segments: int
    matched_segments: int
    skipped_segments: int
    avg_alignment_score: Optional[float]
    status: str


# ============================================================================
# API Endpoints
# ============================================================================

@router.get("/overview", response_model=OverviewMetrics)
def get_overview_metrics(
    days: int = Query(default=30, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """
    Get key overview metrics for the analytics dashboard.
    Compares current period with previous period of same length.
    """
    now = datetime.utcnow()
    current_start = now - timedelta(days=days)
    previous_start = current_start - timedelta(days=days)
    
    # ---- Average Match Score ----
    current_avg_score = db.query(func.avg(models.LiveSessionLog.alignment_score)).filter(
        models.LiveSessionLog.event_type == 'matched',
        models.LiveSessionLog.created_at >= current_start
    ).scalar() or 0.0
    
    previous_avg_score = db.query(func.avg(models.LiveSessionLog.alignment_score)).filter(
        models.LiveSessionLog.event_type == 'matched',
        models.LiveSessionLog.created_at >= previous_start,
        models.LiveSessionLog.created_at < current_start
    ).scalar() or 0.0
    
    avg_score_change = 0.0
    if previous_avg_score > 0:
        avg_score_change = ((current_avg_score - previous_avg_score) / previous_avg_score) * 100
    
    # ---- Sermons Delivered ----
    current_delivered = db.query(func.count(models.LiveSession.id)).filter(
        models.LiveSession.status == 'completed',
        models.LiveSession.started_at >= current_start
    ).scalar() or 0
    
    previous_delivered = db.query(func.count(models.LiveSession.id)).filter(
        models.LiveSession.status == 'completed',
        models.LiveSession.started_at >= previous_start,
        models.LiveSession.started_at < current_start
    ).scalar() or 0
    
    # ---- Total Segments (current period) ----
    total_segments = db.query(func.count(models.Segment.id)).filter(
        models.Segment.created_at >= current_start
    ).scalar() or 0
    
    # If no segments in current period, show total segments
    if total_segments == 0:
        total_segments = db.query(func.count(models.Segment.id)).scalar() or 0
    
    # ---- Accuracy Rate (vetting approval rate) ----
    approved_count = db.query(func.count(models.Segment.id)).filter(
        models.Segment.status == 'approved',
        models.Segment.updated_at >= current_start
    ).scalar() or 0
    
    reviewed_count = db.query(func.count(models.Segment.id)).filter(
        models.Segment.status.in_(['approved', 'rejected', 'needs_revision']),
        models.Segment.updated_at >= current_start
    ).scalar() or 0
    
    current_accuracy = (approved_count / reviewed_count * 100) if reviewed_count > 0 else 0.0
    
    # Previous period accuracy
    prev_approved = db.query(func.count(models.Segment.id)).filter(
        models.Segment.status == 'approved',
        models.Segment.updated_at >= previous_start,
        models.Segment.updated_at < current_start
    ).scalar() or 0
    
    prev_reviewed = db.query(func.count(models.Segment.id)).filter(
        models.Segment.status.in_(['approved', 'rejected', 'needs_revision']),
        models.Segment.updated_at >= previous_start,
        models.Segment.updated_at < current_start
    ).scalar() or 0
    
    previous_accuracy = (prev_approved / prev_reviewed * 100) if prev_reviewed > 0 else 0.0
    accuracy_change = current_accuracy - previous_accuracy
    
    return OverviewMetrics(
        avg_match_score=round(current_avg_score * 100, 1),  # Convert to percentage
        avg_match_score_change=round(avg_score_change, 1),
        sermons_delivered=current_delivered,
        sermons_delivered_change=current_delivered - previous_delivered,
        total_segments=total_segments,
        accuracy_rate=round(current_accuracy, 1),
        accuracy_rate_change=round(accuracy_change, 1)
    )


@router.get("/performance", response_model=PerformanceMetrics)
def get_performance_metrics(
    days: int = Query(default=30, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """
    Get translation and live delivery performance metrics.
    """
    now = datetime.utcnow()
    start_date = now - timedelta(days=days)
    
    # ---- Translation Speed (% of segments matched above threshold) ----
    # We consider a segment "fast" if alignment score >= 0.7
    total_matched = db.query(func.count(models.LiveSessionLog.id)).filter(
        models.LiveSessionLog.event_type == 'matched',
        models.LiveSessionLog.created_at >= start_date
    ).scalar() or 0
    
    fast_matched = db.query(func.count(models.LiveSessionLog.id)).filter(
        models.LiveSessionLog.event_type == 'matched',
        models.LiveSessionLog.alignment_score >= 0.7,
        models.LiveSessionLog.created_at >= start_date
    ).scalar() or 0
    
    translation_speed = (fast_matched / total_matched * 100) if total_matched > 0 else 0.0
    
    # ---- Theological Accuracy (based on segment status) ----
    # % of segments that are approved (not rejected or needs_revision)
    vetted_segments = db.query(func.count(models.Segment.id)).filter(
        models.Segment.status.in_(['approved', 'rejected', 'needs_revision'])
    ).scalar() or 0
    
    approved_segments = db.query(func.count(models.Segment.id)).filter(
        models.Segment.status == 'approved'
    ).scalar() or 0
    
    theological_accuracy = (approved_segments / vetted_segments * 100) if vetted_segments > 0 else 0.0
    
    # ---- Vetting Approval Rate ----
    # Same as theological accuracy for now
    vetting_approval_rate = theological_accuracy
    
    # ---- Live Delivery Success ----
    total_sessions = db.query(func.count(models.LiveSession.id)).filter(
        models.LiveSession.started_at >= start_date
    ).scalar() or 0
    
    successful_sessions = db.query(func.count(models.LiveSession.id)).filter(
        models.LiveSession.status == 'completed',
        models.LiveSession.started_at >= start_date
    ).scalar() or 0
    
    live_delivery_success = (successful_sessions / total_sessions * 100) if total_sessions > 0 else 0.0
    
    return PerformanceMetrics(
        translation_speed=round(translation_speed, 1),
        theological_accuracy=round(theological_accuracy, 1),
        vetting_approval_rate=round(vetting_approval_rate, 1),
        live_delivery_success=round(live_delivery_success, 1)
    )


@router.get("/usage", response_model=UsageStatistics)
def get_usage_statistics(
    days: int = Query(default=30, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """
    Get monthly usage statistics.
    """
    now = datetime.utcnow()
    start_date = now - timedelta(days=days)
    
    # Total uploads (sermons created in period)
    total_uploads = db.query(func.count(models.Sermon.id)).filter(
        models.Sermon.created_at >= start_date
    ).scalar() or 0
    
    # If no recent uploads, show total
    if total_uploads == 0:
        total_uploads = db.query(func.count(models.Sermon.id)).scalar() or 0
    
    # Segments by status
    pending_review = db.query(func.count(models.Segment.id)).filter(
        models.Segment.status == 'pending'
    ).scalar() or 0
    
    approved = db.query(func.count(models.Segment.id)).filter(
        models.Segment.status == 'approved'
    ).scalar() or 0
    
    needs_revision = db.query(func.count(models.Segment.id)).filter(
        models.Segment.status.in_(['needs_revision', 'rejected'])
    ).scalar() or 0
    
    return UsageStatistics(
        total_uploads=total_uploads,
        pending_review=pending_review,
        approved=approved,
        needs_revision=needs_revision
    )


@router.get("/activity", response_model=List[ActivityItem])
def get_activity_feed(
    limit: int = Query(default=10, le=50, description="Maximum items to return"),
    db: Session = Depends(get_db)
):
    """
    Get recent activity feed items.
    """
    activities = db.query(models.ActivityLog).order_by(
        desc(models.ActivityLog.created_at)
    ).limit(limit).all()
    
    return [
        ActivityItem(
            id=a.id,
            activity_type=a.activity_type,
            title=a.title,
            description=a.description,
            created_at=a.created_at
        )
        for a in activities
    ]


@router.get("/retraining-data", response_model=List[RetrainingItem])
def get_retraining_data(
    event_type: Optional[str] = Query(default=None, description="Filter by event type: skipped, wrong_match"),
    limit: int = Query(default=100, le=500, description="Maximum items to return"),
    db: Session = Depends(get_db)
):
    """
    Get data for ML model retraining: skipped segments and wrong matches.
    """
    query = db.query(
        models.LiveSessionLog,
        models.Sermon.title.label('sermon_title')
    ).join(
        models.Sermon, models.LiveSessionLog.sermon_id == models.Sermon.id
    ).filter(
        models.LiveSessionLog.event_type.in_(['skipped', 'wrong_match'])
    )
    
    if event_type:
        query = query.filter(models.LiveSessionLog.event_type == event_type)
    
    query = query.order_by(desc(models.LiveSessionLog.created_at)).limit(limit)
    results = query.all()
    
    return [
        RetrainingItem(
            id=log.id,
            session_id=log.session_id,
            sermon_id=log.sermon_id,
            sermon_title=sermon_title,
            event_type=log.event_type,
            segment_order=log.segment_order,
            spoken_text=log.spoken_text,
            alignment_score=log.alignment_score,
            created_at=log.created_at
        )
        for log, sermon_title in results
    ]


@router.get("/live-sessions", response_model=List[LiveSessionSummary])
def get_live_sessions(
    status: Optional[str] = Query(default=None, description="Filter by status: active, completed, error"),
    limit: int = Query(default=20, le=100, description="Maximum items to return"),
    db: Session = Depends(get_db)
):
    """
    Get list of live sessions with summaries.
    """
    query = db.query(
        models.LiveSession,
        models.Sermon.title.label('sermon_title')
    ).join(
        models.Sermon, models.LiveSession.sermon_id == models.Sermon.id
    )
    
    if status:
        query = query.filter(models.LiveSession.status == status)
    
    query = query.order_by(desc(models.LiveSession.started_at)).limit(limit)
    results = query.all()
    
    sessions = []
    for session, sermon_title in results:
        duration = None
        if session.started_at and session.ended_at:
            duration = (session.ended_at - session.started_at).total_seconds() / 60
        
        sessions.append(LiveSessionSummary(
            id=session.id,
            session_id=session.session_id,
            sermon_id=session.sermon_id,
            sermon_title=sermon_title,
            started_at=session.started_at,
            ended_at=session.ended_at,
            duration_minutes=round(duration, 1) if duration else None,
            total_segments=session.total_segments or 0,
            matched_segments=session.matched_segments or 0,
            skipped_segments=session.skipped_segments or 0,
            avg_alignment_score=round(session.avg_alignment_score, 3) if session.avg_alignment_score else None,
            status=session.status
        ))
    
    return sessions


@router.get("/dashboard")
def get_dashboard_data(
    days: int = Query(default=30, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """
    Get all dashboard data in a single call for efficiency.
    """
    overview = get_overview_metrics(days, db)
    performance = get_performance_metrics(days, db)
    usage = get_usage_statistics(days, db)
    activity = get_activity_feed(limit=4, db=db)
    
    return {
        "overview": overview,
        "performance": performance,
        "usage": usage,
        "activity": activity
    }
