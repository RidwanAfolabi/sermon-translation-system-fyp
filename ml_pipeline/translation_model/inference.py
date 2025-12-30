"""
Real Translation Model Integration (Malay → English)
----------------------------------------------------
Implements Neural Machine Translation (NMT) using:
1. Hugging Face Transformers (Marian MT) - default, offline
2. Google Gemini API - optional, high-quality cloud translation

Maintains same API: translate_text_batch(malay_sentences) → [{"text":..., "confidence":...}]
"""

from typing import List, Dict
import torch
from torch.nn import functional as F
from transformers import MarianMTModel, MarianTokenizer
import logging
import json
import os
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

logger = logging.getLogger(__name__)

# -------------------------------------------------------------------
# Configuration
# -------------------------------------------------------------------
TRANSLATION_PROVIDER = os.getenv("TRANSLATION_PROVIDER", "marian")  # "marian" or "gemini"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash-exp")  # Updated to 2.0-flash-exp (better and free)
GEMINI_BATCH_SIZE = int(os.getenv("GEMINI_BATCH_SIZE", "10"))  # Translate up to 10 segments per API call

# -------------------------------------------------------------------
# Marian Model setup (lazy loading)
# -------------------------------------------------------------------
MODEL_NAME = os.getenv("TRANSLATION_MODEL", "Helsinki-NLP/opus-mt-mul-en")
_marian_model = None
_marian_tokenizer = None
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"


def _load_marian_model():
    """Lazy load Marian model only when needed."""
    global _marian_model, _marian_tokenizer
    if _marian_model is None:
        logger.info(f"Loading Marian translation model: {MODEL_NAME}")
        _marian_tokenizer = MarianTokenizer.from_pretrained(MODEL_NAME)
        _marian_model = MarianMTModel.from_pretrained(MODEL_NAME)
        _marian_model.to(DEVICE).eval()
    return _marian_model, _marian_tokenizer


# Optional glossary loading (for religious terms)
GLOSSARY_PATH = os.path.join(os.path.dirname(__file__), "glossary.json")
if os.path.exists(GLOSSARY_PATH):
    with open(GLOSSARY_PATH, "r", encoding="utf-8") as f:
        GLOSSARY = json.load(f)
else:
    GLOSSARY = {}


# -------------------------------------------------------------------
# Gemini API Translation (Batch-Optimized)
# -------------------------------------------------------------------
def translate_with_gemini(malay_sentences: List[str]) -> List[Dict[str, str]]:
    """
    Translate Malay sentences to English using Google Gemini API.
    Optimized for Islamic sermon content with batch processing to reduce API costs.
    Processes multiple segments per request (up to GEMINI_BATCH_SIZE).
    """
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY not set in environment variables")
    
    if not malay_sentences:
        return []
    
    results = []
    
    # Gemini API endpoint
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
    
    headers = {
        "Content-Type": "application/json"
    }
    
    # Process in batches for efficiency
    for batch_start in range(0, len(malay_sentences), GEMINI_BATCH_SIZE):
        batch = malay_sentences[batch_start:batch_start + GEMINI_BATCH_SIZE]
        
        # Build numbered list for batch translation
        numbered_texts = []
        for i, sentence in enumerate(batch, start=1):
            numbered_texts.append(f"{i}. {sentence.strip()}")
        
        batch_text = "\n".join(numbered_texts)
        
        # Islamic sermon-aware batch translation prompt
        prompt = f"""You are an expert translator specializing in Islamic religious content.
Translate the following Malay sermon segments to English accurately, preserving:
1. Islamic terminology (keep terms like Salah, Zakat, Riba, Khutbah, etc. or translate appropriately)
2. Quranic references and their meaning
3. The formal, respectful tone of a sermon (khutbah)
4. Religious context and theological accuracy

Malay segments:
{batch_text}

Provide the English translations in the EXACT same numbered format (1., 2., 3., etc.), one per line. No explanations, just the translations."""

        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }],
            "generationConfig": {
                "temperature": 0.2,  # Lower for more consistent output
                "maxOutputTokens": 2048,  # Higher for batch processing
                "topP": 0.95,
                "topK": 40
            }
        }
        
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=60)
            response.raise_for_status()
            
            data = response.json()
            translated_text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
            
            # Parse numbered responses
            lines = translated_text.split('\n')
            batch_results = []
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                # Remove numbering (1. or 1) at start)
                import re
                cleaned = re.sub(r'^\d+\.?\s*', '', line)
                if cleaned:
                    batch_results.append(apply_glossary(cleaned))
            
            # Ensure we have the correct number of results
            while len(batch_results) < len(batch):
                batch_results.append("[Translation incomplete]")
            
            # Add to results with confidence scores
            for translated in batch_results[:len(batch)]:
                results.append({
                    "text": translated,
                    "confidence": 0.95  # Gemini generally high quality
                })
            
            logger.info(f"Translated batch of {len(batch)} segments via Gemini API ({GEMINI_MODEL})")
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Gemini API error: {e}")
            # Fallback: add error placeholders for this batch
            for _ in batch:
                results.append({
                    "text": f"[Translation Error: {str(e)[:50]}]",
                    "confidence": 0.0
                })
        except (KeyError, IndexError) as e:
            logger.error(f"Gemini response parsing error: {e}")
            for _ in batch:
                results.append({
                    "text": "[Translation Error: Invalid API response]",
                    "confidence": 0.0
                })
    
    logger.info(f"Completed translation of {len(malay_sentences)} sentences via Gemini API ({GEMINI_MODEL}) in {(len(malay_sentences) + GEMINI_BATCH_SIZE - 1) // GEMINI_BATCH_SIZE} API calls.")
    return results

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


def translate_with_marian(malay_sentences: List[str]) -> List[Dict[str, str]]:
    """
    Translate Malay sentences to English using Marian MT (offline).
    Returns [{"text": translated_text, "confidence": float}, ...]
    """
    if not malay_sentences:
        return []

    model, tokenizer = _load_marian_model()

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

    logger.info(f"Translated {len(malay_sentences)} sentences via Marian ({MODEL_NAME}).")
    return results


def translate_text_batch(malay_sentences: List[str], provider: str = None) -> List[Dict[str, str]]:
    """
    Translate Malay sentences to English.
    
    Args:
        malay_sentences: List of Malay text strings
        provider: Translation provider ("marian" or "gemini"). 
                  If None, uses TRANSLATION_PROVIDER env var.
    
    Returns [{"text": translated_text, "confidence": float}, ...]
    """
    if not malay_sentences:
        return []
    
    # Determine provider
    use_provider = provider or TRANSLATION_PROVIDER
    
    if use_provider.lower() == "gemini":
        if not GEMINI_API_KEY:
            logger.warning("Gemini API key not set, falling back to Marian")
            return translate_with_marian(malay_sentences)
        return translate_with_gemini(malay_sentences)
    else:
        return translate_with_marian(malay_sentences)
