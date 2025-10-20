"""Example demonstrating Live-Service phase workflow."""

import sys
import os
import time

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from src import SermonTranslationSystem


def simulate_audio_stream():
    """Simulate live audio stream with timestamps and features."""
    # Simulate 30 seconds of audio with speech segments
    duration = 30.0
    time_step = 1.0  # Process every second
    
    for t in range(int(duration / time_step)):
        timestamp = t * time_step
        
        # Simulate audio features with varying energy levels
        # Speech segments: 0-5s, 8-13s, 16-21s, 24-29s
        is_speech_time = (
            (0 <= timestamp <= 5) or
            (8 <= timestamp <= 13) or
            (16 <= timestamp <= 21) or
            (24 <= timestamp <= 29)
        )
        
        energy = 0.6 if is_speech_time else 0.05
        
        yield {
            'timestamp': timestamp,
            'energy': energy,
            'spectral_features': {'centroid': 2000}
        }


def main():
    """Demonstrate Live-Service workflow."""
    print("=" * 60)
    print("Live-Service Phase Example")
    print("Real-Time Speech Alignment and Subtitle Display")
    print("=" * 60)
    
    # Initialize system
    system = SermonTranslationSystem()
    
    sermon_id = "sermon_2024_001"
    
    # Setup Live-Service
    print(f"\nSermon ID: {sermon_id}")
    print("\n" + "-" * 60)
    print("Step 1: Setup Live-Service phase")
    print("-" * 60)
    
    setup_result = system.live_service_setup(sermon_id)
    
    if 'error' in setup_result:
        print(f"\n✗ Error: {setup_result['error']}")
        print("Please run pre_service_example.py first to approve a translation")
        system.shutdown()
        return
    
    print(f"\n✓ Live-Service setup complete")
    print(f"  Segments loaded: {setup_result['segments_loaded']}")
    print(f"  Status: {setup_result['status']}")
    
    # Simulate live audio processing
    print("\n" + "-" * 60)
    print("Step 2: Process live audio stream")
    print("-" * 60)
    
    print("\nSimulating live sermon audio...")
    print("(Processing audio in real-time with speech alignment)\n")
    
    displayed_count = 0
    
    for audio_features in simulate_audio_stream():
        timestamp = audio_features['timestamp']
        
        # Process audio
        subtitle_info = system.process_live_audio(
            sermon_id=sermon_id,
            audio_timestamp=timestamp,
            audio_features=audio_features
        )
        
        # Display subtitle if detected
        if subtitle_info:
            displayed_count += 1
            print(f"\n[{timestamp:.1f}s] SUBTITLE DISPLAYED:")
            print("-" * 50)
            rendered = system.subtitle.render_subtitle(subtitle_info)
            print(rendered)
            print("-" * 50)
            print(f"  Confidence: {subtitle_info['confidence']:.2f}")
            print(f"  Duration: {subtitle_info['start_time']:.1f}s - {subtitle_info['end_time']:.1f}s")
        
        # Brief pause to simulate real-time processing
        time.sleep(0.1)
    
    # Get alignment statistics
    print("\n" + "-" * 60)
    print("Step 3: Alignment Statistics")
    print("-" * 60)
    
    stats = system.aligner.get_alignment_statistics()
    print(f"\nTotal segments: {stats['total_segments']}")
    print(f"Aligned segments: {stats['aligned_segments']}")
    print(f"Pending segments: {stats['pending_segments']}")
    print(f"Average confidence: {stats['average_confidence']:.2f}")
    print(f"Final position: {stats['current_position']:.1f}s")
    
    # Get subtitle history
    print("\n" + "-" * 60)
    print("Subtitle Display History")
    print("-" * 60)
    
    history = system.subtitle.get_subtitle_history(sermon_id)
    print(f"\nTotal subtitles displayed: {len(history)}")
    for h in history[:3]:  # Show first 3
        print(f"\n  Segment {h['segment_index']}:")
        print(f"    Time: {h['start_time']:.1f}s - {h['end_time']:.1f}s")
        print(f"    Text: {h['text'][:50]}...")
        print(f"    Confidence: {h['confidence']:.2f}")
    
    # Cleanup
    system.shutdown()
    print("\n" + "=" * 60)
    print("Live-Service phase example completed!")
    print("=" * 60)


if __name__ == "__main__":
    main()
