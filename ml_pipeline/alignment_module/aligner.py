# ml_pipeline/alignment_module/aligner.py
"""
Aligns live Malay speech chunks with pre-translated sermon segments.
"""

import re
import difflib
import math
import logging
logger = logging.getLogger(__name__)

SYN_MAP = {
    "jamaah":"jemaah",
    "muslimin":"muslimin",
    "muslimat":"muslimat",
    "hadirin":"hadirin",
    "allah":"allah",
}
STOP = {"dan","yang","di","ke","dari","pada","untuk","dalam","ini","itu","para","jemaah","sekalian","akan","tidak","dengan"}

def _norm(s: str) -> str:
    s = s.lower()
    s = re.sub(r"[^\w\s]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    s = " ".join(SYN_MAP.get(w, w) for w in s.split())
    return s

def _token_set(s: str):
    toks = [t for t in s.split() if t and t not in STOP]
    return set(toks), toks

def _seq_ratio(a: str, b: str) -> float:
    return difflib.SequenceMatcher(None, a, b).ratio()

def _jaccard(sa: set, sb: set) -> float:
    if not sa or not sb: return 0.0
    return len(sa & sb)/len(sa | sb)

def _length_factor(ta, tb) -> float:
    la, lb = len(ta), len(tb)
    if la == 0 or lb == 0: return 0.0
    return min(la, lb)/max(la, lb)

def similarity(spoken: str, cand: str) -> float:
    a = _norm(spoken); b = _norm(cand)
    if not a or not b: return 0.0
    sa, ta = _token_set(a); sb, tb = _token_set(b)
    seq = _seq_ratio(a, b)
    jac = _jaccard(sa, sb)
    lenf = _length_factor(ta, tb)
    score = 0.50*seq + 0.30*jac + 0.20*lenf
    return round(min(1.0, max(0.0, score)), 3)

def match_spoken_to_segment(spoken_text: str, segments, min_score: float = 0.55):
    """
    Returns (matched_segment_or_None, best_score, best_segment_id, best_order)
    Always returns top candidate even if below min_score (segment will be None if below threshold).
    """
    if not spoken_text or not segments:
        return None, 0.0, None, None
    best_seg = None
    best_score = 0.0
    for seg in segments:
        cand = (seg.malay_text or "").strip()
        if not cand:
            continue
        sc = similarity(spoken_text, cand)
        if sc > best_score:
            best_score = sc
            best_seg = seg
    if best_seg and best_score >= min_score:
        logger.info(f"[ALIGN] match id={best_seg.segment_id} score={best_score} spoken='{spoken_text}'")
        return best_seg, best_score, best_seg.segment_id, best_seg.segment_order
    logger.info(f"[ALIGN] no-match best={best_score} spoken='{spoken_text}'")
    return None, best_score, getattr(best_seg, "segment_id", None), getattr(best_seg, "segment_order", None)