"""Speech alignment module for Live-Service phase."""

import logging
import numpy as np
from typing import List, Dict, Tuple, Optional
from datetime import datetime


class SpeechAligner:
    """Intelligent speech alignment for real-time subtitle display."""
    
    def __init__(
        self,
        window_size: float = 5.0,
        overlap: float = 1.0,
        confidence_threshold: float = 0.7,
        max_delay: float = 0.5
    ):
        """
        Initialize the speech aligner.
        
        Args:
            window_size: Size of analysis window in seconds
            overlap: Overlap between windows in seconds
            confidence_threshold: Minimum confidence for alignment
            max_delay: Maximum acceptable delay for real-time display
        """
        self.logger = logging.getLogger(__name__)
        self.window_size = window_size
        self.overlap = overlap
        self.confidence_threshold = confidence_threshold
        self.max_delay = max_delay
        
        # Internal state
        self.current_position = 0.0
        self.segments = []
        self.active_segment = None
    
    def load_sermon_segments(self, sermon_id: str, approved_translation: str):
        """
        Load pre-approved translation segments for alignment.
        
        Args:
            sermon_id: Sermon identifier
            approved_translation: Approved English translation text
        """
        # Split translation into segments (sentences)
        sentences = self._split_into_sentences(approved_translation)
        
        self.segments = [
            {
                'sermon_id': sermon_id,
                'index': i,
                'text': sentence,
                'start_time': None,
                'end_time': None,
                'aligned': False
            }
            for i, sentence in enumerate(sentences)
        ]
        
        self.logger.info(f"Loaded {len(self.segments)} segments for sermon {sermon_id}")
    
    def _split_into_sentences(self, text: str) -> List[str]:
        """
        Split text into sentence segments.
        
        Args:
            text: Text to split
            
        Returns:
            List of sentences
        """
        # Simple sentence splitting (can be improved with NLTK)
        import re
        sentences = re.split(r'[.!?]+', text)
        return [s.strip() for s in sentences if s.strip()]
    
    def detect_speech(self, audio_features: Dict) -> Dict:
        """
        Detect speech activity in audio features.
        
        Args:
            audio_features: Dictionary containing audio features
                - 'timestamp': Current audio timestamp
                - 'energy': Audio energy level
                - 'spectral_features': Spectral characteristics
                
        Returns:
            Detection result with confidence and timing
        """
        timestamp = audio_features.get('timestamp', 0.0)
        energy = audio_features.get('energy', 0.0)
        
        # Simple voice activity detection (simplified)
        # Real implementation would use more sophisticated VAD
        is_speech = energy > 0.1  # Energy threshold
        confidence = min(energy * 2, 1.0)  # Normalize to 0-1
        
        return {
            'is_speech': is_speech,
            'confidence': confidence,
            'timestamp': timestamp
        }
    
    def align_segment(
        self,
        audio_timestamp: float,
        audio_features: Dict
    ) -> Optional[Dict]:
        """
        Align current audio position with translation segments.
        
        Args:
            audio_timestamp: Current audio timestamp in seconds
            audio_features: Audio feature dictionary
            
        Returns:
            Aligned segment with subtitle if detected, None otherwise
        """
        self.current_position = audio_timestamp
        
        # Detect speech activity
        speech_info = self.detect_speech(audio_features)
        
        if not speech_info['is_speech']:
            return None
        
        if speech_info['confidence'] < self.confidence_threshold:
            return None
        
        # Find next unaligned segment
        next_segment = self._get_next_segment()
        
        if not next_segment:
            return None
        
        # Align segment with current position
        next_segment['start_time'] = audio_timestamp
        next_segment['end_time'] = audio_timestamp + self._estimate_duration(next_segment['text'])
        next_segment['aligned'] = True
        next_segment['confidence'] = speech_info['confidence']
        
        self.active_segment = next_segment
        
        self.logger.info(
            f"Aligned segment {next_segment['index']}: "
            f"{next_segment['start_time']:.2f}s - {next_segment['end_time']:.2f}s"
        )
        
        return next_segment
    
    def _get_next_segment(self) -> Optional[Dict]:
        """Get the next unaligned segment."""
        for segment in self.segments:
            if not segment['aligned']:
                return segment
        return None
    
    def _estimate_duration(self, text: str) -> float:
        """
        Estimate speech duration based on text length.
        
        Args:
            text: Text to estimate
            
        Returns:
            Estimated duration in seconds
        """
        # Average speaking rate: ~150 words per minute = 2.5 words per second
        words = len(text.split())
        duration = words / 2.5
        return max(duration, 2.0)  # Minimum 2 seconds
    
    def get_current_subtitle(self) -> Optional[Dict]:
        """
        Get the subtitle that should be displayed at current position.
        
        Returns:
            Subtitle dictionary if available, None otherwise
        """
        if not self.active_segment:
            return None
        
        # Check if current position is within active segment
        if (self.active_segment['start_time'] <= self.current_position <= 
            self.active_segment['end_time']):
            return {
                'text': self.active_segment['text'],
                'start_time': self.active_segment['start_time'],
                'end_time': self.active_segment['end_time'],
                'confidence': self.active_segment.get('confidence', 0.0)
            }
        
        # Active segment has ended, clear it
        self.active_segment = None
        return None
    
    def get_alignment_statistics(self) -> Dict:
        """
        Get alignment statistics.
        
        Returns:
            Dictionary of statistics
        """
        aligned_count = sum(1 for s in self.segments if s['aligned'])
        total_count = len(self.segments)
        
        if aligned_count > 0:
            avg_confidence = sum(
                s.get('confidence', 0) for s in self.segments if s['aligned']
            ) / aligned_count
        else:
            avg_confidence = 0.0
        
        return {
            'total_segments': total_count,
            'aligned_segments': aligned_count,
            'pending_segments': total_count - aligned_count,
            'average_confidence': avg_confidence,
            'current_position': self.current_position
        }
