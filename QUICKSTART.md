# Quick Start Guide

## Getting Started with the Sermon Translation System

This guide will help you get the system up and running quickly.

### Prerequisites

- Python 3.8 or higher
- pip package manager
- (Optional) CUDA-capable GPU for faster translation

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/RidwanAfolabi/sermon-translation-system-fyp.git
cd sermon-translation-system-fyp
```

2. **Install dependencies**

For basic functionality (without ML model):
```bash
pip install sqlalchemy pyyaml numpy pandas
```

For full system with translation capability:
```bash
pip install -r requirements.txt
```

Note: First-time use will download the translation model (~300MB), which is cached locally.

### Quick Test

Run the integration test to verify installation:
```bash
python tests/test_integration.py
```

Expected output:
```
============================================================
Basic Integration Test
============================================================

1. Testing configuration...
✓ Configuration loaded

2. Testing database...
✓ Database initialized
...
✅ All integration tests passed!
```

### Your First Sermon Translation

#### Option 1: Run the Complete Demo
```bash
python examples/complete_workflow.py
```

This demonstrates all three phases in sequence with sample data.

#### Option 2: Step-by-Step

**Step 1: Pre-Service (Translation & Vetting)**
```bash
python examples/pre_service_example.py
```

This will:
- Translate a Malay sermon to English
- Submit for expert vetting
- Approve the translation
- Store in database

**Step 2: Live-Service (Real-Time Subtitles)**
```bash
python examples/live_service_example.py
```

This will:
- Load the approved translation
- Simulate live audio processing
- Display synchronized subtitles
- Log alignment data

**Step 3: Post-Service (Analytics)**
```bash
python examples/post_service_example.py
```

This will:
- Generate performance report
- Analyze accuracy and timing
- Check refinement needs
- Provide recommendations

### Using the System in Your Code

#### Basic Usage
```python
from src import SermonTranslationSystem

# Initialize system
system = SermonTranslationSystem()

# Pre-Service: Translate
result = system.pre_service_workflow(
    sermon_id="my_sermon_001",
    malay_text="Selamat pagi kepada semua yang hadir."
)
print(f"Translation: {result['translation']}")

# Approve translation
system.approve_translation(
    sermon_id="my_sermon_001",
    approval_score=0.95,
    corrections="Good morning to all who are present."
)

# Live-Service: Setup
setup = system.live_service_setup("my_sermon_001")
print(f"Ready with {setup['segments_loaded']} segments")

# Process audio (in a loop during live service)
subtitle = system.process_live_audio(
    sermon_id="my_sermon_001",
    audio_timestamp=5.0,
    audio_features={'timestamp': 5.0, 'energy': 0.7}
)
if subtitle:
    print(f"Display: {subtitle['lines']}")

# Post-Service: Generate report
report = system.post_service_analysis("my_sermon_001")
print(f"Approval score: {report['accuracy_metrics']['approval_score']}")

# Cleanup
system.shutdown()
```

#### Working with Individual Modules

**Translation Engine**
```python
from src.pre_service.translator import TranslationEngine

translator = TranslationEngine()
result = translator.translate("Selamat pagi")
print(result['translation'])  # "Good morning"
```

**Vetting System**
```python
from src.common import Database
from src.pre_service.vetting import VettingSystem

db = Database('sqlite:///my_sermons.db')
vetting = VettingSystem(db)

# Submit for review
vetting.submit_for_vetting(
    sermon_id="test",
    source_text="Original",
    translated_text="Translation",
    translation_confidence=0.85
)

# Get pending reviews
pending = vetting.get_pending_vettion()
print(f"{len(pending)} translations pending review")
```

**Speech Alignment**
```python
from src.live_service.alignment import SpeechAligner

aligner = SpeechAligner(confidence_threshold=0.7)
aligner.load_sermon_segments("sermon_id", "Approved English text.")

# Process audio frame
audio_features = {
    'timestamp': 2.5,
    'energy': 0.8,
    'spectral_features': {}
}
aligned = aligner.align_segment(2.5, audio_features)
if aligned:
    print(f"Segment: {aligned['text']}")
```

### Configuration

Edit `config/config.yaml` to customize behavior:

```yaml
pre_service:
  translation:
    model_name: "Helsinki-NLP/opus-mt-ms-en"
    batch_size: 8
  vetting:
    min_approval_score: 0.8

live_service:
  alignment:
    confidence_threshold: 0.7
  subtitle:
    max_chars_per_line: 42

post_service:
  refinement:
    min_data_points: 100
```

### Data Storage

The system creates these directories automatically:
- `data/translations/` - Translation data and fine-tuning datasets
- `data/logs/` - System logs
- `data/audio/` - Audio files (optional)
- `sermon_system.db` - SQLite database (auto-created)

### Troubleshooting

**"No module named 'transformers'"**
```bash
pip install transformers torch
```

**"Could not find config.yaml"**
Make sure you're running from the project root directory, or specify config path:
```python
system = SermonTranslationSystem(config_path='path/to/config.yaml')
```

**Database errors**
Delete the database file to reset:
```bash
rm sermon_system.db
```

**Model loading is slow**
This is normal for first run. The model is downloaded and cached. Subsequent runs will be faster.

### Next Steps

1. **Read the full documentation**: See [README.md](README.md)
2. **Explore architecture**: See [ARCHITECTURE.md](ARCHITECTURE.md)
3. **Review implementation**: See [IMPLEMENTATION.md](IMPLEMENTATION.md)
4. **Try examples**: Run scripts in `examples/` directory
5. **Customize**: Modify `config/config.yaml` for your needs
6. **Integrate**: Use the system in your own application

### Support

For issues or questions:
1. Check the documentation files
2. Review example scripts
3. Run tests to verify installation
4. Check error messages and logs in `data/logs/`

### Development

To contribute or extend the system:

1. **Add a new phase module**: Create in appropriate `src/` subdirectory
2. **Add metrics**: Extend `analytics.py` with new metric types
3. **Add features**: Update configuration and module code
4. **Add tests**: Create tests in `tests/` directory
5. **Update docs**: Keep documentation in sync with changes

### Example: Adding Your Own Metric

```python
# In src/post_service/analytics.py

def calculate_custom_metric(self, sermon_id: str) -> Dict:
    """Calculate your custom metric."""
    session = self.db.get_session()
    try:
        # Your calculation logic here
        metric_value = 0.95
        
        # Log it
        self.log_metric(
            sermon_id=sermon_id,
            phase='post',
            metric_type='my_custom_metric',
            metric_value=metric_value
        )
        
        return {'custom_metric': metric_value}
    finally:
        session.close()
```

Happy translating! 🎙️ → 📝 → 📺
