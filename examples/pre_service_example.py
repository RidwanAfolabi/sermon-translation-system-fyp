"""Example demonstrating Pre-Service phase workflow."""

import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from src import SermonTranslationSystem


def main():
    """Demonstrate Pre-Service workflow."""
    print("=" * 60)
    print("Pre-Service Phase Example")
    print("Translation and Expert Vetting")
    print("=" * 60)
    
    # Initialize system
    system = SermonTranslationSystem()
    
    # Example Malay sermon text
    sermon_id = "sermon_2024_001"
    malay_text = """
    Selamat pagi semua. Hari ini kita akan membincangkan tentang kasih sayang dan 
    belas kasihan. Dalam kehidupan kita, kasih sayang adalah perkara yang paling 
    penting. Kita harus sentiasa menunjukkan kasih sayang kepada keluarga dan 
    rakan-rakan kita.
    """
    
    print(f"\nSermon ID: {sermon_id}")
    print(f"Original Text (Malay):\n{malay_text}")
    
    # Execute Pre-Service workflow
    print("\n" + "-" * 60)
    print("Step 1: Translate sermon using MT model")
    print("-" * 60)
    
    result = system.pre_service_workflow(sermon_id, malay_text)
    
    print(f"\nTranslation Result:")
    print(f"  - Confidence: {result['confidence']:.2f}")
    print(f"  - Status: {result['status']}")
    print(f"\nTranslated Text (English):\n{result['translation']}")
    
    # Simulate expert vetting
    print("\n" + "-" * 60)
    print("Step 2: Expert vetting")
    print("-" * 60)
    
    print("\nPending translations:")
    pending = system.vetting.get_pending_vettion()
    for p in pending:
        print(f"  - {p['sermon_id']}: Confidence {p['confidence']:.2f}")
    
    # Expert provides corrections (example)
    expert_corrections = """
    Good morning everyone. Today we will discuss love and compassion. 
    In our lives, love is the most important thing. We must always show 
    love to our family and friends.
    """
    
    print("\nExpert reviewing translation...")
    print(f"Expert corrections provided: {len(expert_corrections)} characters")
    
    # Approve with corrections
    approval_score = 0.92
    approved = system.approve_translation(
        sermon_id=sermon_id,
        approval_score=approval_score,
        corrections=expert_corrections
    )
    
    if approved:
        print(f"\n✓ Translation APPROVED (score: {approval_score})")
    else:
        print(f"\n✗ Translation REJECTED (score: {approval_score})")
    
    # Get vetting statistics
    print("\n" + "-" * 60)
    print("Vetting Statistics")
    print("-" * 60)
    
    stats = system.vetting.get_statistics()
    print(f"\nTotal translations: {stats['total_translations']}")
    print(f"Approved: {stats['approved']}")
    print(f"Pending: {stats['pending']}")
    print(f"Average approval score: {stats['average_approval_score']:.2f}")
    
    # Retrieve approved translation
    approved_translation = system.vetting.get_approved_translation(sermon_id)
    if approved_translation:
        print(f"\n✓ Approved translation ready for Live-Service phase")
        print(f"  Approved at: {approved_translation['approved_at']}")
    
    # Cleanup
    system.shutdown()
    print("\n" + "=" * 60)
    print("Pre-Service phase example completed!")
    print("=" * 60)


if __name__ == "__main__":
    main()
