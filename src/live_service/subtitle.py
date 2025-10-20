"""Real-time subtitle display system for Live-Service phase."""

import logging
from typing import Dict, Optional, List
from datetime import datetime
from ..common.database import Database, AlignmentSegment


class SubtitleDisplay:
    """Real-time subtitle display management."""
    
    def __init__(
        self,
        database: Database,
        max_chars_per_line: int = 42,
        max_lines: int = 2,
        display_duration: float = 3.0
    ):
        """
        Initialize subtitle display system.
        
        Args:
            database: Database instance
            max_chars_per_line: Maximum characters per subtitle line
            max_lines: Maximum number of subtitle lines
            display_duration: Default display duration in seconds
        """
        self.logger = logging.getLogger(__name__)
        self.db = database
        self.max_chars_per_line = max_chars_per_line
        self.max_lines = max_lines
        self.display_duration = display_duration
        
        self.current_subtitle = None
    
    def format_subtitle(self, text: str) -> List[str]:
        """
        Format subtitle text into display lines.
        
        Args:
            text: Subtitle text to format
            
        Returns:
            List of formatted lines
        """
        words = text.split()
        lines = []
        current_line = []
        current_length = 0
        
        for word in words:
            word_length = len(word) + (1 if current_line else 0)
            
            if current_length + word_length > self.max_chars_per_line:
                if current_line:
                    lines.append(' '.join(current_line))
                    current_line = [word]
                    current_length = len(word)
                else:
                    # Word is too long, split it
                    lines.append(word[:self.max_chars_per_line])
                    current_line = [word[self.max_chars_per_line:]]
                    current_length = len(current_line[0])
            else:
                current_line.append(word)
                current_length += word_length
        
        if current_line:
            lines.append(' '.join(current_line))
        
        # Limit to max lines
        if len(lines) > self.max_lines:
            lines = lines[:self.max_lines]
            lines[-1] += '...'
        
        return lines
    
    def display_subtitle(
        self,
        sermon_id: str,
        segment_index: int,
        text: str,
        start_time: float,
        end_time: float,
        confidence: float
    ) -> Dict:
        """
        Display a subtitle and log it.
        
        Args:
            sermon_id: Sermon identifier
            segment_index: Segment index
            text: Subtitle text
            start_time: Start time in seconds
            end_time: End time in seconds
            confidence: Alignment confidence
            
        Returns:
            Display information dictionary
        """
        # Format subtitle
        formatted_lines = self.format_subtitle(text)
        
        # Store in database
        session = self.db.get_session()
        try:
            segment = AlignmentSegment(
                sermon_id=sermon_id,
                segment_index=segment_index,
                start_time=start_time,
                end_time=end_time,
                source_text=text,
                subtitle_text='\n'.join(formatted_lines),
                confidence=confidence,
                displayed=True,
                display_timestamp=datetime.utcnow()
            )
            
            session.add(segment)
            session.commit()
            
            self.logger.info(
                f"Displayed subtitle {segment_index} for {sermon_id}: "
                f"{start_time:.2f}s - {end_time:.2f}s"
            )
            
        finally:
            session.close()
        
        # Set as current subtitle
        self.current_subtitle = {
            'sermon_id': sermon_id,
            'segment_index': segment_index,
            'lines': formatted_lines,
            'start_time': start_time,
            'end_time': end_time,
            'confidence': confidence,
            'display_time': datetime.utcnow()
        }
        
        return self.current_subtitle
    
    def get_current_subtitle(self, current_time: float) -> Optional[Dict]:
        """
        Get the subtitle that should be displayed at the current time.
        
        Args:
            current_time: Current playback time in seconds
            
        Returns:
            Current subtitle dictionary if active, None otherwise
        """
        if not self.current_subtitle:
            return None
        
        # Check if subtitle is still active
        if (self.current_subtitle['start_time'] <= current_time <= 
            self.current_subtitle['end_time']):
            return self.current_subtitle
        
        # Subtitle has ended
        if current_time > self.current_subtitle['end_time']:
            self.current_subtitle = None
        
        return None
    
    def clear_subtitle(self):
        """Clear the current subtitle."""
        self.current_subtitle = None
    
    def get_subtitle_history(self, sermon_id: str) -> List[Dict]:
        """
        Get subtitle display history for a sermon.
        
        Args:
            sermon_id: Sermon identifier
            
        Returns:
            List of displayed subtitle dictionaries
        """
        session = self.db.get_session()
        try:
            segments = session.query(AlignmentSegment).filter_by(
                sermon_id=sermon_id,
                displayed=True
            ).order_by(AlignmentSegment.segment_index).all()
            
            return [
                {
                    'segment_index': s.segment_index,
                    'text': s.subtitle_text,
                    'start_time': s.start_time,
                    'end_time': s.end_time,
                    'confidence': s.confidence,
                    'display_timestamp': s.display_timestamp
                }
                for s in segments
            ]
            
        finally:
            session.close()
    
    def render_subtitle(self, subtitle: Optional[Dict] = None) -> str:
        """
        Render subtitle for display.
        
        Args:
            subtitle: Subtitle dictionary (uses current if not provided)
            
        Returns:
            Formatted subtitle string for display
        """
        if subtitle is None:
            subtitle = self.current_subtitle
        
        if not subtitle:
            return ""
        
        lines = subtitle.get('lines', [])
        
        # Center align each line
        max_width = self.max_chars_per_line
        centered_lines = [line.center(max_width) for line in lines]
        
        return '\n'.join(centered_lines)
