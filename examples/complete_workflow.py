"""Complete end-to-end workflow example."""

import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from src import SermonTranslationSystem


def main():
    """Demonstrate complete end-to-end workflow."""
    print("\n" + "=" * 70)
    print(" " * 15 + "SERMON TRANSLATION SYSTEM")
    print(" " * 12 + "Complete End-to-End Workflow")
    print("=" * 70)
    
    # Initialize system
    system = SermonTranslationSystem()
    
    sermon_id = "sermon_complete_demo"
    
    # ============================================================
    # PHASE 1: PRE-SERVICE
    # ============================================================
    print("\n" + "█" * 70)
    print("  PHASE 1: PRE-SERVICE - Translation & Expert Vetting")
    print("█" * 70)
    
    malay_text = """
    Selamat sejahtera kepada semua yang hadir. Terima kasih kerana meluangkan 
    masa untuk bersama-sama pada pagi ini. Hari ini saya ingin berkongsi 
    tentang pentingnya keimanan dan ketabahan dalam menghadapi cabaran hidup.
    """
    
    print(f"\n📝 Original Sermon (Malay):\n{malay_text}")
    
    # Translate
    print("\n🤖 Translating with MT model...")
    pre_result = system.pre_service_workflow(sermon_id, malay_text)
    print(f"\n✅ Translation completed (Confidence: {pre_result['confidence']:.2f})")
    print(f"\n📄 Machine Translation:\n{pre_result['translation']}")
    
    # Expert vetting
    print("\n👨‍💼 Submitting for expert review...")
    expert_corrections = """
    Peace be upon all who are present. Thank you for taking the time to join 
    us this morning. Today I would like to share about the importance of faith 
    and perseverance in facing life's challenges.
    """
    
    approved = system.approve_translation(sermon_id, 0.94, expert_corrections)
    print(f"\n✅ Expert approval: {'APPROVED' if approved else 'REJECTED'} (Score: 0.94)")
    
    # ============================================================
    # PHASE 2: LIVE-SERVICE
    # ============================================================
    print("\n" + "█" * 70)
    print("  PHASE 2: LIVE-SERVICE - Real-Time Alignment & Subtitles")
    print("█" * 70)
    
    # Setup
    print("\n⚙️  Setting up live service...")
    setup = system.live_service_setup(sermon_id)
    print(f"✅ Ready - {setup['segments_loaded']} segments loaded")
    
    # Simulate live processing
    print("\n📡 Processing live audio stream...\n")
    
    # Simulate a few audio frames
    timestamps = [0, 2.5, 5.0, 8.0, 10.5]
    for i, ts in enumerate(timestamps):
        audio_features = {
            'timestamp': ts,
            'energy': 0.7,  # High energy = speech detected
            'spectral_features': {'centroid': 2000}
        }
        
        subtitle = system.process_live_audio(sermon_id, ts, audio_features)
        
        if subtitle and i < 2:  # Show first 2 subtitles
            print(f"[{ts:.1f}s] 📺 SUBTITLE:")
            print("┌" + "─" * 50 + "┐")
            for line in subtitle['lines']:
                print(f"│ {line.ljust(48)} │")
            print("└" + "─" * 50 + "┘")
            print(f"Confidence: {subtitle['confidence']:.2f}\n")
    
    stats = system.aligner.get_alignment_statistics()
    print(f"✅ Live service completed - {stats['aligned_segments']} segments aligned")
    
    # ============================================================
    # PHASE 3: POST-SERVICE
    # ============================================================
    print("\n" + "█" * 70)
    print("  PHASE 3: POST-SERVICE - Analytics & Model Refinement")
    print("█" * 70)
    
    # Generate report
    print("\n📊 Generating performance report...")
    report = system.post_service_analysis(sermon_id)
    
    print("\n📈 PERFORMANCE SUMMARY:")
    print("─" * 50)
    
    accuracy = report['accuracy_metrics']
    print(f"  Translation Confidence: {accuracy['translation_confidence']:.2f}")
    print(f"  Expert Approval Score:  {accuracy['approval_score']:.2f}")
    
    timing = report['timing_metrics']
    if 'total_segments' in timing:
        print(f"  Segments Aligned:       {timing['total_segments']}")
        print(f"  Average Confidence:     {timing['average_confidence']:.2f}")
    
    # Check for improvements
    print("\n🔍 Analyzing improvement opportunities...")
    refinement = system.check_refinement_needs()
    
    if refinement['should_retrain']:
        print(f"\n⚠️  Refinement recommended: {refinement['reason']}")
    else:
        print(f"\n✅ System performing well: {refinement['reason']}")
    
    # Final statistics
    print("\n" + "─" * 70)
    aggregate = system.analytics.get_aggregate_statistics()
    if 'total_sermons' in aggregate:
        print(f"\n📊 SYSTEM STATISTICS:")
        print(f"  Total Sermons Processed: {aggregate['total_sermons']}")
        print(f"  Approval Rate:          {aggregate['approval_rate']:.1%}")
        print(f"  Avg Translation Score:  {aggregate['average_translation_confidence']:.2f}")
    
    # Cleanup
    system.shutdown()
    
    print("\n" + "=" * 70)
    print(" " * 20 + "✅ WORKFLOW COMPLETED")
    print("=" * 70)
    print("\nAll three phases executed successfully:")
    print("  ✓ Pre-Service:  Translation & Vetting")
    print("  ✓ Live-Service: Real-Time Alignment & Display")
    print("  ✓ Post-Service: Analytics & Refinement")
    print("\n" + "=" * 70 + "\n")


if __name__ == "__main__":
    main()
