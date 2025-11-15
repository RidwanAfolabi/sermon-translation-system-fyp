# segmenter for sermon text files
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

def clean_text(t: str) -> str:
    t = re.sub(r"\r", " ", t)
    t = re.sub(r"\s+", " ", t)
    return t.strip()

def split_sentences(t: str) -> List[str]:
    parts = re.split(r"(?<=[.!?])\s+", t)
    out = []
    for p in parts:
        out.extend(re.split(r"(?<=,)\s+", p))
    return [s.strip() for s in out if s.strip()]

def group_markers(sentences: List[str]) -> List[str]:
    acc = []
    cur = []
    for s in sentences:
        low = s.lower()
        if any(re.search(m, low) for m in KHUTBAH_MARKERS):
            if cur:
                acc.append(" ".join(cur).strip())
                cur = []
            acc.append(s.strip())
        else:
            cur.append(s)
    if cur:
        acc.append(" ".join(cur).strip())
    return acc

def split_long(seg: str, max_len: int) -> List[str]:
    if len(seg) <= max_len:
        return [seg]
    cut = re.split(r"(?<=[.!?])\s+", seg)
    res = []
    for c in cut:
        if c.strip():
            res.append(c.strip())
    return res

def merge_short(segs: List[str], min_len: int = 40) -> List[str]:
    if not segs: return segs
    out = []
    buf = segs[0]
    for s in segs[1:]:
        if len(buf) < min_len:
            buf = f"{buf} {s}"
        else:
            out.append(buf.strip())
            buf = s
    out.append(buf.strip())
    return out

def segment_text(raw: str, max_len: int = 220) -> List[str]:
    raw = clean_text(raw)
    sents = split_sentences(raw)
    grouped = group_markers(sents)
    final = []
    for g in grouped:
        pieces = split_long(g, max_len)
        final.extend(pieces)
    final = merge_short(final, min_len=40)
    return final
