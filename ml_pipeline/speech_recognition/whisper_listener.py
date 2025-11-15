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

import os, queue, logging, threading, re
from typing import Generator, Optional
import numpy as np
import sounddevice as sd
import torch
from faster_whisper import WhisperModel

SAMPLE_RATE = 16000
CHANNELS = 1
MODEL_NAME = os.getenv("WHISPER_MODEL", "medium")  # upgrade for accuracy
LANGUAGE = os.getenv("WHISPER_LANG", "ms")
DEVICE = os.getenv("WHISPER_DEVICE", "auto")
COMPUTE_TYPE_ENV = os.getenv("WHISPER_COMPUTE")
BLOCK_SECONDS = float(os.getenv("WHISPER_BLOCK_SECS", "6"))  # larger chunk for context
MIN_CHARS = int(os.getenv("WHISPER_MIN_CHARS", "6"))
VERBOSE_CHUNKS = os.getenv("WHISPER_VERBOSE", "true").lower() in {"1","true","yes"}
VAD_ENABLED = os.getenv("WHISPER_VAD", "true").lower() in {"1","true","yes"}  # NEW
INITIAL_PROMPT = os.getenv("WHISPER_PROMPT")  # optional domain bias prompt

_audio_q: "queue.Queue[np.ndarray]" = queue.Queue(maxsize=24)  # increased to reduce overflows
_model: Optional[WhisperModel] = None
_stop_flag = threading.Event()
_last_text = ""

def _resolve_device():
    if DEVICE == "auto":
        return "cuda" if torch.cuda.is_available() else "cpu"
    return DEVICE

def _compute_type(real_device: str) -> str:
    if COMPUTE_TYPE_ENV:
        return COMPUTE_TYPE_ENV
    return "float16" if real_device == "cuda" else "int8"

def _load_model() -> WhisperModel:
    global _model
    if _model: return _model
    real_device = _resolve_device()
    comp = _compute_type(real_device)
    try:
        _model = WhisperModel(MODEL_NAME, device=real_device, compute_type=comp)
    except ValueError:
        _model = WhisperModel(MODEL_NAME, device=real_device, compute_type="int8")
    logging.info(f"[ASR] model={MODEL_NAME} device={real_device} compute={comp}")
    return _model

def _sd_callback(indata, frames, time_info, status):
    if status:
        logging.warning(f"Audio status: {status}")
    try:
        block = np.asarray(indata, dtype=np.float32)
        if block.ndim == 2 and block.shape[1] > 1:
            block = np.mean(block, axis=1, keepdims=True)
        _audio_q.put_nowait(block.copy())
    except queue.Full:
        pass

def stop_listener():
    _stop_flag.set()

def listen_and_transcribe() -> Generator[str, None, None]:
    global _last_text
    _stop_flag.clear()  # NEW: ensure listener runs after prior stop
    model = _load_model()
    sd.default.samplerate = SAMPLE_RATE
    sd.default.channels = CHANNELS
    target_samples = int(SAMPLE_RATE * BLOCK_SECONDS)
    buf = np.zeros((0, 1), dtype=np.float32)
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
            if data.ndim == 1:
                data = data[:, None]
            buf = np.concatenate((buf, data), axis=0)
            if buf.shape[0] < target_samples:
                continue
            chunk = buf[:target_samples, 0]
            buf = buf[target_samples:, :]
            try:
                segments, _info = model.transcribe(
                    chunk,
                    language=LANGUAGE,
                    beam_size=2,            # lowered for speed (was 3)
                    # patience removed (invalid at 0); omit or set to 1 if needed:
                    # patience=1,
                    vad_filter=VAD_ENABLED,
                    vad_parameters={"min_silence_duration_ms": 300},
                    temperature=0.0,  # deterministic (sampling not used with beam)
                    compression_ratio_threshold=2.4,
                    no_speech_threshold=0.5,
                    condition_on_previous_text=True,
                    initial_prompt=INITIAL_PROMPT,
                )
                text = " ".join(s.text.strip() for s in segments if s.text.strip())
                text = re.sub(r"\s+", " ", text).strip()
                if len(text) >= MIN_CHARS and text != _last_text:
                    _last_text = text
                    if VERBOSE_CHUNKS:
                        logging.info(f"[ASR] {text}")
                    yield text
            except Exception as e:
                logging.error(f"Transcription error: {e}")
                continue

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