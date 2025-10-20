# Sermon Translation System

A comprehensive three-phase system for translating Malay sermons to English with real-time subtitle display and continuous model improvement.

## Overview

This system enables seamless translation and delivery of Malay language sermons with English subtitles through three integrated phases:

### Phase 1: Pre-Service
- **Machine Translation**: Translate Malay sermon text to English using state-of-the-art MT models
- **Expert Vetting**: Human experts review and approve translations with optional corrections
- **Quality Assurance**: Only approved translations proceed to live service

### Phase 2: Live-Service
- **Speech Alignment**: Intelligent real-time detection of spoken parts using audio features
- **Subtitle Display**: Display approved English subtitles synchronized with live speech
- **Real-time Processing**: Low-latency alignment for smooth subtitle presentation

### Phase 3: Post-Service
- **Performance Analytics**: Analyze accuracy metrics, timing precision, and alignment quality
- **Model Refinement**: Identify improvement areas and prepare data for model fine-tuning
- **Continuous Improvement**: Use expert corrections to enhance future translation quality

## Features

✅ **Machine Translation** - Helsinki-NLP/opus-mt-ms-en model for Malay→English translation  
✅ **Expert Vetting System** - Human-in-the-loop approval workflow with corrections  
✅ **Real-time Alignment** - Intelligent speech detection and subtitle synchronization  
✅ **Comprehensive Analytics** - Track accuracy, timing, and performance metrics  
✅ **Model Refinement** - Continuous improvement through expert feedback  
✅ **Database Logging** - SQLite storage for translations, alignments, and metrics  
✅ **Configurable** - YAML-based configuration for all system parameters  

## Installation

### Prerequisites
- Python 3.8 or higher
- pip package manager

### Setup

1. Clone the repository:
```bash
git clone https://github.com/RidwanAfolabi/sermon-translation-system-fyp.git
cd sermon-translation-system-fyp
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. The system will automatically create necessary directories and database on first run.

## Quick Start

### Run Complete Workflow

Execute all three phases with a single example:

```bash
python examples/complete_workflow.py
```

### Individual Phase Examples

**Pre-Service** - Translation and vetting:
```bash
python examples/pre_service_example.py
```

**Live-Service** - Real-time alignment and subtitles:
```bash
python examples/live_service_example.py
```

**Post-Service** - Analytics and refinement:
```bash
python examples/post_service_example.py
```

## Usage

### Basic Usage

```python
from src import SermonTranslationSystem

# Initialize the system
system = SermonTranslationSystem()

# Pre-Service: Translate and approve
result = system.pre_service_workflow(
    sermon_id="sermon_001",
    malay_text="Selamat pagi semua..."
)

system.approve_translation(
    sermon_id="sermon_001",
    approval_score=0.95,
    corrections="Good morning everyone..."
)

# Live-Service: Setup and process
system.live_service_setup("sermon_001")

subtitle = system.process_live_audio(
    sermon_id="sermon_001",
    audio_timestamp=5.0,
    audio_features={'timestamp': 5.0, 'energy': 0.7}
)

# Post-Service: Analyze and refine
report = system.post_service_analysis("sermon_001")
refinement = system.check_refinement_needs()

# Cleanup
system.shutdown()
```

## Architecture

```
sermon-translation-system-fyp/
├── src/
│   ├── common/          # Shared utilities
│   │   ├── config.py    # Configuration management
│   │   └── database.py  # Database models and management
│   ├── pre_service/     # Pre-Service phase
│   │   ├── translator.py    # MT translation engine
│   │   └── vetting.py       # Expert vetting system
│   ├── live_service/    # Live-Service phase
│   │   ├── alignment.py     # Speech alignment
│   │   └── subtitle.py      # Subtitle display
│   ├── post_service/    # Post-Service phase
│   │   ├── analytics.py     # Performance analytics
│   │   └── refinement.py    # Model refinement
│   └── system.py        # Main orchestrator
├── config/
│   └── config.yaml      # System configuration
├── examples/            # Usage examples
├── data/               # Data storage (auto-created)
│   ├── translations/   # Translation data
│   ├── logs/          # System logs
│   └── audio/         # Audio files
└── tests/             # Test suite
```

## Configuration

Edit `config/config.yaml` to customize system behavior:

```yaml
pre_service:
  translation:
    model_name: "Helsinki-NLP/opus-mt-ms-en"
    batch_size: 8
  vetting:
    min_approval_score: 0.8

live_service:
  alignment:
    window_size: 5.0
    confidence_threshold: 0.7
  subtitle:
    max_chars_per_line: 42
    max_lines: 2

post_service:
  refinement:
    min_data_points: 100
    retrain_threshold: 0.1
```

## API Reference

### SermonTranslationSystem

Main system orchestrator.

#### Pre-Service Methods
- `pre_service_workflow(sermon_id, malay_text)` - Execute translation workflow
- `approve_translation(sermon_id, approval_score, corrections)` - Approve translation

#### Live-Service Methods
- `live_service_setup(sermon_id)` - Setup for live processing
- `process_live_audio(sermon_id, audio_timestamp, audio_features)` - Process audio frame

#### Post-Service Methods
- `post_service_analysis(sermon_id)` - Generate performance report
- `check_refinement_needs()` - Check if model refinement is needed

## Database Schema

### Tables

- **translations** - Stores sermon translations with approval status
- **alignment_segments** - Records speech alignment segments and timing
- **performance_logs** - Logs performance metrics for analysis

## Performance Metrics

The system tracks:
- **Translation Confidence** - MT model confidence scores
- **Approval Scores** - Expert review ratings
- **Correction Rates** - Frequency of expert corrections
- **Alignment Confidence** - Speech detection confidence
- **Timing Precision** - Subtitle synchronization accuracy

## Development

### Running Tests

```bash
# Run all tests (when test suite is created)
python -m pytest tests/

# Run specific test file
python -m pytest tests/test_translator.py
```

### Adding New Features

1. Create modules in appropriate phase directory
2. Update `system.py` to integrate new features
3. Add configuration options to `config.yaml`
4. Create example scripts in `examples/`
5. Document in README

## Troubleshooting

**Issue**: Model loading fails  
**Solution**: Ensure you have internet connection for first-time model download. Models are cached locally after initial download.

**Issue**: Database errors  
**Solution**: Delete `sermon_system.db` to reset database. System will recreate it automatically.

**Issue**: Low translation quality  
**Solution**: Adjust `min_approval_score` in config or provide more training data for model refinement.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is part of a Final Year Project (FYP) for academic purposes.

## Acknowledgments

- Helsinki-NLP for the opus-mt translation models
- HuggingFace Transformers library
- The research community for speech processing and NMT advancements
