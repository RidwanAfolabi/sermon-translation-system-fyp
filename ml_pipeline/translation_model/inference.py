"""
Real Translation Model Integration (Malay → English)
----------------------------------------------------
Implements Neural Machine Translation (NMT) using Hugging Face Transformers.
Maintains same API: translate_text_batch(malay_sentences) → [{"text":..., "confidence":...}]
"""

from typing import List, Dict
import torch
from transformers import MarianMTModel, MarianTokenizer
import random
import logging
import json
import os

logger = logging.getLogger(__name__)

# -------------------------------------------------------------------
# Model setup
# -------------------------------------------------------------------

# You can configure this in .env later
MODEL_NAME = os.getenv("TRANSLATION_MODEL", "Helsinki-NLP/opus-mt-mul-en") # ✅ Lightweight multilingual → English model (supports Malay), can change to a better model later

logger.info(f"Loading translation model: {MODEL_NAME}")
tokenizer = MarianTokenizer.from_pretrained(MODEL_NAME)
model = MarianMTModel.from_pretrained(MODEL_NAME)

# Use GPU if available
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
model.to(DEVICE)
model.eval()

# Optional glossary loading (for religious terms)
GLOSSARY_PATH = os.path.join(os.path.dirname(__file__), "glossary.json")
if os.path.exists(GLOSSARY_PATH):
    with open(GLOSSARY_PATH, "r", encoding="utf-8") as f:
        GLOSSARY = json.load(f)
else:
    GLOSSARY = {}

# -------------------------------------------------------------------
# Core Translation Function
# -------------------------------------------------------------------

def apply_glossary(text: str) -> str:
    """Replace key Malay terms with preferred English equivalents."""
    for malay_term, eng_term in GLOSSARY.items():
        text = text.replace(malay_term, eng_term)
    return text


def translate_text_batch(malay_sentences: List[str]) -> List[Dict[str, str]]:
    """
    Translate Malay sentences to English.
    Returns [{"text": translated_text, "confidence": float}, ...]
    """
    if not malay_sentences:
        return []

    # Tokenize & translate
    inputs = tokenizer(malay_sentences, return_tensors="pt", padding=True, truncation=True).to(DEVICE)
    with torch.no_grad():
        generated_tokens = model.generate(**inputs, max_length=256)

    translated_texts = tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)

    results = []
    for src, tgt in zip(malay_sentences, translated_texts):
        # Postprocess translation
        tgt = apply_glossary(tgt.strip())
        results.append({
            "text": tgt,
            "confidence": round(random.uniform(0.90, 0.99), 2)  # placeholder confidence, need to change later
        })

    logger.info(f"Translated {len(malay_sentences)} sentences via {MODEL_NAME}.")
    return results
