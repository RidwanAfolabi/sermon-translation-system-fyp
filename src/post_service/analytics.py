"""Analytics module for Post-Service phase."""

import logging
import pandas as pd
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from ..common.database import Database, PerformanceLog, Translation, AlignmentSegment


class AnalyticsEngine:
    """Analytics engine for performance analysis."""
    
    def __init__(self, database: Database):
        """
        Initialize analytics engine.
        
        Args:
            database: Database instance
        """
        self.logger = logging.getLogger(__name__)
        self.db = database
    
    def log_metric(
        self,
        sermon_id: str,
        phase: str,
        metric_type: str,
        metric_value: float,
        metadata: Optional[Dict] = None
    ):
        """
        Log a performance metric.
        
        Args:
            sermon_id: Sermon identifier
            phase: Phase ('pre', 'live', 'post')
            metric_type: Type of metric
            metric_value: Metric value
            metadata: Optional metadata dictionary
        """
        session = self.db.get_session()
        try:
            log = PerformanceLog(
                sermon_id=sermon_id,
                phase=phase,
                metric_type=metric_type,
                metric_value=metric_value,
                metric_metadata=metadata
            )
            
            session.add(log)
            session.commit()
            
            self.logger.info(
                f"Logged metric: {phase}/{metric_type} = {metric_value} for {sermon_id}"
            )
            
        finally:
            session.close()
    
    def calculate_translation_accuracy(self, sermon_id: str) -> Dict:
        """
        Calculate translation accuracy metrics.
        
        Args:
            sermon_id: Sermon identifier
            
        Returns:
            Dictionary of accuracy metrics
        """
        session = self.db.get_session()
        try:
            translation = session.query(Translation).filter_by(
                sermon_id=sermon_id
            ).first()
            
            if not translation:
                return {'error': 'Translation not found'}
            
            # Calculate accuracy metrics
            accuracy = {
                'translation_confidence': translation.translation_confidence,
                'approval_score': translation.approval_score,
                'expert_approved': translation.expert_approved,
                'has_corrections': translation.expert_corrections is not None
            }
            
            if translation.expert_corrections:
                # Calculate correction rate (simplified)
                original_words = len(translation.translated_text.split())
                correction_length = len(translation.expert_corrections.split())
                accuracy['correction_rate'] = abs(correction_length - original_words) / original_words
            else:
                accuracy['correction_rate'] = 0.0
            
            return accuracy
            
        finally:
            session.close()
    
    def calculate_timing_precision(self, sermon_id: str) -> Dict:
        """
        Calculate timing and alignment precision.
        
        Args:
            sermon_id: Sermon identifier
            
        Returns:
            Dictionary of timing metrics
        """
        session = self.db.get_session()
        try:
            segments = session.query(AlignmentSegment).filter_by(
                sermon_id=sermon_id
            ).all()
            
            if not segments:
                return {'error': 'No alignment segments found'}
            
            # Calculate timing metrics
            confidences = [s.confidence for s in segments if s.confidence]
            durations = [s.end_time - s.start_time for s in segments]
            
            metrics = {
                'total_segments': len(segments),
                'average_confidence': sum(confidences) / len(confidences) if confidences else 0.0,
                'average_duration': sum(durations) / len(durations) if durations else 0.0,
                'min_confidence': min(confidences) if confidences else 0.0,
                'max_confidence': max(confidences) if confidences else 0.0
            }
            
            return metrics
            
        finally:
            session.close()
    
    def generate_sermon_report(self, sermon_id: str) -> Dict:
        """
        Generate comprehensive report for a sermon.
        
        Args:
            sermon_id: Sermon identifier
            
        Returns:
            Complete sermon report dictionary
        """
        accuracy = self.calculate_translation_accuracy(sermon_id)
        timing = self.calculate_timing_precision(sermon_id)
        
        # Get all logged metrics
        session = self.db.get_session()
        try:
            logs = session.query(PerformanceLog).filter_by(
                sermon_id=sermon_id
            ).all()
            
            metrics_by_phase = {
                'pre': [],
                'live': [],
                'post': []
            }
            
            for log in logs:
                metrics_by_phase[log.phase].append({
                    'metric_type': log.metric_type,
                    'value': log.metric_value,
                    'timestamp': log.timestamp
                })
            
            return {
                'sermon_id': sermon_id,
                'accuracy_metrics': accuracy,
                'timing_metrics': timing,
                'performance_logs': metrics_by_phase,
                'report_generated': datetime.utcnow().isoformat()
            }
            
        finally:
            session.close()
    
    def get_aggregate_statistics(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict:
        """
        Get aggregate statistics across all sermons.
        
        Args:
            start_date: Optional start date for filtering
            end_date: Optional end date for filtering
            
        Returns:
            Aggregate statistics dictionary
        """
        session = self.db.get_session()
        try:
            # Query translations
            query = session.query(Translation)
            
            if start_date:
                query = query.filter(Translation.created_at >= start_date)
            if end_date:
                query = query.filter(Translation.created_at <= end_date)
            
            translations = query.all()
            
            if not translations:
                return {'message': 'No data available'}
            
            # Calculate aggregate metrics
            total_sermons = len(translations)
            approved_sermons = sum(1 for t in translations if t.expert_approved)
            
            avg_translation_confidence = sum(
                t.translation_confidence for t in translations
            ) / total_sermons
            
            approved_with_score = [t for t in translations if t.approval_score]
            avg_approval_score = (
                sum(t.approval_score for t in approved_with_score) / len(approved_with_score)
                if approved_with_score else 0.0
            )
            
            corrections_count = sum(
                1 for t in translations if t.expert_corrections
            )
            
            return {
                'total_sermons': total_sermons,
                'approved_sermons': approved_sermons,
                'approval_rate': approved_sermons / total_sermons,
                'average_translation_confidence': avg_translation_confidence,
                'average_approval_score': avg_approval_score,
                'correction_rate': corrections_count / total_sermons,
                'period': {
                    'start': start_date.isoformat() if start_date else 'all',
                    'end': end_date.isoformat() if end_date else 'all'
                }
            }
            
        finally:
            session.close()
    
    def identify_improvement_areas(self) -> List[Dict]:
        """
        Identify areas for improvement based on analytics.
        
        Returns:
            List of improvement recommendations
        """
        stats = self.get_aggregate_statistics()
        recommendations = []
        
        # Check approval rate
        if stats.get('approval_rate', 1.0) < 0.8:
            recommendations.append({
                'area': 'Translation Quality',
                'priority': 'High',
                'issue': f"Low approval rate: {stats['approval_rate']:.1%}",
                'suggestion': 'Consider retraining MT model with more domain-specific data'
            })
        
        # Check correction rate
        if stats.get('correction_rate', 0.0) > 0.3:
            recommendations.append({
                'area': 'Translation Accuracy',
                'priority': 'Medium',
                'issue': f"High correction rate: {stats['correction_rate']:.1%}",
                'suggestion': 'Analyze common correction patterns for targeted improvement'
            })
        
        # Check confidence scores
        if stats.get('average_translation_confidence', 1.0) < 0.7:
            recommendations.append({
                'area': 'Model Confidence',
                'priority': 'Medium',
                'issue': f"Low average confidence: {stats['average_translation_confidence']:.2f}",
                'suggestion': 'Consider fine-tuning model or improving input quality'
            })
        
        return recommendations
