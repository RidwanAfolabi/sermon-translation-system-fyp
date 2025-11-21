"""
Realtime Malay + Arabic speech recognition using Faster-Whisper Large-V3.
Optimized for masjid acoustics (echo, reverb, low-volume Khatib voices).

Fully backward-compatible with your existing system.
"""

import os, queue, logging, threading, re
from typing import Generator, Optional
import numpy as np
import sounddevice as sd
import torch
from faster_whisper import WhisperModel

# -------------------------------------------------
# Configuration
# -------------------------------------------------
SAMPLE_RATE = 16000
CHANNELS = 1

MODEL_NAME = os.getenv("WHISPER_MODEL", "large-v3")   # Best accuracy
LANGUAGE = os.getenv("WHISPER_LANG", "ms")            # "ms" or "auto"

DEVICE = os.getenv("WHISPER_DEVICE", "auto")
COMPUTE_TYPE_ENV = os.getenv("WHISPER_COMPUTE")

BLOCK_SECONDS = float(os.getenv("WHISPER_BLOCK_SECS", "6"))
MIN_CHARS = int(os.getenv("WHISPER_MIN_CHARS", "6"))

VERBOSE_CHUNKS = os.getenv("WHISPER_VERBOSE", "true").lower() in {"1","true","yes"}
VAD_ENABLED = os.getenv("WHISPER_VAD", "true").lower() in {"1","true","yes"}

# Masjid echo + khutbah bias
INITIAL_PROMPT = (
    "Ini adalah khutbah agama Islam dalam bahasa Melayu dan bahasa Arab. "
    "Bahasa bersifat formal, beradab, dan jelas. "
    "Abaikan bunyi gema, pantulan, atau hingar dalam masjid."
)

# -------------------------------------------------
# Internal State
# -------------------------------------------------
_audio_q: "queue.Queue[np.ndarray]" = queue.Queue(maxsize=32)
_model: Optional[WhisperModel] = None

_stop_flag = threading.Event()
_last_text = ""


# -------------------------------------------------
# Helpers
# -------------------------------------------------
def _resolve_device():
    if DEVICE == "auto":
        return "cuda" if torch.cuda.is_available() else "cpu"
    return DEVICE


def _compute_type(real_device: str) -> str:
    if COMPUTE_TYPE_ENV:
        return COMPUTE_TYPE_ENV

    # Best settings for Large-V3
    return "float16" if real_device == "cuda" else "int8_float32"


def _load_model() -> WhisperModel:
    global _model
    if _model:
        return _model

    real_device = _resolve_device()
    compute = _compute_type(real_device)

    logging.info(f"[ASR] Loading Faster-Whisper {MODEL_NAME} ({real_device}, {compute})")

    _model = WhisperModel(
        MODEL_NAME,
        device=real_device,
        compute_type=compute,
        cpu_threads=8,
        num_workers=2
    )
    return _model


def _sd_callback(indata, frames, time_info, status):
    if status:
        logging.warning(f"Audio callback status: {status}")
    try:
        block = np.asarray(indata, dtype=np.float32)
        if block.ndim == 2:
            block = np.mean(block, axis=1, keepdims=True)
        _audio_q.put_nowait(block.copy())
    except queue.Full:
        pass


def stop_listener():
    """Stop the listener safely and clear old audio blocks."""
    _stop_flag.set()
    while not _audio_q.empty():
        try:
            _audio_q.get_nowait()
        except:
            break


# -------------------------------------------------
# Main Generator
# -------------------------------------------------
def listen_and_transcribe() -> Generator[str, None, None]:
    """Main streaming ASR generator — yields text in realtime."""
    global _last_text
    _stop_flag.clear()

    model = _load_model()

    sd.default.samplerate = SAMPLE_RATE
    sd.default.channels = CHANNELS

    target_samples = int(SAMPLE_RATE * BLOCK_SECONDS)
    buf = np.zeros((0, 1), dtype=np.float32)

    with sd.InputStream(
        samplerate=SAMPLE_RATE,
        channels=CHANNELS,
        dtype="float32",
        callback=_sd_callback,
        blocksize=int(SAMPLE_RATE * 0.4)
    ):
        while not _stop_flag.is_set():
            try:
                data = _audio_q.get(timeout=0.5)
            except queue.Empty:
                continue

            if data.ndim == 1:
                data = data[:, None]

            buf = np.concatenate((buf, data), axis=0)

            if buf.shape[0] < target_samples:
                continue

            chunk = buf[:target_samples, 0]
            buf = buf[target_samples:, :]

            try:
                # Auto-language support if WHISPER_LANG="auto"
                lang = LANGUAGE if LANGUAGE != "auto" else None

                segments, _info = model.transcribe(
                    chunk,
                    beam_size=3,
                    vad_filter=VAD_ENABLED,
                    vad_parameters={"min_silence_duration_ms": 400},
                    language=lang,
                    task="transcribe",
                    initial_prompt=INITIAL_PROMPT,
                    condition_on_previous_text=True,
                    no_speech_threshold=0.35,
                    compression_ratio_threshold=2.3,
                    temperature=0.0,
                )

                text = " ".join(s.text.strip() for s in segments if s.text.strip())
                text = re.sub(r"\s+", " ", text).strip()

                if len(text) >= MIN_CHARS and text != _last_text:
                    _last_text = text
                    if VERBOSE_CHUNKS:
                        logging.info(f"[ASR] {text}")
                    yield text

            except Exception as e:
                logging.error(f"[ASR] Error: {e}")
                continue


# -------------------------------------------------
# Public API — unchanged
# -------------------------------------------------
def start_listener(callback):
    def _run():
        for t in listen_and_transcribe():
            try:
                callback(t)
            except Exception as e:
                logging.error(f"Callback error: {e}")

    th = threading.Thread(target=_run, daemon=True)
    th.start()
    return th
