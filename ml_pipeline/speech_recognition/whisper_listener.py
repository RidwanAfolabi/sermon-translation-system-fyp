"""
Realtime Malay speech recognition using Faster-Whisper.

Exports:
- listen_and_transcribe(): generator yielding recognized Malay text chunks.

Env overrides:
- WHISPER_MODEL      (default: "small")
- WHISPER_LANG       (default: "ms")
- WHISPER_DEVICE     (default: "auto" | "cuda" | "cpu")
- WHISPER_COMPUTE    (default: auto: float16 on cuda, int8 on cpu)
- WHISPER_BLOCK_SECS (default: 4) chunk size in seconds
- WHISPER_MIN_CHARS  (default: 6) minimum chars to yield
- WHISPER_VAD        (default: false) enable VAD (requires torch)
"""
import os
import queue
import logging
from typing import Generator, Optional

import numpy as np
import sounddevice as sd
from faster_whisper import WhisperModel

logger = logging.getLogger(__name__)

SAMPLE_RATE = 16000
CHANNELS = 1

MODEL_NAME = os.getenv("WHISPER_MODEL", "small")
LANGUAGE = os.getenv("WHISPER_LANG", "ms")
DEVICE = os.getenv("WHISPER_DEVICE", "auto")  # "auto" | "cuda" | "cpu"
COMPUTE_TYPE_ENV = os.getenv("WHISPER_COMPUTE")  # optional override
BLOCK_SECONDS = float(os.getenv("WHISPER_BLOCK_SECS", "4"))
MIN_CHARS = int(os.getenv("WHISPER_MIN_CHARS", "6"))
VAD_ENABLED = os.getenv("WHISPER_VAD", "false").lower() in {"1", "true", "yes"}

_audio_q: "queue.Queue[np.ndarray]" = queue.Queue(maxsize=8)
_model: Optional[WhisperModel] = None


def _compute_type(device: str) -> str:
    if COMPUTE_TYPE_ENV:
        return COMPUTE_TYPE_ENV
    return "float16" if device == "cuda" else "int8"


def _load_model() -> WhisperModel:
    global _model
    if _model is not None:
        return _model
    compute_type = _compute_type(DEVICE if DEVICE != "auto" else "cuda")
    try:
        _model = WhisperModel(
            MODEL_NAME,
            device=DEVICE,           # "auto" picks CUDA if available else CPU
            compute_type=compute_type
        )
        logger.info(f"Faster-Whisper loaded: model={MODEL_NAME}, device={DEVICE}, compute={compute_type}")
    except Exception as e:
        logger.exception(f"Failed to load Faster-Whisper model '{MODEL_NAME}': {e}")
        raise
    return _model


def _sd_callback(indata, frames, time_info, status):
    if status:
        # Non-fatal (e.g., underflow/overflow)
        logger.warning(f"Audio status: {status}")
    try:
        # Ensure float32 mono array
        block = np.asarray(indata, dtype=np.float32)
        if block.ndim == 2 and block.shape[1] > 1:
            block = np.mean(block, axis=1, keepdims=True)  # downmix to mono
        _audio_q.put_nowait(block.copy())
    except queue.Full:
        # Drop if producer is faster than consumer
        pass


def listen_and_transcribe() -> Generator[str, None, None]:
    """
    Open microphone and yield recognized Malay text every BLOCK_SECONDS.
    """
    model = _load_model()

    # Configure sounddevice defaults
    sd.default.samplerate = SAMPLE_RATE
    sd.default.channels = CHANNELS

    block_frames = int(SAMPLE_RATE * BLOCK_SECONDS)
    buf = np.zeros((0, 1), dtype=np.float32)

    # Start microphone stream
    with sd.InputStream(
        samplerate=SAMPLE_RATE,
        channels=CHANNELS,
        dtype="float32",
        blocksize=int(SAMPLE_RATE * 0.5),  # ~0.5s callback blocks
        callback=_sd_callback,
    ):
        logger.info(f"Listening mic at {SAMPLE_RATE}Hz, chunk={BLOCK_SECONDS}s, lang={LANGUAGE}")
        while True:
            # Wait for next audio block
            data = _audio_q.get()
            if data is None:
                continue
            # Append to buffer
            if data.ndim == 1:
                data = data[:, None]
            buf = np.concatenate((buf, data), axis=0)

            # Process when we have enough samples
            if buf.shape[0] >= block_frames:
                chunk = buf[:block_frames, 0].astype(np.float32)  # 1D float32
                # keep any spillover for next chunk
                buf = buf[block_frames:, :]

                try:
                    segments, _info = model.transcribe(
                        chunk,
                        language=LANGUAGE,
                        beam_size=1,          # greedy for speed/stability
                        vad_filter=VAD_ENABLED,
                        vad_parameters=dict(min_silence_duration_ms=500) if VAD_ENABLED else None,
                        no_speech_threshold=0.6,  # ignore near-silence
                    )
                    text_pieces = []
                    for seg in segments:
                        t = (seg.text or "").strip()
                        if t:
                            text_pieces.append(t)
                    out_text = " ".join(text_pieces).strip()
                    # Basic denoise and minimum length filter
                    out_text = out_text.replace("  ", " ").strip()
                    if len(out_text) >= MIN_CHARS:
                        yield out_text
                except Exception as e:
                    logger.error(f"Whisper transcription error: {e}")
                    # continue listening even if this chunk fails
                    continue