/**
 * This document provides a comprehensive overview of the system design 
 * for the AI-Driven Sermon Translation System. 
 * It outlines the architecture, major components, and interaction flow 
 * across different operational phases.
 */

# System Design Overview

## 1. System Workflow Overview

The system operates across **three main phases** — **Pre-Service Translation and Vetting**, **Live-Service Synchronization and Subtitle Display**, and **Post-Service Logging and Evaluation**.  
Each phase corresponds to a distinct functional component within the overall system architecture.

---

### **1.1 Pre-Service Phase – Translation & Vetting Module**

1. The Malay sermon script is uploaded into the system.  
2. A **domain fine-tuned Machine Translation (MT) model** automatically generates an initial English translation.  
3. The text is then **segmented into aligned units** (paragraphs or sentences).  
4. A **human scholar or expert** reviews each translation segment to ensure theological correctness and contextual accuracy.  
5. The **vetted bilingual file (Malay–English pairs)** is stored in the database for live delivery synchronization.

---

### **1.2 Live-Service Phase – Intelligent Synchronization & Subtitle Module**

1. As the speaker delivers the sermon in Malay, the system employs **speech alignment and keyword matching algorithms** to detect the current segment being spoken.  
2. The corresponding **vetted English translation** is retrieved and displayed dynamically on the subtitle interface or projector screen.  
3. This creates the impression of **real-time translation**, while ensuring linguistic accuracy and theological consistency.

---

### **1.3 Post-Service Phase – Logging and Feedback Agent**

1. During live sessions, the system’s **logging agent** records:
   - Confidence scores  
   - Alignment accuracy  
   - Segment flags  
   - Timestamps  
2. These logs are reviewed by domain experts post-sermon to evaluate system performance and identify mismatches.  
3. Insights from these analyses are then used to **fine-tune the MT model** and improve future synchronization precision.

---

## 2. System Requirements

### **Hardware**
- Standard PC or dedicated server for processing  
- Microphone for live audio input  
- Display screen or projector for subtitles  

### **Software**
- Python-based backend for translation (BERT) and synchronization logic  
- Speech recognition framework (e.g., Whisper, Vosk, or DeepSpeech)  
- Database (MySQL or SQLite) for bilingual data and log storage  
- Web-based front-end for subtitle rendering and vetting interface  

---

## 3. Component Interaction Summary

| Module | Primary Function | Key Technologies |
|:--------|:-----------------|:----------------|
| Translation & Vetting | Pre-service translation, glossary enforcement, scholar review | Transformers, Flask/FastAPI, Pandas |
| Synchronization & Subtitle | Real-time alignment and subtitle display | Speech recognition, WebSocket, JavaScript |
| Logging & Feedback | Performance recording and model improvement | SQLAlchemy, Python logging, JSON |

---

## 4. Future Improvements

- Integration with **cloud-based speech alignment services** for more robust matching.  
- Expansion to **multi-language support** (e.g., Malay–Arabic–English).  
- Enhanced vetting UI with **version tracking and scholar comments**.

---

> **Note:** This document complements the architecture diagram (`docs/Masjid translator sys architecture.png`) and should be read alongside it to fully understand the data flow and component interactions.
