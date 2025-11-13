# ml_pipeline/alignment_module/aligner.py
"""
Aligns live Malay speech chunks with pre-translated sermon segments.
"""

import difflib

def match_spoken_to_segment(spoken_text, segments):
    """
    Finds the closest matching pre-translated segment by text similarity.
    """
    spoken_text = spoken_text.lower().strip()
    best_segment = None
    best_score = 0

    for seg in segments:
        candidate = seg.malay_text.lower().strip()
        score = difflib.SequenceMatcher(None, spoken_text, candidate).ratio()
        if score > best_score:
            best_score = score
            best_segment = seg

    return best_segment, best_score


# This uses simple string similarity (you can upgrade to embeddings later).