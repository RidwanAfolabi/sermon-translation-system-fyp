"""Simpler integration test without ML dependencies."""

import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))


def test_basic_workflow():
    """Test basic workflow without ML translation."""
    print("=" * 60)
    print("Basic Integration Test")
    print("=" * 60)
    
    from src.common import Config, Database
    
    # Test 1: Configuration
    print("\n1. Testing configuration...")
    config = Config()
    assert config.get('pre_service.vetting.min_approval_score') == 0.8
    print("✓ Configuration loaded")
    
    # Test 2: Database
    print("\n2. Testing database...")
    db = Database('sqlite:///:memory:')
    session = db.get_session()
    session.close()
    print("✓ Database initialized")
    
    # Test 3: Vetting without ML dependencies
    print("\n3. Testing vetting system...")
    from src.pre_service.vetting import VettingSystem
    
    vetting = VettingSystem(db, min_approval_score=0.8)
    
    # Submit translation
    vetting.submit_for_vetting(
        sermon_id="test_001",
        source_text="Selamat pagi",
        translated_text="Good morning",
        translation_confidence=0.85
    )
    
    # Get pending
    pending = vetting.get_pending_vettion()
    assert len(pending) == 1
    print(f"✓ Submitted translation for vetting")
    
    # Approve
    approved = vetting.approve_translation("test_001", 0.9, "Good morning")
    assert approved == True
    print(f"✓ Approved translation")
    
    # Get approved translation
    approved_trans = vetting.get_approved_translation("test_001")
    assert approved_trans is not None
    print(f"✓ Retrieved approved translation")
    
    # Test 4: Speech alignment
    print("\n4. Testing speech alignment...")
    from src.live_service.alignment import SpeechAligner
    
    aligner = SpeechAligner()
    aligner.load_sermon_segments("test_001", "Good morning. How are you?")
    assert len(aligner.segments) == 2
    print(f"✓ Loaded {len(aligner.segments)} segments")
    
    # Align a segment
    audio_features = {'timestamp': 1.0, 'energy': 0.8}
    aligned = aligner.align_segment(1.0, audio_features)
    assert aligned is not None
    print(f"✓ Aligned segment")
    
    # Test 5: Subtitle display
    print("\n5. Testing subtitle display...")
    from src.live_service.subtitle import SubtitleDisplay
    
    subtitle_sys = SubtitleDisplay(db)
    
    # Format subtitle
    lines = subtitle_sys.format_subtitle("This is a test subtitle")
    assert len(lines) > 0
    print(f"✓ Formatted subtitle into {len(lines)} lines")
    
    # Display subtitle
    info = subtitle_sys.display_subtitle(
        sermon_id="test_001",
        segment_index=0,
        text="Good morning",
        start_time=0.0,
        end_time=2.0,
        confidence=0.9
    )
    assert info is not None
    print(f"✓ Displayed subtitle")
    
    # Test 6: Analytics
    print("\n6. Testing analytics...")
    from src.post_service.analytics import AnalyticsEngine
    
    analytics = AnalyticsEngine(db)
    
    # Log metric
    analytics.log_metric("test_001", "pre", "accuracy", 0.9)
    print(f"✓ Logged metric")
    
    # Generate report
    report = analytics.generate_sermon_report("test_001")
    assert 'accuracy_metrics' in report
    print(f"✓ Generated sermon report")
    
    # Test 7: Model refinement
    print("\n7. Testing model refinement...")
    from src.post_service.refinement import ModelRefinement
    
    refinement = ModelRefinement(db)
    
    # Check if should retrain
    recommendation = refinement.should_retrain()
    assert 'should_retrain' in recommendation
    print(f"✓ Checked refinement needs: {recommendation['reason']}")
    
    # Cleanup
    db.close()
    
    print("\n" + "=" * 60)
    print("✅ All integration tests passed!")
    print("=" * 60)
    return True


if __name__ == "__main__":
    try:
        success = test_basic_workflow()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
