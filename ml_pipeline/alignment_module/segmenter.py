# segmenter for sermon text files
# ml_pipeline/alignment_module/segmenter.py

import re
from typing import List

KHUTBAH_MARKERS = [
    r"^hadirin yang dirahmati Allah", r"^para jemaah sekalian",
    r"^muslimin dan muslimat", r"^yang pertama", r"^yang kedua",
    r"^seterusnya", r"^akhir kata", r"^kesimpulannya",
]
ARABIC_PATTERN = r"[اأإآءؤئ]+"

def clean_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text)
    return text.strip()

def split_into_sentences(text: str) -> List[str]:
    base = re.split(r"(?<=[.!?])\s+", text)
    out = []
    for s in base:
        out.extend(re.split(r"(?<=,)\s+", s))
    return [s.strip() for s in out if s.strip()]

def force_markers(sentences: List[str]) -> List[str]:
    out, cur = [], ""
    for s in sentences:
        low = s.lower().strip()
        if any(re.match(m, low) for m in KHUTBAH_MARKERS):
            if cur.strip():
                out.append(cur.strip())
            cur = s
        else:
            cur = s if not cur else f"{cur} {s}"
    if cur.strip():
        out.append(cur.strip())
    return out

def isolate_arabic(segments: List[str]) -> List[str]:
    out = []
    for seg in segments:
        if re.search(ARABIC_PATTERN, seg):
            parts = re.split(r"(?=" + ARABIC_PATTERN + r")", seg)
            out.extend([p.strip() for p in parts if p.strip()])
        else:
            out.append(seg)
    return out

def merge_short(segments: List[str], min_len=40) -> List[str]:
    if not segments: return segments
    merged, cur = [], segments[0]
    for seg in segments[1:]:
        if len(cur) < min_len:
            cur = f"{cur} {seg}"
        else:
            merged.append(cur.strip())
            cur = seg
    merged.append(cur.strip())
    return merged

def segment_text(text: str, max_len: int = 220) -> List[str]:
    text = clean_text(text)
    sentences = split_into_sentences(text)
    segments = force_markers(sentences)
    segments = isolate_arabic(segments)
    final = []
    for seg in segments:
        if len(seg) <= max_len:
            final.append(seg)
        else:
            for p in re.split(r"(?<=[.!?])\s+", seg):
                if p.strip():
                    final.append(p.strip())
    return merge_short(final, min_len=40)
