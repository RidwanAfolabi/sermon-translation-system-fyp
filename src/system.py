"""Main sermon translation system orchestrator."""

import logging
from typing import Dict, Optional
from .common import Config, Database, setup_logging, ensure_directories
from .pre_service import TranslationEngine, VettingSystem
from .live_service import SpeechAligner, SubtitleDisplay
from .post_service import AnalyticsEngine, ModelRefinement


class SermonTranslationSystem:
    """
    Main orchestrator for the three-phase sermon translation system.
    
    Phases:
    1. Pre-Service: Translation and expert vetting
    2. Live-Service: Real-time speech alignment and subtitle display
    3. Post-Service: Analytics and model refinement
    """
    
    def __init__(self, config_path: Optional[str] = None):
        """
        Initialize the sermon translation system.
        
        Args:
            config_path: Optional path to configuration file
        """
        # Load configuration
        self.config = Config(config_path)
        
        # Setup logging and directories
        self.logger = setup_logging(self.config)
        ensure_directories(self.config)
        
        # Initialize database
        db_connection = self.config.get('storage.database')
        self.db = Database(db_connection)
        
        self.logger.info("Sermon Translation System initialized")
        
        # Phase components (lazy initialization)
        self._translator = None
        self._vetting = None
        self._aligner = None
        self._subtitle = None
        self._analytics = None
        self._refinement = None
    
    # Pre-Service Phase
    
    @property
    def translator(self) -> TranslationEngine:
        """Get or initialize translation engine."""
        if self._translator is None:
            model_name = self.config.get('pre_service.translation.model_name')
            self._translator = TranslationEngine(model_name=model_name)
            self.logger.info("Translation engine initialized")
        return self._translator
    
    @property
    def vetting(self) -> VettingSystem:
        """Get or initialize vetting system."""
        if self._vetting is None:
            min_score = self.config.get('pre_service.vetting.min_approval_score')
            self._vetting = VettingSystem(self.db, min_approval_score=min_score)
            self.logger.info("Vetting system initialized")
        return self._vetting
    
    def pre_service_workflow(self, sermon_id: str, malay_text: str) -> Dict:
        """
        Execute Pre-Service workflow: translate and submit for vetting.
        
        Args:
            sermon_id: Unique sermon identifier
            malay_text: Malay sermon text
            
        Returns:
            Workflow result dictionary
        """
        self.logger.info(f"Starting Pre-Service workflow for {sermon_id}")
        
        # Translate
        translation_result = self.translator.translate(malay_text)
        
        # Submit for vetting
        translation_id = self.vetting.submit_for_vetting(
            sermon_id=sermon_id,
            source_text=malay_text,
            translated_text=translation_result['translation'],
            translation_confidence=translation_result['confidence']
        )
        
        return {
            'sermon_id': sermon_id,
            'translation_id': translation_id,
            'translation': translation_result['translation'],
            'confidence': translation_result['confidence'],
            'status': 'pending_vetting'
        }
    
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
            corrections: Optional expert corrections
            
        Returns:
            True if approved, False otherwise
        """
        return self.vetting.approve_translation(sermon_id, approval_score, corrections)
    
    # Live-Service Phase
    
    @property
    def aligner(self) -> SpeechAligner:
        """Get or initialize speech aligner."""
        if self._aligner is None:
            config = self.config.get_section('live_service.alignment')
            self._aligner = SpeechAligner(
                window_size=config.get('window_size', 5.0),
                overlap=config.get('overlap', 1.0),
                confidence_threshold=config.get('confidence_threshold', 0.7),
                max_delay=config.get('max_delay', 0.5)
            )
            self.logger.info("Speech aligner initialized")
        return self._aligner
    
    @property
    def subtitle(self) -> SubtitleDisplay:
        """Get or initialize subtitle display."""
        if self._subtitle is None:
            config = self.config.get_section('live_service.subtitle')
            self._subtitle = SubtitleDisplay(
                database=self.db,
                max_chars_per_line=config.get('max_chars_per_line', 42),
                max_lines=config.get('max_lines', 2),
                display_duration=config.get('display_duration', 3.0)
            )
            self.logger.info("Subtitle display initialized")
        return self._subtitle
    
    def live_service_setup(self, sermon_id: str) -> Dict:
        """
        Set up Live-Service phase for a sermon.
        
        Args:
            sermon_id: Sermon identifier
            
        Returns:
            Setup result dictionary
        """
        self.logger.info(f"Setting up Live-Service for {sermon_id}")
        
        # Get approved translation
        approved = self.vetting.get_approved_translation(sermon_id)
        
        if not approved:
            return {
                'error': 'No approved translation found',
                'sermon_id': sermon_id
            }
        
        # Load segments for alignment
        self.aligner.load_sermon_segments(sermon_id, approved['translated_text'])
        
        return {
            'sermon_id': sermon_id,
            'segments_loaded': len(self.aligner.segments),
            'status': 'ready'
        }
    
    def process_live_audio(
        self,
        sermon_id: str,
        audio_timestamp: float,
        audio_features: Dict
    ) -> Optional[Dict]:
        """
        Process live audio and display subtitles.
        
        Args:
            sermon_id: Sermon identifier
            audio_timestamp: Current audio timestamp
            audio_features: Audio feature dictionary
            
        Returns:
            Display info if subtitle shown, None otherwise
        """
        # Align segment
        aligned = self.aligner.align_segment(audio_timestamp, audio_features)
        
        if aligned:
            # Display subtitle
            subtitle_info = self.subtitle.display_subtitle(
                sermon_id=sermon_id,
                segment_index=aligned['index'],
                text=aligned['text'],
                start_time=aligned['start_time'],
                end_time=aligned['end_time'],
                confidence=aligned['confidence']
            )
            return subtitle_info
        
        return None
    
    # Post-Service Phase
    
    @property
    def analytics(self) -> AnalyticsEngine:
        """Get or initialize analytics engine."""
        if self._analytics is None:
            self._analytics = AnalyticsEngine(self.db)
            self.logger.info("Analytics engine initialized")
        return self._analytics
    
    @property
    def refinement(self) -> ModelRefinement:
        """Get or initialize model refinement system."""
        if self._refinement is None:
            config = self.config.get_section('post_service.refinement')
            self._refinement = ModelRefinement(
                database=self.db,
                min_data_points=config.get('min_data_points', 100),
                retrain_threshold=config.get('retrain_threshold', 0.1)
            )
            self.logger.info("Model refinement initialized")
        return self._refinement
    
    def post_service_analysis(self, sermon_id: str) -> Dict:
        """
        Execute Post-Service analysis for a sermon.
        
        Args:
            sermon_id: Sermon identifier
            
        Returns:
            Analysis report dictionary
        """
        self.logger.info(f"Starting Post-Service analysis for {sermon_id}")
        
        # Generate comprehensive report
        report = self.analytics.generate_sermon_report(sermon_id)
        
        # Log key metrics
        if 'accuracy_metrics' in report:
            accuracy = report['accuracy_metrics']
            self.analytics.log_metric(
                sermon_id=sermon_id,
                phase='post',
                metric_type='accuracy',
                metric_value=accuracy.get('approval_score', 0.0)
            )
        
        if 'timing_metrics' in report:
            timing = report['timing_metrics']
            self.analytics.log_metric(
                sermon_id=sermon_id,
                phase='post',
                metric_type='timing_precision',
                metric_value=timing.get('average_confidence', 0.0)
            )
        
        return report
    
    def check_refinement_needs(self) -> Dict:
        """
        Check if model refinement is needed.
        
        Returns:
            Refinement recommendation dictionary
        """
        self.logger.info("Checking refinement needs")
        
        recommendation = self.refinement.should_retrain()
        
        if recommendation['should_retrain']:
            # Get improvement areas
            improvements = self.analytics.identify_improvement_areas()
            recommendation['improvement_areas'] = improvements
        
        return recommendation
    
    def shutdown(self):
        """Shutdown the system and cleanup resources."""
        self.logger.info("Shutting down Sermon Translation System")
        self.db.close()
