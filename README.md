# MediKiosk 🏥

### AI-Assisted Multimodal Patient Case-Taking System

MediKiosk is a smart pre-consultation patient case-taking system designed to reduce the time physicians spend collecting and organizing basic clinical history.

The system combines conversational AI, voice/touch interaction, OCR-based document digitization, adaptive questioning, red-flag detection, AYUSH-specific history collection, and structured physician-ready summaries.

> **Smart India Hackathon 2026 Prototype**

---

## 🎯 Problem Statement

Patient history collection in hospitals can be time-consuming and difficult to standardize, especially when:

- Patients are elderly or have low literacy.
- Previous medical documents are available only as physical copies.
- Patients speak different languages or have different accents.
- Physicians need to manually organize unstructured patient information.
- Important warning symptoms may be buried inside a long conversation.
- Traditional case-taking can increase the workload during busy OPD consultations.

---

## 💡 Proposed Solution

MediKiosk acts as a **pre-consultation assistant** that collects and organizes relevant patient information before the physician consultation.

Instead of replacing the physician, MediKiosk prepares a structured case summary that the physician can review, edit, and use during consultation.

---

## 🔄 Patient Journey

```text
Select Language
      ↓
Provide Consent
      ↓
Patient Registration
      ↓
Describe Chief Complaint
      ↓
Adaptive Case-Taking
      ↓
Upload / Scan Medical Documents
      ↓
OCR & Information Extraction
      ↓
Red-Flag Detection
      ↓
Structured Case Summary
      ↓
Physician Review
      ↓
Consultation

### Patient Workflow

1. Select preferred language
2. Provide informed consent
3. Enter basic patient information
4. Describe the chief complaint
5. Answer adaptive follow-up questions
6. Upload or scan previous medical documents
7. Extract information using OCR
8. Detect potential red-flag symptoms
9. Generate a structured clinical summary
10. Forward the case to the physician

---

## 👨‍⚕️ Physician Workflow

1. Physician login
2. View submitted patient cases
3. Check case priority
4. Review patient information
5. Review clinical history
6. Review AYUSH-specific information
7. Review uploaded medical documents
8. Review structured summary
9. Mark the case as reviewed
10. Proceed with clinical consultation

---

## 🧠 Key Features

### 🗣️ Conversational Case-Taking

Patients can describe their symptoms naturally while the system asks relevant follow-up questions.

### 🤖 AI-Assisted Adaptive Questioning

A local LLM analyzes the current case context and generates relevant follow-up questions.

The AI is used for **information collection**, not diagnosis or treatment.

### 🌐 Multilingual Interface

The prototype supports:

- English
- Hindi
- Bengali

The interface and clinical question flow adapt according to the selected language.

### 🎙️ Voice + Touch Interaction

The system is designed around both conversational interaction and touchscreen-based input, making it more accessible for elderly and low-literacy users.

### 📄 Medical Document OCR

Patients can upload previous medical documents.

The system uses OCR to extract text from documents and make previous medical information easier to review.

### 🚨 Red-Flag Detection

The system checks collected information for predefined warning symptoms and assigns an appropriate case priority.

Red-flag detection is intended to **prioritize physician attention**, not to provide a diagnosis.

### 🌿 AYUSH-Specific Case Taking

The system includes a dedicated AYUSH history collection workflow to capture information relevant to AYUSH consultations.

### 📋 Structured Physician Summary

Patient responses are transformed into an organized format so that the physician does not have to read through an entire conversational transcript.

### 🏥 Physician Dashboard

Physicians can:

- View submitted cases
- Check priority
- Review patient details
- Review clinical history
- Review AYUSH information
- View uploaded documents
- Read the generated summary
- Mark cases as reviewed

### 🔐 Consent-Oriented Workflow

The patient is presented with a consent screen before the case-taking process begins.

### 💾 Local Database

The prototype uses SQLite for persistent storage of patient and case information.

### 🔗 FHIR-Style Data Endpoint

The backend includes a FHIR-style patient data endpoint to demonstrate future interoperability with healthcare information systems.

                         ┌─────────────────────┐
                         │       Patient       │
                         └──────────┬──────────┘
                                    │
                              Voice / Touch
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   React Frontend    │
                         │                     │
                         │ • Patient Workflow  │
                         │ • Multilingual UI   │
                         │ • Doctor Dashboard  │
                         └──────────┬──────────┘
                                    │
                                REST API
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   FastAPI Backend   │
                         │                     │
                         │ • Case Management   │
                         │ • Summary Engine    │
                         │ • Red-Flag Logic    │
                         │ • OCR Processing    │
                         └──────┬───────┬──────┘
                                │       │
                    ┌───────────┘       └────────────┐
                    ▼                                ▼
             ┌──────────────┐                ┌──────────────┐
             │   SQLite DB  │                │ Local Ollama │
             │              │                │              │
             │ Patient Data │                │ Llama 3      │
             │ Case Data    │                │ Local LLM    │
             └──────────────┘                └──────────────┘
                    │
                    ▼
             ┌──────────────┐
             │ OCR Engine   │
             │ Tesseract    │
             └──────────────┘
                    │
                    ▼
             Extracted Medical
                Information
                    │
                    ▼
             ┌──────────────────┐
             │ Physician        │
             │ Dashboard        │
             └──────────────────┘

## 🛠️ Technology Stack

### Frontend

- React
- Vite
- JavaScript
- CSS

### Backend

- Python
- FastAPI
- SQLAlchemy
- SQLite

### AI

- Ollama
- Llama 3
- Local LLM inference

### Document Processing

- Tesseract OCR
- Python Imaging Library (Pillow)

---

## 🧩 Project Structure

```text
MediKiosk/
│
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   └── summary_engine.py
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Welcome.jsx
│   │   │   ├── RoleSelection.jsx
│   │   │   ├── LanguageSelection.jsx
│   │   │   ├── Consent.jsx
│   │   │   ├── PatientRegistration.jsx
│   │   │   ├── CaseTaking.jsx
│   │   │   ├── DocumentUpload.jsx
│   │   │   ├── PhysicianLogin.jsx
│   │   │   └── DoctorDashboard.jsx
│   │   │
│   │   ├── data/
│   │   │   ├── clinicalQuestions.js
│   │   │   ├── ayushQuestions.js
│   │   │   └── translations.js
│   │   │
│   │   ├── utils/
│   │   │   ├── complaintDetector.js
│   │   │   └── redFlagDetector.js
│   │   │
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md

## 🔐 Privacy & Security

MediKiosk follows a privacy-conscious architecture for the prototype.

### Local AI Processing

The AI component runs locally through Ollama, allowing patient information to remain on the demonstration system rather than being transmitted to an external AI API.

### Consent

The patient is presented with a consent screen before information collection begins.

### Data Minimization

The system focuses on collecting information required for the pre-consultation workflow.

### Future Compliance

Future versions can implement stronger security and interoperability mechanisms aligned with:

- Digital Personal Data Protection requirements
- ABDM ecosystem requirements
- Healthcare data interoperability standards
- Role-based access control
- Secure authentication
- Encryption at rest and in transit

---

## ⚠️ Clinical Safety

MediKiosk is an **assistive information-collection system**.

It is **not intended to:**

- Diagnose medical conditions
- Prescribe medication
- Replace a physician
- Make autonomous clinical decisions

AI-generated questions are used to assist with structured information collection.

Red-flag detection is intended to identify information that may require **priority physician attention**. It does not constitute a medical diagnosis.

The final case information is intended to be reviewed by a qualified physician.

---

## 🚀 Running the Project

### Prerequisites

Install:

- Python
- Node.js
- Git
- Ollama
- Tesseract OCR

---

### 1. Clone the Repository

```bash
git clone https://github.com/goswamiakash2006/MediKiosk.git
cd MediKiosk

### 2. Backend Setup

```bash
cd backend

### 3. Create a virtual environment:

