"""
Realtime Malay speech recognition using Faster-Whisper.
Yields Malay text chunks every N seconds.

Configure via env:
WHISPER_MODEL (small|medium|large-v2|...)
WHISPER_LANG (default: ms)
WHISPER_DEVICE (auto|cuda|cpu)
WHISPER_COMPUTE (override compute_type)
WHISPER_BLOCK_SECS (default: 4)
WHISPER_MIN_CHARS (default: 6)
WHISPER_VAD (true/false)
"""

import os
import queue
import logging
import threading
from typing import Generator, Optional

import numpy as np
import sounddevice as sd
import torch
from faster_whisper import WhisperModel

logger = logging.getLogger(__name__)

SAMPLE_RATE = 16000
CHANNELS = 1

MODEL_NAME = os.getenv("WHISPER_MODEL", "small")
LANGUAGE = os.getenv("WHISPER_LANG", "ms")
DEVICE = os.getenv("WHISPER_DEVICE", "auto")  # auto|cuda|cpu
COMPUTE_TYPE_ENV = os.getenv("WHISPER_COMPUTE")
BLOCK_SECONDS = float(os.getenv("WHISPER_BLOCK_SECS", "4"))
MIN_CHARS = int(os.getenv("WHISPER_MIN_CHARS", "6"))
VAD_ENABLED = os.getenv("WHISPER_VAD", "false").lower() in {"1", "true", "yes"}

_audio_q: "queue.Queue[np.ndarray]" = queue.Queue(maxsize=8)
_model: Optional[WhisperModel] = None
_stop_flag = threading.Event()
_last_text = ""


def _resolve_device() -> str:
    if DEVICE == "auto":
        return "cuda" if torch.cuda.is_available() else "cpu"
    return DEVICE


def _compute_type(real_device: str) -> str:
    if COMPUTE_TYPE_ENV:
        return COMPUTE_TYPE_ENV
    if real_device == "cuda":
        return "float16"
    # Prefer int8_float16 if available for CPU quality; fallback int8
    return "int8_float16"


def _load_model() -> WhisperModel:
    global _model
    if _model:
        return _model
    real_device = _resolve_device()
    compute_type = _compute_type(real_device)
    try:
        _model = WhisperModel(MODEL_NAME, device=real_device, compute_type=compute_type)
        logger.info(f"Loaded Faster-Whisper model={MODEL_NAME} device={real_device} compute={compute_type}")
    except Exception as e:
        logger.exception(f"Model load failed: {e}")
        raise
    return _model


def _sd_callback(indata, frames, time_info, status):
    if status:
        logger.warning(f"Audio status: {status}")
    try:
        block = np.asarray(indata, dtype=np.float32)
        if block.ndim == 2 and block.shape[1] > 1:
            block = np.mean(block, axis=1, keepdims=True)
        _audio_q.put_nowait(block.copy())
    except queue.Full:
        # Drop overflow silently
        pass


def stop_listener():
    _stop_flag.set()


def listen_and_transcribe() -> Generator[str, None, None]:
    """
    Blocking generator: yields recognized Malay chunks until stop_listener() is called.
    Run in a thread when integrating with async WebSocket.
    """
    global _last_text
    model = _load_model()
    sd.default.samplerate = SAMPLE_RATE
    sd.default.channels = CHANNELS

    block_frames = int(SAMPLE_RATE * BLOCK_SECONDS)
    buf = np.zeros((0, 1), dtype=np.float32)

    real_device = _resolve_device()
    logger.info(f"Listening mic SR={SAMPLE_RATE}Hz block={BLOCK_SECONDS}s lang={LANGUAGE} device={real_device}")

    with sd.InputStream(
        samplerate=SAMPLE_RATE,
        channels=CHANNELS,
        dtype="float32",
        blocksize=int(SAMPLE_RATE * 0.5),
        callback=_sd_callback,
    ):
        while not _stop_flag.is_set():
            try:
                data = _audio_q.get(timeout=0.5)
            except queue.Empty:
                continue
            if data is None:
                continue
            if data.ndim == 1:
                data = data[:, None]
            buf = np.concatenate((buf, data), axis=0)

            if buf.shape[0] >= block_frames:
                chunk = buf[:block_frames, 0].astype(np.float32)
                buf = buf[block_frames:, :]

                try:
                    segments, _info = model.transcribe(
                        chunk,
                        language=LANGUAGE,
                        beam_size=1,
                        vad_filter=VAD_ENABLED,
                        vad_parameters=dict(min_silence_duration_ms=500) if VAD_ENABLED else None,
                        no_speech_threshold=0.6,
                        condition_on_previous_text=False,
                        temperature=0.0,
                    )
                    pieces = []
                    for seg in segments:
                        t = (seg.text or "").strip()
                        if t:
                            pieces.append(t)
                    out_text = " ".join(pieces).strip()
                    out_text = " ".join(out_text.split())  # collapse spaces
                    if len(out_text) >= MIN_CHARS and out_text != _last_text:
                        _last_text = out_text
                        yield out_text
                except Exception as e:
                    logger.error(f"Transcription error: {e}")
                    continue


def start_listener(callback):
    """
    Convenience: run listener in a daemon thread.
    callback(text:str) called on each yielded chunk.
    """
    def _run():
        for text in listen_and_transcribe():
            try:
                callback(text)
            except Exception as e:
                logger.error(f"Callback error: {e}")

    t = threading.Thread(target=_run, daemon=True)
    t.start()
    return t