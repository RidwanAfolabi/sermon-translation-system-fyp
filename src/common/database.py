"""Database models for the sermon translation system."""

from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

Base = declarative_base()


class Translation(Base):
    """Store sermon translations."""
    __tablename__ = 'translations'
    
    id = Column(Integer, primary_key=True)
    sermon_id = Column(String(100), unique=True, nullable=False)
    source_text = Column(Text, nullable=False)
    translated_text = Column(Text, nullable=False)
    translation_confidence = Column(Float)
    expert_approved = Column(Boolean, default=False)
    approval_score = Column(Float)
    expert_corrections = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    approved_at = Column(DateTime)
    
    def __repr__(self):
        return f"<Translation(sermon_id='{self.sermon_id}', approved={self.expert_approved})>"


class AlignmentSegment(Base):
    """Store speech alignment segments."""
    __tablename__ = 'alignment_segments'
    
    id = Column(Integer, primary_key=True)
    sermon_id = Column(String(100), nullable=False)
    segment_index = Column(Integer, nullable=False)
    start_time = Column(Float, nullable=False)
    end_time = Column(Float, nullable=False)
    source_text = Column(Text, nullable=False)
    subtitle_text = Column(Text, nullable=False)
    confidence = Column(Float)
    displayed = Column(Boolean, default=False)
    display_timestamp = Column(DateTime)
    
    def __repr__(self):
        return f"<AlignmentSegment(sermon_id='{self.sermon_id}', segment={self.segment_index})>"


class PerformanceLog(Base):
    """Log performance metrics for analysis."""
    __tablename__ = 'performance_logs'
    
    id = Column(Integer, primary_key=True)
    sermon_id = Column(String(100), nullable=False)
    phase = Column(String(50), nullable=False)  # 'pre', 'live', 'post'
    metric_type = Column(String(50), nullable=False)
    metric_value = Column(Float)
    metric_metadata = Column(JSON)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<PerformanceLog(sermon_id='{self.sermon_id}', metric='{self.metric_type}')>"


class Database:
    """Database management class."""
    
    def __init__(self, connection_string: str):
        self.engine = create_engine(connection_string)
        Base.metadata.create_all(self.engine)
        self.Session = sessionmaker(bind=self.engine)
    
    def get_session(self):
        """Get a new database session."""
        return self.Session()
    
    def close(self):
        """Close the database connection."""
        self.engine.dispose()
