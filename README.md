# 🕌 AI-Driven Malay–English Sermon Translation System

> A hybrid AI–human translation system designed to accurately translate and display English subtitles for Malay Islamic sermons (khutbah), ensuring theological precision and near-real-time synchronization.

---

## 🌍 Overview

The **AI-Driven Sermon Translation System** bridges the linguistic gap for non-Malay-speaking audiences during live sermons at mosques.

Unlike traditional live translators or real-time MT systems, this solution **pre-translates and vets the sermon script with human experts before the sermon**, then intelligently synchronizes and displays the correct English subtitles as the speaker delivers the sermon in Malay.

### System Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PRE-SERVICE PHASE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  1. Upload sermon script (Malay)                                            │
│  2. AI translates segments → English                                        │
│  3. Human vetting & correction via Vetting Dashboard                        │
│  4. Approved segments stored in database                                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                           LIVE-SERVICE PHASE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  1. Whisper ASR listens to live speech (microphone)                         │
│  2. Spoken chunks aligned to pre-translated segments (rule-based matching)  │
│  3. Matched English subtitle displayed in real-time via WebSocket           │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                           POST-SERVICE PHASE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  1. Logs recorded: timestamps, scores, mismatches                           │
│  2. Feedback for model fine-tuning                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

📄 See detailed design: [`docs/system_design_overview.md`](docs/system_design_overview.md)

---

## 🧩 Key Features

| Feature | Description |
|---------|-------------|
| **Real-Time ASR** | Faster-Whisper Large-V3 optimized for Malay speech recognition |
| **Smart Alignment** | Rule-based fuzzy matching with dynamic threshold adjustment |
| **Human-in-the-Loop Vetting** | Scholars validate translations before live use |
| **Multi-Client WebSocket** | Multiple displays can connect simultaneously |
| **Domain Glossary** | Key religious terms (riba, Salah, Zakat) retain theological meaning |
| **Modular Architecture** | Clean separation between Backend, Frontend, and ML Pipeline |

---

## 🏗️ System Architecture

```
sermon-translation-system-fyp/
│
├── backend/                    # FastAPI backend
│   ├── api/
│   │   ├── routes/
│   │   │   ├── sermon_routes.py      # Sermon CRUD operations
│   │   │   ├── live_routes.py        # WebSocket live streaming
│   │   │   └── translation_routes.py # Translation inference
│   │   └── utils/
│   │       ├── broadcast_manager.py  # Multi-client broadcasting
│   │       └── db_utils.py           # Database utilities
│   ├── db/
│   │   ├── models.py                 # SQLAlchemy ORM models
│   │   ├── session.py                # Database session factory
│   │   ├── schema.sql                # Database schema
│   │   └── alembic/                  # Database migrations
│   └── main.py                       # FastAPI application entry
│
├── frontend/
│   ├── admin-dashboard/        # Upload sermons, manage segments
│   ├── subtitle-interface/     # Live subtitle display (WebSocket client)
│   └── vetting-dashboard/      # Human review/correction of translations
│
├── ml_pipeline/
│   ├── speech_recognition/
│   │   └── whisper_listener.py       # Faster-Whisper real-time ASR
│   ├── alignment_module/
│   │   ├── aligner.py                # Rule-based fuzzy alignment
│   │   ├── semantic_aligner.py       # Sentence-transformer alignment (optional)
│   │   └── segmenter.py              # Text segmentation utilities
│   ├── translation_model/
│   │   ├── inference.py              # Translation model inference
│   │   ├── preprocess.py             # Text preprocessing
│   │   └── glossary.json             # Domain-specific terminology
│   └── retraining/
│       └── fine_tune.py              # Model fine-tuning scripts
│
├── scripts/                    # Utility scripts
│   ├── db_backup.py
│   ├── import_csv.py
│   └── fix_alembic_marker.py
│
├── docs/                       # Documentation
│   ├── system_design_overview.md
│   ├── api_reference.md
│   ├── contribution_guidelines.md
│   └── db_schema.sql
│
├── requirements.txt            # Python dependencies
├── alembic.ini                 # Alembic configuration
└── README.md
```

---

## 🧱 Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Backend** | Python 3.11, FastAPI, Uvicorn, SQLAlchemy, Alembic |
| **Database** | PostgreSQL 18 |
| **Speech Recognition** | Faster-Whisper Large-V3 (CTranslate2) |
| **Alignment** | Rule-based fuzzy matching (difflib + synonym mapping) |
| **Translation** | Hugging Face Transformers (Helsinki-NLP/opus-mt-ms-en) |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **WebSocket** | Starlette WebSockets (via FastAPI) |

---

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- PostgreSQL 18+
- Microphone (for live ASR)
- CUDA-capable GPU (recommended for Whisper Large-V3)

### 1. Clone the Repository

```powershell
git clone https://github.com/<your-username>/sermon-translation-system-fyp.git
cd sermon-translation-system-fyp
```

### 2. Create and Activate Virtual Environment

```powershell
python -m venv venv311
.\venv311\Scripts\Activate.ps1
```

### 3. Install Dependencies

```powershell
# Install PyTorch with CUDA first
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124

# Then install remaining dependencies
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file or set environment variables:

```powershell
# Database connection
$env:DATABASE_URL = "postgresql+psycopg2://fyp_user:<YOUR_PASSWORD>@localhost:5432/sermon_translation_db"

# Whisper ASR settings
$env:WHISPER_MODEL = "large-v3"
$env:WHISPER_LANG = "ms"
$env:WHISPER_BLOCK_SECS = "6"
$env:WHISPER_DEVICE = "auto"

# Alignment settings
$env:ALIGNER_MODE = "rule"
$env:LIVE_INITIAL_THRESHOLD = "0.55"

# Windows-specific (avoid symlink errors)
$env:HF_HUB_DISABLE_SYMLINKS = "1"
```

### 5. Initialize the Database

```powershell
# Create database and user (run as postgres superuser)
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE USER fyp_user WITH ENCRYPTED PASSWORD '<YOUR_PASSWORD>';"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE sermon_translation_db OWNER fyp_user;"

# Run Alembic migrations
alembic -c .\alembic.ini upgrade head
```

### 6. Run the Backend API

```powershell
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

### 7. Launch Frontend Interfaces

Open separate terminals or browser tabs:

```powershell
# Admin Dashboard (port 5500)
cd frontend\admin-dashboard
python -m http.server 5500 --bind 127.0.0.1
# Open: http://127.0.0.1:5500/index.html

# Subtitle Interface (port 5501)
cd frontend\subtitle-interface
python -m http.server 5501 --bind 127.0.0.1
# Open: http://127.0.0.1:5501/index.html

# Vetting Dashboard (port 5502)
cd frontend\vetting-dashboard
python -m http.server 5502 --bind 127.0.0.1
# Open: http://127.0.0.1:5502/index.html
```

---

## 📡 API Endpoints

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/sermon/list` | List all sermons |
| GET | `/sermon/{id}` | Get sermon details |
| POST | `/sermon/upload` | Upload new sermon |
| GET | `/sermon/{id}/segments` | Get sermon segments |
| PATCH | `/sermon/segment/{id}` | Update segment (vetting) |
| POST | `/translate` | Translate text |

### WebSocket Endpoints

| Endpoint | Description |
|----------|-------------|
| `ws://127.0.0.1:8000/live/stream?sermon_id=X` | Live subtitle streaming |

📄 Full API reference: [`docs/api_reference.md`](docs/api_reference.md)

---

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | — | PostgreSQL connection string |
| `WHISPER_MODEL` | `large-v3` | Whisper model size |
| `WHISPER_LANG` | `ms` | ASR language (ms = Malay) |
| `WHISPER_BLOCK_SECS` | `6` | Audio chunk duration (seconds) |
| `WHISPER_DEVICE` | `auto` | Device (auto/cuda/cpu) |
| `WHISPER_COMPUTE` | — | Compute type (float16/int8) |
| `ALIGNER_MODE` | `rule` | Alignment mode (rule/semantic) |
| `LIVE_INITIAL_THRESHOLD` | `0.55` | Initial alignment score threshold |
| `LIVE_LOOKAHEAD_LIMIT` | `30` | Max segments to search ahead |
| `HF_HUB_DISABLE_SYMLINKS` | `0` | Set to `1` on Windows |

---

## 🧪 Testing

```powershell
# Run all tests
pytest backend/tests/

# Test specific module
pytest backend/tests/test_api.py -v

# Test ASR (requires microphone)
python ml_pipeline/speech_recognition/whisper_mic_test.py
```

---

## 📊 Database Schema

```sql
-- Sermons table
CREATE TABLE sermons (
    sermon_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date DATE,
    raw_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Segments table
CREATE TABLE segments (
    segment_id SERIAL PRIMARY KEY,
    sermon_id INTEGER REFERENCES sermons(sermon_id),
    segment_order INTEGER NOT NULL,
    malay_text TEXT NOT NULL,
    english_text TEXT,
    is_vetted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| `WinError 1314` symlinks | Set `$env:HF_HUB_DISABLE_SYMLINKS = "1"` |
| WebSocket 403 Forbidden | Ensure sermon_id exists in database |
| Password auth failed | Check `DATABASE_URL` credentials |
| CUDA out of memory | Use `WHISPER_MODEL=medium` or `WHISPER_DEVICE=cpu` |
| No audio input | Check microphone permissions and device index |

---

## 🗺️ Roadmap

- [x] Core backend API (FastAPI)
- [x] PostgreSQL database with Alembic migrations
- [x] Whisper ASR integration (Faster-Whisper Large-V3)
- [x] Rule-based alignment module
- [x] Multi-client WebSocket support
- [x] Admin dashboard (upload/manage sermons)
- [x] Vetting dashboard (human review)
- [x] Subtitle display interface
- [ ] Semantic alignment (sentence-transformers) — *in progress*
- [ ] Translation model fine-tuning pipeline
- [ ] Post-service logging and analytics
- [ ] Docker containerization
- [ ] Cloud deployment (AWS/GCP)

---

## 📅 Project Timeline (Gantt Chart)

> **Note:** This timeline reflects the original project plan. Actual implementation may vary based on testing feedback and iterative improvements.

| Phase | Sub-Activity | Est. Days | Status |
|-------|--------------|-----------|--------|
| **Planning** | Define project scope & objectives | 2 | ✅ Complete |
| **Planning** | Set up GitHub repo & task tracker | 2 | ✅ Complete |
| **Planning** | Finalize requirements & timeline | 3 | ✅ Complete |
| **Data Prep** | Collect sermon scripts (Malay) | 4 | ✅ Complete |
| **Data Prep** | Collect existing translations | 3 | ✅ Complete |
| **Data Prep** | Curate glossary of key Islamic terms | 4 | ✅ Complete |
| **Data Prep** | Annotate dataset with glossary terms | 5 | ✅ Complete |
| **Baseline** | Set up ASR engine (Faster-Whisper) | 5 | ✅ Complete |
| **Baseline** | Set up baseline translation system | 5 | ✅ Complete |
| **Baseline** | Develop subtitle rendering prototype | 4 | ✅ Complete |
| **Fine-Tune** | Prepare domain-specific training data | 5 | 🔄 In Progress |
| **Fine-Tune** | Fine-tune MT model | 7 | ⏳ Pending |
| **Fine-Tune** | Integrate glossary enforcement | 5 | ⏳ Pending |
| **Integration** | Integrate ASR with alignment module | 6 | ✅ Complete |
| **Integration** | Implement real-time subtitle streaming | 6 | ✅ Complete |
| **Integration** | Add logging & confidence flagging | 5 | 🔄 In Progress |
| **Deployment** | Optimize model for local/offline use | 6 | ⏳ Pending |
| **Deployment** | Test system on target hardware | 5 | ⏳ Pending |
| **Deployment** | Validate performance in offline mode | 4 | ⏳ Pending |
| **Testing** | Conduct accuracy & glossary compliance tests | 5 | 🔄 In Progress |
| **Testing** | Run mock sermon trials | 5 | 🔄 In Progress |
| **Testing** | Evaluate latency & reliability | 4 | 🔄 In Progress |
| **Testing** | Analyze logs & flagged segments | 4 | ⏳ Pending |
| **Final** | Prepare technical documentation | 5 | 🔄 In Progress |
| **Final** | Prepare user manual & training notes | 4 | ⏳ Pending |
| **Final** | Final presentation & submission | 3 | ⏳ Pending |

**Total Estimated Duration:** ~120 days (~17 weeks)

---

## 🧠 Future Enhancements

| Enhancement | Description |
|-------------|-------------|
| ☁️ **Cloud Deployment** | Deploy on AWS / GCP with managed AI services for scalability |
| 🌐 **Multi-Language Support** | Expand to Malay–Arabic–English translation pipeline |
| 🎛️ **Hardware Integration** | Real-time captioning hardware for mosque display systems |
| 📊 **Analytics Dashboard** | User-facing metrics for translation quality tracking |
| 🤖 **Semantic Alignment** | Sentence-transformer embeddings for improved accuracy |
| 🔄 **Continuous Learning** | Feedback loop from vetted corrections to retrain models |

---

## 👥 Contributing

### For Collaborators (Team Members)

You have direct write access — **no need to fork**.

```powershell
# 1. Clone (first time only)
git clone https://github.com/RidwanAfolabi/sermon-translation-system-fyp.git
cd sermon-translation-system-fyp

# 2. Get latest changes
git pull origin main

# 3. Create feature branch
git checkout -b feature/your-feature-name

# 4. Make changes, commit, push
# Stage only intended changes (recommended):
git add <specific-files>
# Or interactively stage changes:
git add -p
git commit -m "Descriptive commit message"
git push origin feature/your-feature-name

# 5. Open Pull Request on GitHub → merge after review
```

### For External Contributors

1. Fork the repository
2. Clone your fork
3. Create a feature branch
4. Submit a Pull Request

Please read [`docs/contribution_guidelines.md`](docs/contribution_guidelines.md) for coding standards.

---

## 📜 License

This project is not yet licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 📢 Contact

**Project Lead:** Ridwan Afolabi  
📧 Email: [ridwan.afolabi@student.aiu.edu.my](mailto:ridwan.afolabi@student.aiu.edu.my)  
🔗 GitHub: [github.com/RidwanAfolabi](https://github.com/RidwanAfolabi)

---

> *"Accurate translation isn't just about words - it's about preserving meaning, culture, and faith, and empowering people through understanding the message despite diverse circumstances."*
