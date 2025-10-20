"""Example demonstrating Post-Service phase workflow."""

import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from src import SermonTranslationSystem


def main():
    """Demonstrate Post-Service workflow."""
    print("=" * 60)
    print("Post-Service Phase Example")
    print("Analytics and Model Refinement")
    print("=" * 60)
    
    # Initialize system
    system = SermonTranslationSystem()
    
    sermon_id = "sermon_2024_001"
    
    # Generate sermon report
    print(f"\nSermon ID: {sermon_id}")
    print("\n" + "-" * 60)
    print("Step 1: Generate Sermon Analysis Report")
    print("-" * 60)
    
    report = system.post_service_analysis(sermon_id)
    
    if 'error' in report.get('accuracy_metrics', {}):
        print(f"\n✗ Error: {report['accuracy_metrics']['error']}")
        print("Please run pre_service_example.py and live_service_example.py first")
        system.shutdown()
        return
    
    print("\n📊 ACCURACY METRICS")
    print("-" * 40)
    accuracy = report['accuracy_metrics']
    print(f"Translation confidence: {accuracy['translation_confidence']:.2f}")
    print(f"Expert approval score: {accuracy['approval_score']:.2f}")
    print(f"Expert approved: {accuracy['expert_approved']}")
    print(f"Has corrections: {accuracy['has_corrections']}")
    if 'correction_rate' in accuracy:
        print(f"Correction rate: {accuracy['correction_rate']:.1%}")
    
    print("\n⏱️  TIMING & ALIGNMENT METRICS")
    print("-" * 40)
    timing = report['timing_metrics']
    if 'error' not in timing:
        print(f"Total segments: {timing['total_segments']}")
        print(f"Average confidence: {timing['average_confidence']:.2f}")
        print(f"Average duration: {timing['average_duration']:.2f}s")
        print(f"Confidence range: {timing['min_confidence']:.2f} - {timing['max_confidence']:.2f}")
    
    # Aggregate statistics
    print("\n" + "-" * 60)
    print("Step 2: Aggregate Statistics Across All Sermons")
    print("-" * 60)
    
    aggregate = system.analytics.get_aggregate_statistics()
    
    print("\n📈 SYSTEM-WIDE STATISTICS")
    print("-" * 40)
    if 'message' not in aggregate:
        print(f"Total sermons: {aggregate['total_sermons']}")
        print(f"Approved sermons: {aggregate['approved_sermons']}")
        print(f"Approval rate: {aggregate['approval_rate']:.1%}")
        print(f"Average translation confidence: {aggregate['average_translation_confidence']:.2f}")
        print(f"Average approval score: {aggregate['average_approval_score']:.2f}")
        print(f"Correction rate: {aggregate['correction_rate']:.1%}")
    else:
        print(aggregate['message'])
    
    # Identify improvement areas
    print("\n" + "-" * 60)
    print("Step 3: Identify Improvement Areas")
    print("-" * 60)
    
    improvements = system.analytics.identify_improvement_areas()
    
    if improvements:
        print(f"\n⚠️  Found {len(improvements)} improvement areas:\n")
        for i, imp in enumerate(improvements, 1):
            print(f"{i}. {imp['area']} (Priority: {imp['priority']})")
            print(f"   Issue: {imp['issue']}")
            print(f"   Suggestion: {imp['suggestion']}\n")
    else:
        print("\n✓ No critical improvement areas identified")
    
    # Check refinement needs
    print("\n" + "-" * 60)
    print("Step 4: Model Refinement Check")
    print("-" * 60)
    
    refinement_check = system.check_refinement_needs()
    
    print(f"\nData points collected: {refinement_check['data_points']}/{refinement_check['required_data_points']}")
    print(f"Should retrain: {refinement_check['should_retrain']}")
    print(f"Reason: {refinement_check['reason']}")
    
    if refinement_check['should_retrain']:
        print("\n🔄 REFINEMENT RECOMMENDED")
        print("-" * 40)
        
        if 'improvement_potential' in refinement_check:
            print(f"Improvement potential: {refinement_check['improvement_potential']:.1%}")
        
        if 'improvement_areas' in refinement_check:
            print("\nKey areas for refinement:")
            for area in refinement_check['improvement_areas']:
                print(f"  - {area['area']}: {area['issue']}")
        
        # Prepare fine-tuning dataset
        print("\n📦 Preparing fine-tuning dataset...")
        dataset_path = "data/translations/fine_tuning_data.json"
        dataset_info = system.refinement.prepare_fine_tuning_dataset(dataset_path)
        
        if 'error' not in dataset_info:
            print(f"\n✓ Dataset prepared successfully")
            print(f"  Path: {dataset_info['dataset_path']}")
            print(f"  Examples: {dataset_info['total_examples']}")
            print(f"  Format: {dataset_info['format']}")
    else:
        print("\n✓ Model is performing adequately - no retraining needed")
    
    # Analysis of correction patterns
    print("\n" + "-" * 60)
    print("Step 5: Correction Pattern Analysis")
    print("-" * 60)
    
    patterns = system.refinement.analyze_correction_patterns()
    
    if 'message' not in patterns:
        print(f"\nTotal corrections analyzed: {patterns['total_corrections']}")
        
        if 'quality_metrics' in patterns:
            print("\nQuality Metrics:")
            for metric, value in patterns['quality_metrics'].items():
                if isinstance(value, float):
                    print(f"  {metric}: {value:.2f}")
                else:
                    print(f"  {metric}: {value}")
        
        if patterns['common_issues']:
            print("\nCommon Issues Detected:")
            for issue in patterns['common_issues']:
                print(f"  • {issue['type']} ({issue['severity']})")
                print(f"    {issue['description']}")
    else:
        print(f"\n{patterns['message']}")
    
    # Cleanup
    system.shutdown()
    print("\n" + "=" * 60)
    print("Post-Service phase example completed!")
    print("=" * 60)


if __name__ == "__main__":
    main()
