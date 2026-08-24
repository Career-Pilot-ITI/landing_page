# 🚀 Career Pilot Platform — Official Website & Documentation Hub

<div align="center">

[![Spring Boot 3](https://img.shields.io/badge/Backend-Spring%20Boot%203.4.1-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Android](https://img.shields.io/badge/Mobile-Android%20Compose-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://developer.android.com/jetpack/compose)
[![pgvector](https://img.shields.io/badge/Vector%20Store-pgvector%20PostgreSQL%2016-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://github.com/pgvector/pgvector)
[![Paymob](https://img.shields.io/badge/Payments-Paymob%20Gateway-0099FF?style=for-the-badge)](https://paymob.com/)
[![Google MediaPipe](https://img.shields.io/badge/Vision%20AI-MediaPipe%20Tasks-00C853?style=for-the-badge&logo=google&logoColor=white)](https://developers.google.com/mediapipe)

**The AI-Powered Adaptive Interview Coach, Body Language Perception, and ATS Career Readiness Platform**

*Information Technology Institute (ITI) · 9-Month Professional Program · Intake 46*

</div>

---

## 🏛️ Ecosystem Overview & Project Directory Map

The Career Pilot graduation platform is organized into synchronized core projects located under `d:/iti/`:

```
d:/iti/
├── CareerPilot/                         # 📱 Native Android Mobile Client (Kotlin, Compose, MediaPipe, Hilt)
│   ├── app/                             # Top-level Navigation 3 root & Firebase setup
│   ├── feature/                         # 15 isolated MVI feature modules (Interviews, ATS, Challenges, Quiz)
│   └── core/                            # 12 infrastructure modules (Vision ML, Whisper, Access, DesignSystem)
│
├── CareerPilot Backend/                 # ☁️ Authoritative Cloud Backend (Spring Boot 3, Java 21)
│   └── career-pilot-backend/
│       ├── src/main/java/.../controller # REST APIs (Auth, OTP, Profile, Interviews, ATS, Payment)
│       ├── src/main/java/.../service    # AI Agents (InterviewAgent, CoverLetterAgent, X-Y-Z Optimizer)
│       ├── src/main/java/.../security   # Stateless JWT, PII Redaction Aspect, Redis Bucket4j Rate Limiter
│       └── src/main/java/.../entity     # PostgreSQL Entities, Coin Ledger, pgvector 768-dim Embeddings
│
├── Career Pilot Docs/                   # 📄 Official Technical Documentation & Specifications
│   ├── Career_Pilot_Graduation_Project_Documentation.docx
│   ├── Career_Pilot_Graduation_Project_Documentation.pdf
│   └── srs_full_text.txt                # 5,900+ lines Software Requirements Specification (SRS)
│
└── CareerPilot_Website_v2_AppPalette/   # 🌐 Official Product Website & Interactive Documentation Portal
    └── CareerPilot_Website_v2_Theme/
        ├── index.html                   # High-level company & value proposition landing page
        ├── product.html                 # 10 connected product pillars & interactive playground
        ├── pricing.html                 # Tier economics (Free, Plus, Max) & ROI calculator
        ├── about.html                   # ITI Intake 46 engineering team & tech stack
        ├── docs.html                    # 8-chapter Interactive SRS Documentation (`Ctrl+K` search)
        ├── emulator.html                # Live Android / iOS mobile experience emulator
        ├── js/                          # App logic, config, search index, and theme controller
        └── server.js                    # Node.js static asset and MP4 video streaming server
```

---

## ⚙️ How Career Pilot & Its Backend Work

### 1. 🎯 Multimodal Edge Perception & Privacy Boundary
- **On-Device Computer Vision**: Analyzed 100% locally via Google MediaPipe (`FaceLandmarker` & `PoseLandmarker`) at 30 FPS. Evaluates Gaze Deviation, Torso Slouching, Hand Pacifying Fidgets, and Facial Dynamism without streaming raw camera frames to the cloud.
- **On-Device Speech Recognition**: Audio transcribed via Sherpa-ONNX / Whisper inference (`:core:whisper`), computing live words-per-minute (WPM) and hesitation patterns.

### 2. 🧠 Authoritative Cloud Gateway & AI Agent Pipeline (Spring Boot 3.4.1)
- **RAG Question Grounding**: Uses PostgreSQL 16 + `pgvector` with HNSW cosine distance indexing (768-dim) to retrieve grounded interview questions tailored to the candidate's track and verified CV context.
- **STAR Answer Evaluation**: Evaluates answers across Situation/Task (25%), Action (35%), Result (25%), and Delivery (15%) using Spring AI prompt orchestration (Gemini Flash / OpenAI).
- **Asynchronous CV AI Optimization**: Worker queue (`CvOptimizationJobExecutor`) rewrites resume bullets according to the Google X-Y-Z formula (*"Accomplished [X] as measured by [Y], by doing [Z]"*).
- **Autonomous Cover Letter Agent**: Researches target companies via live web search and synthesizes accomplishments into structured cover letters.
- **PII Redaction Aspect**: `@RedactPii` automatically masks sensitive candidate data (emails, phones, IDs) prior to external LLM processing.
- **Bucket4j Redis Rate Limiting**: Token-bucket rate limiting safeguards high-frequency AI endpoints.

### 3. 💳 Monetization, Virtual Coins & Paymob Integration
- **Hybrid Economy**: Monthly subscription tiers (`FREE`, `PLUS`, `MAX`) combined with consumable virtual coins for AI compute operations.
- **Paymob Payment Gateway**: Supports Credit/Debit cards and Mobile Wallets. Includes HMAC webhook signature verification and sandbox confirmation fallback (`POST /api/v1/payments/confirm/{merchantOrderId}`).
- **Double-Entry Ledger**: Immutably recorded in `coin_ledger_entries` and `payment_transactions` with automated monthly renewals (`SubscriptionRenewalSweepJob`).
- **Centralized Gating**: Enforced in Android via `:core:access` (`CheckFeatureAccessUseCase`, `DeductCoinsUseCase`).

---

## 🏃 Running the Projects Locally

### 1. Run the Web Documentation & Presentation Site
From this folder (`CareerPilot_Website_v2_Theme`):
```bash
# Option A: Using Node.js (with MP4 streaming support)
node server.js

# Option B: Using Python
python -m http.server 8080
```
Open `http://localhost:3000` (Node) or `http://localhost:8080` (Python).

### 2. Run the Spring Boot Backend (`d:/iti/CareerPilot Backend`)
```bash
# 1. Launch PostgreSQL with pgvector and Redis in Docker
docker run -d --name careerpilot-pg -p 5432:5432 -e POSTGRES_PASSWORD=postgres pgvector/pgvector:pg16
docker run -d --name careerpilot-redis -p 6379:6379 redis:7-alpine

# 2. Build and run Spring Boot service
cd "d:/iti/CareerPilot Backend/career-pilot-backend"
./mvnw clean spring-boot:run -Dspring-boot.run.profiles=local
```
Swagger UI available at: `http://localhost:8080/swagger-ui.html`

### 3. Build and Run the Android Mobile App (`d:/iti/CareerPilot`)
Open `d:/iti/CareerPilot` in **Android Studio Ladybug/Meerkat** (JDK 17/21, SDK 37), configure `local.properties` with the backend URL, and run `./gradlew assembleDebug` or install via ADB:
```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

---

## 🎨 Brand Palette
- **Navy**: `#1B2340`, **Navy Dark**: `#0E1428`, **Navy Light**: `#2D3B6B`
- **Amber**: `#FF7A45`, **Amber Light**: `#FF9E72`
- **Teal**: `#2DD4BF`, **Teal Light**: `#99F6E4`
- **Green**: `#22C55E`, **Yellow**: `#F59E0B`, **Coral**: `#EF4444`
- **Off White**: `#F7F8FC`, **Gray 100**: `#F1F3F9`, **Gray 200**: `#E4E8F0`, **Gray 400**: `#9AA3B8`

