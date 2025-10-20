"""Expert vetting interface for Pre-Service phase."""

import logging
from typing import Dict, List, Optional
from datetime import datetime
from ..common.database import Database, Translation


class VettingSystem:
    """System for expert vetting of translations."""
    
    def __init__(self, database: Database, min_approval_score: float = 0.8):
        """
        Initialize the vetting system.
        
        Args:
            database: Database instance
            min_approval_score: Minimum score for approval
        """
        self.logger = logging.getLogger(__name__)
        self.db = database
        self.min_approval_score = min_approval_score
    
    def submit_for_vetting(
        self,
        sermon_id: str,
        source_text: str,
        translated_text: str,
        translation_confidence: float
    ) -> int:
        """
        Submit a translation for expert vetting.
        
        Args:
            sermon_id: Unique sermon identifier
            source_text: Original Malay text
            translated_text: Translated English text
            translation_confidence: Confidence score from MT model
            
        Returns:
            Translation record ID
        """
        session = self.db.get_session()
        try:
            translation = Translation(
                sermon_id=sermon_id,
                source_text=source_text,
                translated_text=translated_text,
                translation_confidence=translation_confidence,
                expert_approved=False
            )
            
            session.add(translation)
            session.commit()
            
            translation_id = translation.id
            self.logger.info(f"Translation submitted for vetting: {sermon_id}")
            
            return translation_id
            
        finally:
            session.close()
    
    def approve_translation(
        self,
        sermon_id: str,
        approval_score: float,
        corrections: Optional[str] = None
    ) -> bool:
        """
        Approve a translation with expert review.
        
        Args:
            sermon_id: Sermon identifier
            approval_score: Expert approval score (0-1)
            corrections: Optional expert corrections to the translation
            
        Returns:
            True if approved, False otherwise
        """
        session = self.db.get_session()
        try:
            translation = session.query(Translation).filter_by(
                sermon_id=sermon_id
            ).first()
            
            if not translation:
                self.logger.warning(f"Translation not found: {sermon_id}")
                return False
            
            # Apply corrections if provided
            if corrections:
                translation.expert_corrections = corrections
                translation.translated_text = corrections
            
            translation.approval_score = approval_score
            
            # Approve if score meets threshold
            if approval_score >= self.min_approval_score:
                translation.expert_approved = True
                translation.approved_at = datetime.utcnow()
                session.commit()
                self.logger.info(f"Translation approved: {sermon_id} (score: {approval_score})")
                return True
            else:
                session.commit()
                self.logger.info(f"Translation rejected: {sermon_id} (score: {approval_score})")
                return False
                
        finally:
            session.close()
    
    def get_pending_vettion(self) -> List[Dict]:
        """
        Get all translations pending expert vetting.
        
        Returns:
            List of pending translation dictionaries
        """
        session = self.db.get_session()
        try:
            pending = session.query(Translation).filter_by(
                expert_approved=False
            ).all()
            
            return [
                {
                    'sermon_id': t.sermon_id,
                    'source_text': t.source_text,
                    'translated_text': t.translated_text,
                    'confidence': t.translation_confidence,
                    'created_at': t.created_at
                }
                for t in pending
            ]
            
        finally:
            session.close()
    
    def get_approved_translation(self, sermon_id: str) -> Optional[Dict]:
        """
        Get approved translation for a sermon.
        
        Args:
            sermon_id: Sermon identifier
            
        Returns:
            Translation dictionary if approved, None otherwise
        """
        session = self.db.get_session()
        try:
            translation = session.query(Translation).filter_by(
                sermon_id=sermon_id,
                expert_approved=True
            ).first()
            
            if translation:
                return {
                    'sermon_id': translation.sermon_id,
                    'source_text': translation.source_text,
                    'translated_text': translation.translated_text,
                    'approval_score': translation.approval_score,
                    'expert_corrections': translation.expert_corrections,
                    'approved_at': translation.approved_at
                }
            
            return None
            
        finally:
            session.close()
    
    def get_statistics(self) -> Dict:
        """
        Get vetting statistics.
        
        Returns:
            Dictionary of statistics
        """
        session = self.db.get_session()
        try:
            total = session.query(Translation).count()
            approved = session.query(Translation).filter_by(expert_approved=True).count()
            pending = total - approved
            
            # Calculate average approval score
            approved_translations = session.query(Translation).filter_by(
                expert_approved=True
            ).all()
            
            avg_score = 0
            if approved_translations:
                avg_score = sum(t.approval_score for t in approved_translations) / len(approved_translations)
            
            return {
                'total_translations': total,
                'approved': approved,
                'pending': pending,
                'average_approval_score': avg_score
            }
            
        finally:
            session.close()
