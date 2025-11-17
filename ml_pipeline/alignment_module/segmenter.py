# ml_pipeline/alignment_module/segmenter.py

import re
from typing import List

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


# ---------- BASIC CLEAN ----------
def clean_text(t: str) -> str:
    t = re.sub(r"\r", " ", t)
    t = re.sub(r"\s+", " ", t)
    return t.strip()


# ---------- STRONG SENTENCE SPLITTING ----------
def hard_sentence_split(t: str) -> List[str]:
    """
    Split by . ? ! while keeping sentences intact.
    """
    parts = re.split(r"(?<=[.!?])\s+", t)
    return [p.strip() for p in parts if p.strip()]


# ---------- SPLIT VERY LONG SENTENCES ----------
def split_by_word_count(sentence: str, max_words: int = 22) -> List[str]:
    """
    If sentence > max_words, break into smaller blocks.
    Also break if more than 2 commas appear.
    """
    words = sentence.split()
    
    # Break at commas first if too many
    if sentence.count(",") >= 2:
        comma_parts = re.split(r"(?<=,)\s+", sentence)
        out = []
        for cp in comma_parts:
            if len(cp.split()) > max_words:
                out.extend(split_by_word_count(cp, max_words))
            else:
                out.append(cp.strip())
        return out

    # Basic word splitting
    if len(words) <= max_words:
        return [sentence]

    out = []
    for i in range(0, len(words), max_words):
        chunk = " ".join(words[i:i+max_words]).strip()
        if chunk:
            out.append(chunk)

    return out


# ---------- ENFORCE KHUTBAH MARKERS ----------
def enforce_markers(sentences: List[str]) -> List[str]:
    out = []
    buf = []
    for s in sentences:
        low = s.lower()
        if any(re.search(m, low) for m in KHUTBAH_MARKERS):
            if buf:
                out.append(" ".join(buf).strip())
                buf = []
            out.append(s.strip())
        else:
            buf.append(s)
    if buf:
        out.append(" ".join(buf).strip())
    return out


# ---------- MERGE TINY SEGMENTS ----------
def merge_small(segs: List[str], min_chars: int = 40) -> List[str]:
    out = []
    buf = ""
    for s in segs:
        if len(buf) < min_chars:
            buf = (buf + " " + s).strip()
        else:
            out.append(buf)
            buf = s
    if buf:
        out.append(buf)
    return out


# ---------- MAIN FUNCTION ----------
def segment_text(raw: str, max_len: int = 220) -> List[str]:
    raw = clean_text(raw)

    # 1. Hard split into sentences
    init_sents = hard_sentence_split(raw)

    # 2. Enforce khutbah markers
    marked = enforce_markers(init_sents)

    # 3. Split long sentences by word count or commas
    pieces = []
    for s in marked:
        pieces.extend(split_by_word_count(s, max_words=22))

    # 4. Merge tiny segments
    final = merge_small(pieces, min_chars=40)

    # 5. Respect max_len
    really_final = []
    for f in final:
        if len(f) > max_len:
            really_final.extend(split_by_word_count(f, max_words=18))
        else:
            really_final.append(f)

    return really_final
