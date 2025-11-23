# ml_pipeline/alignment_module/segmenter.py

import re
from typing import List

# ============================================================
# KHUTBAH MARKERS
# ============================================================
KHUTBAH_MARKERS = [
    r"\bhadirin yang dirahmati allah\b",
    r"\bpara jemaah sekalian\b",
    r"\bmuslimin dan muslimat\b",
    r"\byang pertama\b",
    r"\byang kedua\b",
    r"\bseterusnya\b",
    r"\bakhir kata\b",
    r"\bkesimpulannya\b",
]

# ============================================================
# BASIC CLEAN
# ============================================================
def clean_text(t: str) -> str:
    t = re.sub(r"\r", " ", t)
    t = re.sub(r"\s+", " ", t)
    return t.strip()

# ============================================================
# SENTENCE SPLITTER
# ============================================================
def hard_sentence_split(t: str) -> List[str]:
    parts = re.split(r"(?<=[.!?])\s+", t)
    return [p.strip() for p in parts if p.strip()]

# ============================================================
# SPLIT BY WORD COUNT (primary rule = 18 words)
# ============================================================
def split_by_word_count(sentence: str, max_words: int = 18) -> List[str]:
    words = sentence.split()

    # Split at commas first
    if "," in sentence:
        sections = re.split(r"(?<=,)\s+", sentence)
        final_parts = []
        for sec in sections:
            if len(sec.split()) > max_words:
                final_parts.extend(split_by_word_count(sec, max_words))
            else:
                final_parts.append(sec.strip())
        return final_parts

    # If already short enough
    if len(words) <= max_words:
        return [sentence]

    # Otherwise chunk it
    out = []
    for i in range(0, len(words), max_words):
        out.append(" ".join(words[i:i+max_words]).strip())

    return out

# ============================================================
# ENFORCE KHUTBAH MARKERS
# ============================================================
def enforce_markers(sentences: List[str]) -> List[str]:
    out = []
    buf = []

    for s in sentences:
        low = s.lower()
        if any(re.search(m, low) for m in KHUTBAH_MARKERS):
            # Flush buffer before marker
            if buf:
                out.append(" ".join(buf).strip())
                buf = []
            out.append(s.strip())
        else:
            buf.append(s)

    if buf:
        out.append(" ".join(buf).strip())

    return out

# ============================================================
# MERGE ONLY TINY SEGMENTS WITHOUT MAKING LONG ONES
# ============================================================
def merge_small(segs: List[str], min_chars: int = 35) -> List[str]:
    out = []
    buf = ""

    for s in segs:
        # Predict merged length (in chars)
        candidate = (buf + " " + s).strip()

        # Only merge if still small AND <= 15 words
        if len(candidate) < min_chars and len(candidate.split()) <= 15:
            buf = candidate
        else:
            if buf:
                out.append(buf)
            buf = s

    if buf:
        out.append(buf)

    return out

# ============================================================
# FINAL HARD CAP = STRICT 15 WORDS MAX
# ============================================================
def enforce_hard_cap(segments: List[str], hard_max: int = 15) -> List[str]:
    final = []
    for seg in segments:
        words = seg.split()
        if len(words) > hard_max:
            # recursive split
            final.extend(split_by_word_count(seg, max_words=hard_max))
        else:
            final.append(seg)
    return final

# ============================================================
# MASTER FUNCTION
# ============================================================
def segment_text(raw: str, max_len: int = 180) -> List[str]:
    raw = clean_text(raw)

    # 1. Split into sentences
    sents = hard_sentence_split(raw)

    # 2. Enforce khutbah markers as boundaries
    marked = enforce_markers(sents)

    # 3. Split long sentences by 18-word blocks
    chunks = []
    for s in marked:
        chunks.extend(split_by_word_count(s, max_words=18))

    # 4. Merge only very small segments
    merged = merge_small(chunks, min_chars=35)

    # 5. FINAL HARD SAFETY CAP at 15 words (NEVER exceed)
    final_segments = enforce_hard_cap(merged, hard_max=15)

    return final_segments
