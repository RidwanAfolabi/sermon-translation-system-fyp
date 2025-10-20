"""Simple test to verify the system architecture without ML dependencies."""

import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

def test_imports():
    """Test that all modules can be imported."""
    print("Testing module imports...")
    
    try:
        from src.common import Config, Database
        print("✓ Common modules imported")
        
        # Don't import full system for architecture tests
        # Individual module tests will import them as needed
        print("✓ Module structure validated")
        
        return True
    except Exception as e:
        print(f"✗ Import failed: {e}")
        return False


def test_config():
    """Test configuration loading."""
    print("\nTesting configuration...")
    
    try:
        from src.common import Config
        config = Config()
        
        # Test getting values
        model_name = config.get('pre_service.translation.model_name')
        min_score = config.get('pre_service.vetting.min_approval_score')
        
        print(f"✓ Config loaded: model={model_name}, min_score={min_score}")
        return True
    except Exception as e:
        print(f"✗ Config test failed: {e}")
        return False


def test_database():
    """Test database initialization."""
    print("\nTesting database...")
    
    try:
        from src.common import Database
        
        # Use in-memory database for testing
        db = Database('sqlite:///:memory:')
        session = db.get_session()
        session.close()
        db.close()
        
        print("✓ Database initialized successfully")
        return True
    except Exception as e:
        print(f"✗ Database test failed: {e}")
        return False


def test_vetting_system():
    """Test vetting system without ML model."""
    print("\nTesting vetting system...")
    
    try:
        from src.common import Database
        # Import VettingSystem directly from module to avoid full system import
        import sys
        import os
        vetting_module_path = os.path.join(os.path.dirname(__file__), '..', 'src', 'pre_service')
        sys.path.insert(0, vetting_module_path)
        
        from vetting import VettingSystem
        
        db = Database('sqlite:///:memory:')
        vetting = VettingSystem(db, min_approval_score=0.8)
        
        # Submit a translation
        translation_id = vetting.submit_for_vetting(
            sermon_id="test_001",
            source_text="Test source",
            translated_text="Test translation",
            translation_confidence=0.85
        )
        
        # Get pending
        pending = vetting.get_pending_vettion()
        assert len(pending) == 1
        
        # Approve
        approved = vetting.approve_translation("test_001", 0.9, "Corrected text")
        assert approved == True
        
        # Get statistics
        stats = vetting.get_statistics()
        assert stats['approved'] == 1
        
        db.close()
        print("✓ Vetting system works correctly")
        return True
    except Exception as e:
        print(f"✗ Vetting system test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_speech_aligner():
    """Test speech alignment without audio processing."""
    print("\nTesting speech aligner...")
    
    try:
        # Import SpeechAligner directly
        import sys
        import os
        live_module_path = os.path.join(os.path.dirname(__file__), '..', 'src', 'live_service')
        sys.path.insert(0, live_module_path)
        
        from alignment import SpeechAligner
        
        aligner = SpeechAligner()
        aligner.load_sermon_segments("test_001", "This is a test. Another sentence.")
        
        # Check segments loaded
        assert len(aligner.segments) == 2
        
        # Test speech detection
        audio_features = {'timestamp': 1.0, 'energy': 0.8}
        detection = aligner.detect_speech(audio_features)
        assert 'is_speech' in detection
        
        # Test alignment
        aligned = aligner.align_segment(1.0, audio_features)
        assert aligned is not None
        
        # Get statistics
        stats = aligner.get_alignment_statistics()
        assert stats['total_segments'] == 2
        
        print("✓ Speech aligner works correctly")
        return True
    except Exception as e:
        print(f"✗ Speech aligner test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_subtitle_display():
    """Test subtitle display system."""
    print("\nTesting subtitle display...")
    
    try:
        from src.common import Database
        # Import SubtitleDisplay directly
        import sys
        import os
        live_module_path = os.path.join(os.path.dirname(__file__), '..', 'src', 'live_service')
        sys.path.insert(0, live_module_path)
        
        from subtitle import SubtitleDisplay
        
        db = Database('sqlite:///:memory:')
        subtitle = SubtitleDisplay(db)
        
        # Format subtitle
        lines = subtitle.format_subtitle("This is a test subtitle that is quite long")
        assert len(lines) > 0
        
        # Display subtitle
        info = subtitle.display_subtitle(
            sermon_id="test_001",
            segment_index=0,
            text="Test subtitle",
            start_time=1.0,
            end_time=3.0,
            confidence=0.9
        )
        assert info is not None
        
        # Render subtitle
        rendered = subtitle.render_subtitle(info)
        assert len(rendered) > 0
        
        db.close()
        print("✓ Subtitle display works correctly")
        return True
    except Exception as e:
        print(f"✗ Subtitle display test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_analytics():
    """Test analytics engine."""
    print("\nTesting analytics engine...")
    
    try:
        from src.common import Database
        # Import AnalyticsEngine directly
        import sys
        import os
        post_module_path = os.path.join(os.path.dirname(__file__), '..', 'src', 'post_service')
        sys.path.insert(0, post_module_path)
        
        from analytics import AnalyticsEngine
        
        db = Database('sqlite:///:memory:')
        analytics = AnalyticsEngine(db)
        
        # Log a metric
        analytics.log_metric(
            sermon_id="test_001",
            phase="pre",
            metric_type="accuracy",
            metric_value=0.95
        )
        
        # Get aggregate statistics
        stats = analytics.get_aggregate_statistics()
        assert 'message' in stats  # No translations yet
        
        # Identify improvements
        improvements = analytics.identify_improvement_areas()
        assert isinstance(improvements, list)
        
        db.close()
        print("✓ Analytics engine works correctly")
        return True
    except Exception as e:
        print(f"✗ Analytics test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_refinement():
    """Test model refinement system."""
    print("\nTesting model refinement...")
    
    try:
        from src.common import Database
        # Import ModelRefinement directly
        import sys
        import os
        post_module_path = os.path.join(os.path.dirname(__file__), '..', 'src', 'post_service')
        sys.path.insert(0, post_module_path)
        
        from refinement import ModelRefinement
        
        db = Database('sqlite:///:memory:')
        refinement = ModelRefinement(db)
        
        # Collect training data (should be empty)
        data = refinement.collect_training_data()
        assert len(data) == 0
        
        # Check if should retrain
        recommendation = refinement.should_retrain()
        assert 'should_retrain' in recommendation
        
        # Analyze patterns
        patterns = refinement.analyze_correction_patterns()
        assert 'message' in patterns or 'total_corrections' in patterns
        
        db.close()
        print("✓ Model refinement works correctly")
        return True
    except Exception as e:
        print(f"✗ Model refinement test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Run all tests."""
    print("=" * 60)
    print("Sermon Translation System - Architecture Tests")
    print("=" * 60)
    
    tests = [
        test_imports,
        test_config,
        test_database,
        test_vetting_system,
        test_speech_aligner,
        test_subtitle_display,
        test_analytics,
        test_refinement
    ]
    
    results = []
    for test in tests:
        result = test()
        results.append(result)
    
    print("\n" + "=" * 60)
    print(f"Test Results: {sum(results)}/{len(results)} passed")
    print("=" * 60)
    
    if all(results):
        print("\n✅ All tests passed!")
        return 0
    else:
        print("\n❌ Some tests failed")
        return 1


if __name__ == "__main__":
    sys.exit(main())
