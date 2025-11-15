# backend/api/routes/sermon_routes.py
"""
API endpoints for sermon management: upload, list, get sermon and segments.
"""

from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
import csv, io
import re
from pathlib import Path
from typing import Tuple
try:
    import docx  # python-docx
except ImportError:
    docx = None
try:
    from PyPDF2 import PdfReader
except ImportError:
    PdfReader = None
from backend.db.session import SessionLocal, engine
from backend.db import models
from backend.api.utils import db_utils

router = APIRouter()

# Accepted uploads
ACCEPTED_EXTS = {".txt", ".csv", ".md", ".docx", ".pdf", ".rtf"}

def _safe_decode(raw: bytes) -> str:
    for enc in ("utf-8", "latin-1"):
        try:
            return raw.decode(enc)
        except Exception:
            continue
    return raw.decode("utf-8", errors="ignore")

def _extract_text(upload: UploadFile, raw: bytes) -> Tuple[str, bool, str]:
    """
    Returns (text_data, is_csv, ext)
    """
    ext = Path(upload.filename).suffix.lower()
    if ext not in ACCEPTED_EXTS:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

    if ext == ".csv":
        return _safe_decode(raw), True, ext

    if ext in {".txt", ".md"}:
        return _safe_decode(raw), False, ext

    if ext == ".docx":
        if not docx:
            raise HTTPException(status_code=500, detail="python-docx not installed")
        bio = io.BytesIO(raw)
        d = docx.Document(bio)
        text = "\n".join(p.text for p in d.paragraphs if p.text and p.text.strip())
        return text.strip(), False, ext

    if ext == ".pdf":
        if not PdfReader:
            raise HTTPException(status_code=500, detail="PyPDF2 not installed")
        bio = io.BytesIO(raw)
        reader = PdfReader(bio)
        pages = []
        for page in reader.pages:
            try:
                pages.append(page.extract_text() or "")
            except Exception:
                continue
        text = "\n".join(pages)
        return text.strip(), False, ext

    if ext == ".rtf":
        raw_text = _safe_decode(raw)
        cleaned = re.sub(r"{\\[^}]+}|\\[A-Za-z]+\d* ?|[{}]", " ", raw_text)
        cleaned = re.sub(r"\s+", " ", cleaned)
        return cleaned.strip(), False, ext

    # Fallback
    return _safe_decode(raw), False, ext

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/upload")
async def upload_sermon(
    title: str = Form(...),
    speaker: str = Form(None),
    file: UploadFile = File(...),
    auto_segment: bool = Form(False),
    db: Session = Depends(get_db)
):
    """
    Upload a sermon script:
    - CSV: rows [segment_order, malay_text] → creates Segment rows
    - Other text types → store raw_text, or auto-segment if auto_segment=True
    """
    sermon = db_utils.create_sermon(db, title=title, speaker=speaker)

    raw = await file.read()
    text_data, is_csv, ext = _extract_text(file, raw)

    inserted = 0
    auto_segmented = False

    if is_csv:
        reader = csv.reader(io.StringIO(text_data))
        for row in reader:
            if not row or len(row) < 2:
                continue
            try:
                order = int(str(row[0]).strip())
                malay_text = str(row[1]).strip()
            except Exception:
                continue
            if not malay_text:
                continue
            db_utils.create_segment(db, sermon_id=sermon.sermon_id, order=order, malay_text=malay_text)
            inserted += 1
        sermon.status = "segments_uploaded"
        db.commit()
    else:
        if auto_segment:
            from ml_pipeline.alignment_module.segmenter import segment_text
            segments = segment_text(text_data)
            for idx, seg in enumerate(segments, start=1):
                db_utils.create_segment(db, sermon_id=sermon.sermon_id, order=idx, malay_text=seg)
                inserted += 1
            sermon.status = "segmented"
            auto_segmented = True
            db.commit()
        else:
            # store raw_text for later segmentation
            if hasattr(sermon, "raw_text"):
                sermon.raw_text = text_data
            sermon.status = "uploaded_raw"
            db.commit()

    return {
        "sermon_id": sermon.sermon_id,
        "inserted_segments": inserted,
        "auto_segmented": auto_segmented,
        "status": sermon.status,
        "source_ext": ext,
    }


@router.get("/{sermon_id}")
def get_sermon(sermon_id: int, db: Session = Depends(get_db)):
    sermon = db_utils.get_sermon(db, sermon_id)
    if not sermon:
        raise HTTPException(status_code=404, detail="Sermon not found")
    segments = db_utils.list_segments_for_sermon(db, sermon_id)
    return {
        "sermon": {
            "sermon_id": sermon.sermon_id,
            "title": sermon.title,
            "speaker": sermon.speaker,
            "status": sermon.status
        },
        "segments": [
            {"segment_id": s.segment_id, "order": s.segment_order, "malay_text": s.malay_text, "is_vetted": s.is_vetted}
            for s in segments
        ]
    }

