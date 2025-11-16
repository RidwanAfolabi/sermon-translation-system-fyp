# backend/api/routes/sermon_routes.py
"""
API endpoints for sermon management: upload, list, get sermon and segments.
"""

from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from pathlib import Path
from typing import Tuple, List, Optional
import io, csv, re

from backend.db.session import SessionLocal
from backend.db import models

# Optional parsers
try:
    import docx  # python-docx
except ImportError:
    docx = None
try:
    from PyPDF2 import PdfReader
except ImportError:
    PdfReader = None

router = APIRouter(prefix="/sermon", tags=["sermon"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

ACCEPTED_EXTS = {".txt", ".csv", ".md", ".docx", ".pdf", ".rtf"}

def _safe_decode(raw: bytes) -> str:
    for enc in ("utf-8", "latin-1"):
        try:
            return raw.decode(enc)
        except Exception:
            continue
    return raw.decode("utf-8", errors="ignore")

def _extract_text(upload: UploadFile, raw: bytes) -> Tuple[str, bool, str]:
    ext = Path(upload.filename or "").suffix.lower()
    if ext not in ACCEPTED_EXTS:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

    if ext == ".csv":
        return _safe_decode(raw), True, ext
    if ext in {".txt", ".md"}:
        return _safe_decode(raw), False, ext
    if ext == ".docx":
        if not docx:
            raise HTTPException(status_code=500, detail="python-docx not installed")
        d = docx.Document(io.BytesIO(raw))
        text = "\n".join(p.text for p in d.paragraphs if p.text and p.text.strip())
        return text.strip(), False, ext
    if ext == ".pdf":
        if not PdfReader:
            raise HTTPException(status_code=500, detail="PyPDF2 not installed")
        reader = PdfReader(io.BytesIO(raw))
        pages = []
        for page in reader.pages:
            try:
                pages.append(page.extract_text() or "")
            except Exception:
                continue
        return "\n".join(pages).strip(), False, ext
    if ext == ".rtf":
        raw_text = _safe_decode(raw)
        cleaned = re.sub(r"{\\[^}]+}|\\[A-Za-z]+\d* ?|[{}]", " ", raw_text)
        cleaned = re.sub(r"\s+", " ", cleaned)
        return cleaned.strip(), False, ext
    return _safe_decode(raw), False, ext

# Upload
@router.post("/upload")
async def upload_sermon(
    title: str = Form(...),
    speaker: Optional[str] = Form(None),
    file: UploadFile = File(...),
    auto_segment: bool = Form(False),
    db: Session = Depends(get_db)
):
    sermon = models.Sermon(title=title, speaker=speaker, status="uploaded_raw")
    db.add(sermon)
    db.commit()
    db.refresh(sermon)

    raw = await file.read()
    text_data, is_csv, ext = _extract_text(file, raw)

    inserted = 0
    if is_csv:
        reader = csv.reader(io.StringIO(text_data))
        for row in reader:
            if not row or len(row) < 2:
                continue
            try:
                order = int(str(row[0]).strip())
            except Exception:
                continue
            malay_text = str(row[1]).strip()
            if not malay_text:
                continue
            seg = models.Segment(sermon_id=sermon.sermon_id, segment_order=order, malay_text=malay_text)
            db.add(seg)
            inserted += 1
        sermon.status = "segments_uploaded"
        db.commit()
    else:
        # store raw_text
        if hasattr(sermon, "raw_text"):
            sermon.raw_text = text_data
        if auto_segment:
            # use balanced segmenter
            from ml_pipeline.alignment_module.segmenter import segment_text as balanced_segment_text  # if exists
            try:
                segs = balanced_segment_text(text_data)
            except Exception:
                segs = [s for s in re.split(r"(?<=[.!?])\s+", text_data) if s.strip()]
            for idx, seg in enumerate(segs, start=1):
                db.add(models.Segment(sermon_id=sermon.sermon_id, segment_order=idx, malay_text=seg.strip()))
                inserted += 1
            sermon.status = "segmented"
        else:
            sermon.status = "uploaded_raw"
        db.commit()

    return {
        "sermon_id": sermon.sermon_id,
        "inserted_segments": inserted,
        "status": sermon.status,
        "source_ext": ext,
    }

# List sermons (for dropdown)
@router.get("/list")
def list_sermons(db: Session = Depends(get_db)):
    rows = db.query(models.Sermon).order_by(models.Sermon.sermon_id.desc()).all()
    return [
        {
            "sermon_id": s.sermon_id,
            "title": s.title,
            "speaker": s.speaker,
            "status": s.status,
        } for s in rows
    ]

# Get segments for a sermon
@router.get("/{sermon_id}/segments")
def get_segments(sermon_id: int, db: Session = Depends(get_db)):
    segs = db.query(models.Segment)\
        .filter(models.Segment.sermon_id == sermon_id)\
        .order_by(models.Segment.segment_order.asc()).all()
    return [
        {
            "segment_id": x.segment_id,
            "segment_order": x.segment_order,
            "malay_text": x.malay_text,
            "english_text": getattr(x, "english_text", None),
            "confidence": getattr(x, "confidence", None),
            "vetted": getattr(x, "vetted", False),
        } for x in segs
    ]

# Patch segment (edit english/vetted)
@router.patch("/segment/{segment_id}")
def patch_segment(segment_id: int, payload: dict = Body(...), db: Session = Depends(get_db)):
    seg = db.query(models.Segment).filter(models.Segment.segment_id == segment_id).first()
    if not seg:
        raise HTTPException(404, "Segment not found")
    english_text = payload.get("english_text")
    vetted = payload.get("vetted")
    if english_text is not None:
        seg.english_text = english_text
    if vetted is not None:
        seg.vetted = bool(vetted)
    db.commit()
    return {"ok": True}

# Segment-now (strategy: auto|sentence|paragraph)
@router.post("/{sermon_id}/segment-now")
def segment_now(sermon_id: int, strategy: str = "auto", db: Session = Depends(get_db)):
    sermon = db.query(models.Sermon).filter(models.Sermon.sermon_id == sermon_id).first()
    if not sermon:
        raise HTTPException(404, "Sermon not found")
    raw = getattr(sermon, "raw_text", None)
    if not raw:
        raise HTTPException(400, "No raw_text on sermon")

    # Clear old segments
    db.query(models.Segment).filter(models.Segment.sermon_id == sermon_id).delete()

    def split_sentences(t: str):
        return [s.strip() for s in re.split(r"(?<=[.!?])\s+", t) if s.strip()]

    if strategy == "sentence":
        parts = split_sentences(raw)
    elif strategy == "paragraph":
        parts = [p.strip() for p in re.split(r"\n{2,}", raw) if p.strip()]
    else:
        # auto/balanced
        try:
            from ml_pipeline.alignment_module.segmenter import segment_text
            parts = segment_text(raw)
        except Exception:
            parts = split_sentences(raw)

    for i, p in enumerate(parts, start=1):
        db.add(models.Segment(sermon_id=sermon_id, segment_order=i, malay_text=p))
    sermon.status = "segmented"
    db.commit()
    return {"ok": True, "count": len(parts)}

# Translate all segments (batch)
@router.post("/{sermon_id}/translate")
def translate_all(
    sermon_id: int,
    payload: dict = Body(...),
    db: Session = Depends(get_db)
):
    provider = (payload or {}).get("provider", "marian")
    model_name = (payload or {}).get("model_name")

    segs = db.query(models.Segment)\
        .filter(models.Segment.sermon_id == sermon_id)\
        .order_by(models.Segment.segment_order.asc()).all()
    malay = [s.malay_text or "" for s in segs]
    if not malay:
        return {"ok": True, "count": 0}

    # Currently wired to Marian pipeline; model_name optional override.
    # If you support multiple providers, route to the right inference here.
    from ml_pipeline.translation_model.inference import translate_text_batch  # uses configured model
    results = translate_text_batch(malay)  # [{"text","confidence"}]

    for s, r in zip(segs, results):
        s.english_text = r["text"]
        if "confidence" in r:
            s.confidence = float(r["confidence"])
    db.commit()
    return {"ok": True, "count": len(segs), "provider": provider, "model_name": model_name}

