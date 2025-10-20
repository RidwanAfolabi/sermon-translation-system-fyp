# System Flow Diagrams

## Three-Phase Workflow

### Phase 1: Pre-Service (Translation & Vetting)
```
┌─────────────────────────────────────────────────────────────────┐
│                      PRE-SERVICE PHASE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Input: Malay Sermon Text                                   │
│      └── "Selamat pagi semua..."                               │
│                                                                 │
│  2. Machine Translation (Helsinki-NLP Model)                   │
│      └── TranslationEngine.translate()                         │
│      └── Output: English Translation + Confidence              │
│           "Good morning everyone..." (0.85 confidence)         │
│                                                                 │
│  3. Submit for Expert Vetting                                  │
│      └── VettingSystem.submit_for_vetting()                    │
│      └── Store in Database (pending approval)                  │
│                                                                 │
│  4. Expert Review                                              │
│      └── Human expert reviews translation                      │
│      └── Provides approval score (0.0 - 1.0)                   │
│      └── Optional: Provides corrected translation              │
│                                                                 │
│  5. Approval Decision                                          │
│      └── VettingSystem.approve_translation()                   │
│      └── If score >= threshold: APPROVED ✓                     │
│      └── If score < threshold: REJECTED ✗                      │
│                                                                 │
│  6. Output: Approved Translation                               │
│      └── Stored in database with approval metadata            │
│      └── Ready for Live-Service phase                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Phase 2: Live-Service (Real-Time Alignment & Display)
```
┌─────────────────────────────────────────────────────────────────┐
│                     LIVE-SERVICE PHASE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Setup                                                       │
│      └── Load approved translation                             │
│      └── Split into sentence segments                          │
│      └── Initialize alignment system                           │
│           Segments: ["Good morning everyone.", "Today we..."]  │
│                                                                 │
│  2. Live Audio Stream (continuous)                             │
│      └── Audio timestamp: 0.0s, 1.0s, 2.0s...                 │
│      └── Audio features: {energy, spectral_features}           │
│                                                                 │
│  3. Speech Detection                                           │
│      └── SpeechAligner.detect_speech()                         │
│      └── Analyze audio energy & features                       │
│      └── Output: is_speech + confidence                        │
│           {is_speech: true, confidence: 0.85}                  │
│                                                                 │
│  4. Segment Alignment                                          │
│      └── IF speech detected AND confidence > threshold:        │
│           └── Align next segment with current timestamp        │
│           └── Estimate segment duration                        │
│           └── Mark segment as aligned                          │
│                                                                 │
│  5. Subtitle Display                                           │
│      └── SubtitleDisplay.display_subtitle()                    │
│      └── Format text (max 42 chars/line, 2 lines)             │
│      └── Store display event in database                       │
│      └── Render subtitle on screen                             │
│           ┌──────────────────────────┐                         │
│           │  Good morning everyone.  │                         │
│           └──────────────────────────┘                         │
│                                                                 │
│  6. Timing & Logging                                           │
│      └── Log alignment confidence                              │
│      └── Track display timestamps                              │
│      └── Record segment timing accuracy                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Phase 3: Post-Service (Analytics & Refinement)
```
┌─────────────────────────────────────────────────────────────────┐
│                    POST-SERVICE PHASE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Data Collection                                            │
│      └── Translation records from Database                     │
│      └── Alignment segments with timing                        │
│      └── Performance logs from all phases                      │
│                                                                 │
│  2. Accuracy Analysis                                          │
│      └── AnalyticsEngine.calculate_translation_accuracy()     │
│      └── Metrics:                                              │
│           • Translation confidence scores                      │
│           • Expert approval scores                             │
│           • Correction rates                                   │
│           • Approval/rejection ratios                          │
│                                                                 │
│  3. Timing Analysis                                            │
│      └── AnalyticsEngine.calculate_timing_precision()         │
│      └── Metrics:                                              │
│           • Alignment confidence scores                        │
│           • Segment duration accuracy                          │
│           • Display synchronization timing                     │
│           • Average confidence per sermon                      │
│                                                                 │
│  4. Generate Report                                            │
│      └── AnalyticsEngine.generate_sermon_report()             │
│      └── Comprehensive per-sermon analysis                     │
│      └── Aggregate statistics across all sermons              │
│                                                                 │
│  5. Correction Pattern Analysis                               │
│      └── ModelRefinement.analyze_correction_patterns()        │
│      └── Identify common translation errors                    │
│      └── Calculate word-level difference rates                 │
│      └── Detect systematic issues                              │
│                                                                 │
│  6. Refinement Recommendation                                  │
│      └── ModelRefinement.should_retrain()                     │
│      └── Check data sufficiency (min 100 examples)            │
│      └── Calculate improvement potential                       │
│      └── Decision:                                             │
│           IF improvement_potential > 10%:                      │
│              → RECOMMEND RETRAINING                            │
│           ELSE:                                                │
│              → MODEL PERFORMING ADEQUATELY                     │
│                                                                 │
│  7. Fine-Tuning Dataset Preparation                            │
│      └── IF retraining recommended:                            │
│           └── Collect expert corrections                       │
│           └── Format as training pairs                         │
│           └── Export JSON dataset for fine-tuning             │
│           └── Log refinement cycle                             │
│                                                                 │
│  8. Output: Improvement Recommendations                        │
│      └── Report with actionable insights                       │
│      └── Dataset ready for model retraining                    │
│      └── Historical tracking of refinement cycles              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Complete End-to-End Flow
```
┌──────────────┐
│ Malay Sermon │
│     Text     │
└──────┬───────┘
       │
       v
┌──────────────────┐
│  PRE-SERVICE     │
│  ✓ Translate     │
│  ✓ Vet & Approve │
└──────┬───────────┘
       │
       v
┌──────────────────┐
│   Database       │
│  (Approved       │
│  Translation)    │
└──────┬───────────┘
       │
       v
┌──────────────────┐
│  LIVE-SERVICE    │
│  ✓ Align Speech  │
│  ✓ Display Subs  │
└──────┬───────────┘
       │
       v
┌──────────────────┐
│   Database       │
│  (Alignment +    │
│   Performance)   │
└──────┬───────────┘
       │
       v
┌──────────────────┐
│  POST-SERVICE    │
│  ✓ Analytics     │
│  ✓ Refinement    │
└──────┬───────────┘
       │
       v
┌──────────────────┐
│  Improvements    │
│  • Reports       │
│  • Training Data │
│  • Model Updates │
└──────────────────┘
```

## Database Schema

### Entity Relationship
```
┌─────────────────────┐
│    translations     │
├─────────────────────┤
│ id (PK)             │
│ sermon_id (UNIQUE)  │
│ source_text         │
│ translated_text     │
│ confidence          │
│ expert_approved     │
│ approval_score      │
│ expert_corrections  │
│ created_at          │
│ approved_at         │
└─────────┬───────────┘
          │
          │ 1:N
          │
          v
┌─────────────────────┐
│ alignment_segments  │
├─────────────────────┤
│ id (PK)             │
│ sermon_id (FK)      │
│ segment_index       │
│ start_time          │
│ end_time            │
│ source_text         │
│ subtitle_text       │
│ confidence          │
│ displayed           │
│ display_timestamp   │
└─────────┬───────────┘
          │
          │
          │
┌─────────────────────┐
│  performance_logs   │
├─────────────────────┤
│ id (PK)             │
│ sermon_id           │
│ phase               │
│ metric_type         │
│ metric_value        │
│ metric_metadata     │
│ timestamp           │
└─────────────────────┘
```

## Component Interaction

### Phase Interactions
```
┌─────────────────────────────────────────────────────┐
│          SermonTranslationSystem (Orchestrator)     │
└──────┬──────────────┬─────────────┬────────────────┘
       │              │             │
       v              v             v
┌─────────────┐ ┌─────────────┐ ┌──────────────┐
│ Pre-Service │ │Live-Service │ │Post-Service  │
├─────────────┤ ├─────────────┤ ├──────────────┤
│ • Translator│ │ • Aligner   │ │ • Analytics  │
│ • Vetting   │ │ • Subtitle  │ │ • Refinement │
└─────┬───────┘ └──────┬──────┘ └──────┬───────┘
      │                │                │
      └────────────────┼────────────────┘
                       │
                       v
              ┌────────────────┐
              │    Database    │
              │   (SQLAlchemy) │
              └────────────────┘
                       │
                       v
              ┌────────────────┐
              │  Config System │
              │   (YAML-based) │
              └────────────────┘
```

## Configuration Flow
```
config/config.yaml
        │
        v
┌───────────────────┐
│  Config Manager   │
└─────────┬─────────┘
          │
          ├──> Pre-Service Config
          │    • model_name
          │    • batch_size
          │    • min_approval_score
          │
          ├──> Live-Service Config
          │    • window_size
          │    • confidence_threshold
          │    • max_chars_per_line
          │
          └──> Post-Service Config
               • min_data_points
               • retrain_threshold
               • backup_models
```
