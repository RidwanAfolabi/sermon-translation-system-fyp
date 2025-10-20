"""Model refinement module for Post-Service phase."""

import logging
from typing import Dict, List, Optional
from datetime import datetime
from ..common.database import Database, Translation, PerformanceLog


class ModelRefinement:
    """System for refining translation model based on feedback."""
    
    def __init__(
        self,
        database: Database,
        min_data_points: int = 100,
        retrain_threshold: float = 0.1
    ):
        """
        Initialize model refinement system.
        
        Args:
            database: Database instance
            min_data_points: Minimum data points before retraining
            retrain_threshold: Threshold for triggering retraining
        """
        self.logger = logging.getLogger(__name__)
        self.db = database
        self.min_data_points = min_data_points
        self.retrain_threshold = retrain_threshold
    
    def collect_training_data(self) -> List[Dict]:
        """
        Collect training data from approved translations with corrections.
        
        Returns:
            List of training examples
        """
        session = self.db.get_session()
        try:
            # Get approved translations with expert corrections
            translations = session.query(Translation).filter(
                Translation.expert_approved == True,
                Translation.expert_corrections.isnot(None)
            ).all()
            
            training_data = []
            
            for t in translations:
                training_data.append({
                    'source': t.source_text,
                    'mt_translation': t.translated_text,
                    'corrected_translation': t.expert_corrections,
                    'approval_score': t.approval_score,
                    'sermon_id': t.sermon_id
                })
            
            self.logger.info(f"Collected {len(training_data)} training examples")
            return training_data
            
        finally:
            session.close()
    
    def analyze_correction_patterns(self) -> Dict:
        """
        Analyze patterns in expert corrections.
        
        Returns:
            Dictionary of correction patterns and insights
        """
        training_data = self.collect_training_data()
        
        if not training_data:
            return {'message': 'No correction data available'}
        
        patterns = {
            'total_corrections': len(training_data),
            'common_issues': [],
            'quality_metrics': {}
        }
        
        # Calculate average improvement from corrections
        approval_scores = [d['approval_score'] for d in training_data]
        patterns['quality_metrics']['average_approval'] = (
            sum(approval_scores) / len(approval_scores)
        )
        
        # Analyze word-level differences (simplified)
        word_diffs = []
        for d in training_data:
            mt_words = set(d['mt_translation'].lower().split())
            corrected_words = set(d['corrected_translation'].lower().split())
            diff_count = len(mt_words.symmetric_difference(corrected_words))
            total_words = len(corrected_words)
            if total_words > 0:
                word_diffs.append(diff_count / total_words)
        
        if word_diffs:
            patterns['quality_metrics']['average_word_diff_rate'] = (
                sum(word_diffs) / len(word_diffs)
            )
        
        # Identify common issues (simplified analysis)
        if patterns['quality_metrics'].get('average_word_diff_rate', 0) > 0.2:
            patterns['common_issues'].append({
                'type': 'Word Choice',
                'severity': 'Medium',
                'description': 'Significant word-level differences in corrections'
            })
        
        return patterns
    
    def should_retrain(self) -> Dict:
        """
        Determine if model should be retrained.
        
        Returns:
            Dictionary with recommendation and reasoning
        """
        training_data = self.collect_training_data()
        data_count = len(training_data)
        
        recommendation = {
            'should_retrain': False,
            'reason': '',
            'data_points': data_count,
            'required_data_points': self.min_data_points
        }
        
        # Check if we have enough data
        if data_count < self.min_data_points:
            recommendation['reason'] = (
                f"Insufficient data: {data_count}/{self.min_data_points}"
            )
            return recommendation
        
        # Analyze correction patterns
        patterns = self.analyze_correction_patterns()
        avg_diff_rate = patterns.get('quality_metrics', {}).get('average_word_diff_rate', 0)
        
        # Check if improvement potential exceeds threshold
        if avg_diff_rate > self.retrain_threshold:
            recommendation['should_retrain'] = True
            recommendation['reason'] = (
                f"Significant improvement potential detected: {avg_diff_rate:.1%} avg difference rate"
            )
            recommendation['improvement_potential'] = avg_diff_rate
        else:
            recommendation['reason'] = (
                f"Model performing adequately: {avg_diff_rate:.1%} avg difference rate"
            )
        
        return recommendation
    
    def prepare_fine_tuning_dataset(self, output_path: str) -> Dict:
        """
        Prepare dataset for model fine-tuning.
        
        Args:
            output_path: Path to save the dataset
            
        Returns:
            Dataset preparation summary
        """
        import json
        import os
        
        training_data = self.collect_training_data()
        
        if not training_data:
            return {'error': 'No training data available'}
        
        # Format for fine-tuning
        fine_tuning_data = []
        for example in training_data:
            fine_tuning_data.append({
                'source': example['source'],
                'target': example['corrected_translation'],
                'metadata': {
                    'original_mt': example['mt_translation'],
                    'approval_score': example['approval_score'],
                    'sermon_id': example['sermon_id']
                }
            })
        
        # Save to file
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(fine_tuning_data, f, indent=2, ensure_ascii=False)
        
        summary = {
            'dataset_path': output_path,
            'total_examples': len(fine_tuning_data),
            'format': 'json',
            'prepared_at': datetime.utcnow().isoformat()
        }
        
        self.logger.info(f"Prepared fine-tuning dataset: {summary}")
        return summary
    
    def log_refinement_cycle(self, cycle_info: Dict):
        """
        Log a model refinement cycle.
        
        Args:
            cycle_info: Information about the refinement cycle
        """
        session = self.db.get_session()
        try:
            log = PerformanceLog(
                sermon_id='system',
                phase='post',
                metric_type='refinement_cycle',
                metric_value=cycle_info.get('improvement_score', 0.0),
                metric_metadata=cycle_info
            )
            
            session.add(log)
            session.commit()
            
            self.logger.info(f"Logged refinement cycle: {cycle_info}")
            
        finally:
            session.close()
    
    def get_refinement_history(self) -> List[Dict]:
        """
        Get history of model refinement cycles.
        
        Returns:
            List of refinement cycle records
        """
        session = self.db.get_session()
        try:
            logs = session.query(PerformanceLog).filter_by(
                sermon_id='system',
                phase='post',
                metric_type='refinement_cycle'
            ).order_by(PerformanceLog.timestamp.desc()).all()
            
            return [
                {
                    'timestamp': log.timestamp,
                    'improvement_score': log.metric_value,
                    'metadata': log.metric_metadata
                }
                for log in logs
            ]
            
        finally:
            session.close()
