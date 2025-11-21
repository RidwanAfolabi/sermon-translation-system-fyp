"""
Simple standalone test script for Faster-Whisper listener.
Run with:
    python -m ml_pipeline.speech_recognition.whisper_listener_test
"""

import time
from ml_pipeline.speech_recognition.whisper_listener import listen_and_transcribe, stop_listener

print("🔊 Starting Faster-Whisper listener test...")
print("🎙️ Speak into the microphone. Press CTRL+C to stop.\n")

try:
    for text in listen_and_transcribe():
        print("🗣️ Recognized:", text)
        time.sleep(0.1)

except KeyboardInterrupt:
    print("\n🛑 Stopping...")
    stop_listener()
