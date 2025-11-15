# ml_pipeline/alignment_module/aligner.py
"""
Aligns live Malay speech chunks with pre-translated sermon segments.
"""

import re
import difflib
import logging
logger = logging.getLogger(__name__)

STOPWORDS = {"dan","yang","di","ke","dari","pada","untuk","dalam","ini","itu","adalah","sebagai","juga"}

def _norm(s: str) -> str:
    s = s.lower().strip()
    s = re.sub(r"[^\w\s]", "", s)
    s = re.sub(r"\s+", " ", s)
    return s

def _token_overlap(a: str, b: str) -> float:
    ta = set(a.split()) - STOPWORDS
    tb = set(b.split()) - STOPWORDS
    if not ta or not tb:
        return 0.0
    return len(ta & tb) / len(ta | tb)

def _combined(spoken: str, cand: str) -> float:
    sa = _norm(spoken)
    sb = _norm(cand)
    r = difflib.SequenceMatcher(None, sa, sb).ratio()
    t = _token_overlap(sa, sb)
    return 0.55 * r + 0.45 * t

def match_spoken_to_segment(spoken_text: str, segments: list, min_score: float = 0.65):
    if not spoken_text or not segments:
        return None, 0.0
    best, best_score = None, 0.0
    for seg in segments:
        cand = (seg.malay_text or "").strip()
        if not cand:
            continue
        score = _combined(spoken_text, cand)
        if score > best_score:
            best, best_score = seg, score
    logger.debug(f"align: '{spoken_text}' -> id={getattr(best,'segment_id',None)} score={best_score:.3f}")
    return (best, round(best_score, 3)) if best_score >= min_score else (None, round(best_score, 3))