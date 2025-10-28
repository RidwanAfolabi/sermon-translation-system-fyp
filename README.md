# 🅍 AI-Driven Malay–English Sermon Translation System

> A hybrid AI–human translation system designed to accurately translate and display English subtitles for Malay Islamic sermons, ensuring theological precision and near-real-time synchronization.

---

## 🌍 Overview

The **AI-Driven Sermon Translation System** bridges the linguistic gap for non-Malay-speaking audiences during live sermons.
Unlike traditional live translators or real-time MT systems, this solution pre-translates and vets the sermon script with human experts **before the sermon**, then intelligently synchronizes and displays the correct English subtitles as the speaker delivers the sermon in Malay.

The system operates across **three main modules**:

1. **Pre-Service Translation & Vetting**
2. **Live-Service Synchronization & Subtitle Display**
3. **Post-Service Logging & Feedback Evaluation**

📄 See detailed design: [`docs/system_design_overview.md`](docs/system_design_overview.md)

---

## 🧩 Key Features

* **Domain-Fine-Tuned Translation Model**
  Custom glossary ensures key religious terms like *riba*, *Salah*, and *Zakat* retain their theological meaning.

* **Human-in-the-Loop Vetting**
  Scholars validate the translated segments before they’re stored for live use.

* **Smart Synchronization Engine**
  Detects where the speaker is in the Malay script and displays the corresponding English subtitle dynamically.

* **Live Logging Agent**
  Records timestamps, confidence scores, and mismatches for post-service evaluation and future fine-tuning.

* **Modular Architecture**
  Clean separation between Backend, Frontend, and ML Pipeline for maintainability and collaboration.

---

## ⚙️ System Architecture

The system is divided into the following major components:

```
sermon-translation-system/
│
├── backend/                # API, DB models, business logic
├── frontend/               # Vetting dashboard & subtitle UI
├── ml_pipeline/            # Translation, alignment & retraining modules
├── data/                   # Sermon datasets & logs
├── docker/                 # Dockerfiles and compose setup
└── docs/                   # Design & architecture documentation
```

See diagram: [`docs/Masjid_translator_sys_architecture.png`](docs/Masjid_translator_sys_architecture.png)

---

## 🧱 Tech Stack

| Layer               | Technologies                                 |
| :------------------ | :------------------------------------------- |
| Backend             | Python, FastAPI / Flask, SQLAlchemy, Alembic |
| Machine Translation | Hugging Face Transformers, MarianMT / mBART  |
| Speech Alignment    | Whisper / Vosk                               |
| Frontend            | HTML, CSS, JavaScript                        |
| Database            | MySQL or SQLite                              |
| Containerization    | Docker, Docker Compose                       |

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/sermon-translation-system.git
cd sermon-translation-system
```

### 2. Create and Activate a Virtual Environment

```bash
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Initialize the Database

```bash
cd backend/db
mysql -u root -p < schema.sql
```

### 5. Run the Backend API

```bash
cd ../
python main.py
```

### 6. Launch the Frontend (Vetting Dashboard or Subtitle Interface)

Open in browser:

```
frontend/vetting-dashboard/index.html
frontend/subtitle-interface/index.html
```

---

## 🧪 Testing

```bash
pytest backend/tests/
```

---

## 📊 Logs and Data Management

* **Translation and Vetting Data:** stored under `/data/vetted_segments/`
* **Live Session Logs:** saved in `/data/live_logs/`
* **Model Fine-Tuning Inputs:** managed via `/ml_pipeline/retraining/`

---

## 🧠 Future Enhancements

* Cloud deployment using **AWS / GCP AI services**
* Multi-language expansion (e.g., Malay–Arabic–English pipeline)
* Integration with **real-time captioning hardware**
* User-based analytics dashboard for translation quality tracking

---

## 👥 Contributing

We welcome collaboration!
Please read [`docs/contribution_guidelines.md`](docs/contribution_guidelines.md) before submitting pull requests.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature-name`)
3. Commit changes (`git commit -m "Added new feature"`)
4. Push and create a PR

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 📢 Contact

**Project Lead:** Ridwan Afolabi
📧 Email: *[[ridwan.afolabi@student.aiu.edu.my](mailto:ridwan.afolabi@student.aiu.edu.my)]*
🔗 GitHub: [github.com/RidwanAfolabi](https://github.com/RidwanAfolabi)

---

> “Accurate translation isn’t just about words — it’s about preserving meaning, culture, and faith, and empowering people through understanding the messsage despite diversity circumstances.”
