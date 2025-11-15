"""
Real Translation Model Integration (Malay → English)
----------------------------------------------------
Implements Neural Machine Translation (NMT) using Hugging Face Transformers.
Maintains same API: translate_text_batch(malay_sentences) → [{"text":..., "confidence":...}]
"""

from typing import List, Dict
import torch
from torch.nn import functional as F  # NEW
from transformers import MarianMTModel, MarianTokenizer
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
model.to(DEVICE).eval()

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


def _compute_confidences(sequences: torch.Tensor, scores: list, eos_id: int | None) -> list[float]:
    """
    Geometric mean of per-token probabilities (excluding EOS).
    sequences: [batch, total_len]; scores: list[T] of logits [batch, vocab].
    """
    batch_size = sequences.size(0)
    T = len(scores)
    gen_token_ids = sequences[:, -T:]  # last T tokens correspond to generated portion
    confidences: list[float] = []
    for i in range(batch_size):
        logps = []
        for t in range(T):
            token_id = int(gen_token_ids[i, t])
            if eos_id is not None and token_id == eos_id:
                break
            step_logits = scores[t][i]          # [vocab]
            step_logprobs = F.log_softmax(step_logits, dim=-1)
            logps.append(float(step_logprobs[token_id]))
        if not logps:
            confidences.append(0.0)
        else:
            mean_logp = sum(logps) / len(logps)
            conf = float(torch.exp(torch.tensor(mean_logp)))
            # clamp to [0,1]
            conf = max(0.0, min(1.0, conf))
            confidences.append(conf)
    return confidences


def translate_text_batch(malay_sentences: List[str]) -> List[Dict[str, str]]:
    """
    Translate Malay sentences to English.
    Returns [{"text": translated_text, "confidence": float}, ...]
    """
    if not malay_sentences:
        return []

    # Tokenize & translate
    inputs = tokenizer(
        malay_sentences,
        return_tensors="pt",
        padding=True,
        truncation=True,
        max_length=256
    ).to(DEVICE)

    with torch.no_grad():
        gen_out = model.generate(
            **inputs,
            max_length=256,
            return_dict_in_generate=True,
            output_scores=True,
            num_beams=1,
            do_sample=False,
            early_stopping=True,
        )

    sequences = gen_out.sequences
    scores = gen_out.scores  # list of logits per generation step
    decoded = tokenizer.batch_decode(sequences, skip_special_tokens=True)

    try:
        confs = _compute_confidences(sequences, scores, tokenizer.eos_token_id)
    except Exception as e:
        logger.warning(f"Confidence computation failed: {e}")
        confs = [0.0] * len(decoded)

    results = []
    for tgt, conf in zip(decoded, confs):
        tgt = apply_glossary(tgt.strip())
        results.append({
            "text": tgt,
            "confidence": round(conf, 3)
        })

    logger.info(f"Translated {len(malay_sentences)} sentences via {MODEL_NAME}.")
    return results
