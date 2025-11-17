"""
For testing only
Real-time Malay speech recognition using OpenAI Whisper (Windows-safe version).
"""

import sounddevice as sd
import numpy as np
import whisper
import tempfile
import os
import queue
import torch
import soundfile as sf
import time

# ---------------- CONFIG ----------------
SAMPLE_RATE = 16000
BLOCK_DURATION = 5  # seconds per chunk
MODEL_NAME = "small"  # or "base", "tiny" for lighter model

# ---------------- INIT ----------------
print("🔄 Loading Whisper model...")
device = "cuda" if torch.cuda.is_available() else "cpu"
model = whisper.load_model(MODEL_NAME).to(device)
print(f"✅ Model loaded on {device}. Listening...")

# ---------------- AUDIO STREAM ----------------
q = queue.Queue()

def audio_callback(indata, frames, time_info, status):
    if status:
        print("⚠️", status)
    q.put(indata.copy())

def transcribe_chunk(audio_chunk):
    """Save audio chunk to WAV, wait for write to complete, transcribe, print result."""
    try:
        # Manual filename in system temp dir
        temp_dir = tempfile.gettempdir()
        wav_path = os.path.join(temp_dir, "whisper_chunk.wav")

        # Write chunk to file
        sf.write(wav_path, audio_chunk, SAMPLE_RATE)

        # Force file to flush & ensure it's readable
        time.sleep(0.2)
        if not os.path.exists(wav_path) or os.path.getsize(wav_path) == 0:
            print("⚠️ Temp WAV file not ready yet.")
            return

        # Run Whisper transcription
        result = model.transcribe(wav_path, language="ms")  # "ms" = Malay
        text = result.get("text", "").strip()

        if text:
            print("🗣️ Recognized:", text)

    except Exception as e:
        print(f"❌ Transcription error: {e}")
    finally:
        # Safely remove file if it exists
        try:
            if os.path.exists(wav_path):
                os.remove(wav_path)
        except Exception:
            pass

# ---------------- MAIN ----------------
with sd.InputStream(
    samplerate=SAMPLE_RATE,
    channels=1,
    dtype="float32",
    callback=audio_callback
):
    buffer = np.zeros((0, 1), dtype="float32")
    print("🎙️ Whisper listening... Speak now (Ctrl+C to stop)\n")

    try:
        while True:
            audio_data = q.get()
            buffer = np.concatenate((buffer, audio_data))

            # Process every few seconds
            if len(buffer) / SAMPLE_RATE >= BLOCK_DURATION:
                chunk = np.copy(buffer)
                buffer = np.zeros((0, 1), dtype="float32")
                transcribe_chunk(chunk)
    except KeyboardInterrupt:
        print("\n🛑 Stopped listening.")
