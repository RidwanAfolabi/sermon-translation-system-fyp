# ml_pipeline/alignment_module/speech_listener.py
"""
Captures live microphone input and transcribes Malay speech in real-time.
Emits recognized text chunks for subtitle synchronization.
"""

import queue
import sounddevice as sd
from vosk import Model, KaldiRecognizer
import json

# Load Malay Vosk model (download from https://alphacephei.com/vosk/models)
MODEL_PATH = "models/vosk-model-ms"  # place your downloaded model here

q = queue.Queue()

def callback(indata, frames, time, status):
    if status:
        print(status)
    q.put(bytes(indata))

def listen_and_transcribe():
    model = Model(MODEL_PATH)
    recognizer = KaldiRecognizer(model, 16000)

    with sd.RawInputStream(samplerate=16000, blocksize=8000, dtype='int16',
                           channels=1, callback=callback):
        print("🎙️ Listening to khutbah (Malay speech)...")

        partial_text = ""
        while True:
            data = q.get()
            if recognizer.AcceptWaveform(data):
                result = json.loads(recognizer.Result())
                text = result.get("text", "").strip()
                if text:
                    yield text  # emit recognized Malay chunk
            else:
                partial = json.loads(recognizer.PartialResult()).get("partial", "")
                if partial and partial != partial_text:
                    partial_text = partial
