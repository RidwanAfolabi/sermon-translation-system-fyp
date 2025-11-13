# segmenter for sermon text files
# ml_pipeline/alignment_module/segmenter.py

import re
from typing import List

def segment_text(text: str, max_len: int = 200) -> List[str]:
    """
    Splits sermon text into manageable sentence segments.
    Args:
        text: Full sermon text.
        max_len: Maximum characters per segment (approx).
    Returns:
        List of text segments.
    """
    # Normalize spacing
    text = re.sub(r'\s+', ' ', text.strip())

    # Basic sentence splitting
    sentences = re.split(r'(?<=[.!?])\s+', text)

    segments, current = [], ""
    for s in sentences:
        if len(current) + len(s) < max_len:
            current += (" " + s).strip()
        else:
            segments.append(current.strip())
            current = s
    if current:
        segments.append(current.strip())

    return [seg for seg in segments if seg]
