from fastapi import FastAPI, Depends, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime

from openai import OpenAI

from summary_engine import generate_clinical_summary

import models
from database import engine, SessionLocal

import json

from PIL import Image
import io

import ollama

import os
import pytesseract

AI_PROVIDER = os.getenv("AI_PROVIDER", "ollama")
AI_MODEL = os.getenv("AI_MODEL", "llama3.2:3b")

openai_client = None

if AI_PROVIDER == "openai":
    openai_client = OpenAI(
        api_key=os.getenv("OPENAI_API_KEY")
    )

tesseract_path = os.getenv("TESSERACT_CMD")

if tesseract_path:
    pytesseract.pytesseract.tesseract_cmd = tesseract_path

models.Base.metadata.create_all(bind=engine)



app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","http://127.0.0.1:5173",],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PatientCreate(BaseModel):
    name: str
    age: int
    gender: str
    phone: str


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@app.get("/")
def home():
    return {"message": "MediKiosk backend is running!"}


@app.post("/patients")
def create_patient(
    patient: PatientCreate,
    db: Session = Depends(get_db)
):
    new_patient = models.Patient(
        name=patient.name,
        age=patient.age,
        gender=patient.gender,
        phone=patient.phone
    )

    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)

    return {
        "message": "Patient registered successfully",
        "patient": {
            "id": new_patient.id,
            "name": new_patient.name,
            "age": new_patient.age,
            "gender": new_patient.gender,
            "phone": new_patient.phone
        }
    }
@app.get("/patients")
def get_patients(db: Session = Depends(get_db)):
    patients = db.query(models.Patient).all()

    return {
        "patients": [
            {
                "id": patient.id,
                "name": patient.name,
                "age": patient.age,
                "gender": patient.gender,
                "phone": patient.phone
            }
            for patient in patients
        ]
    }
class CaseCreate(BaseModel):
    patient_id: int
    chief_complaint: str
    history_of_present_illness: str | None = None
    past_medical_history: str | None = None
    medications: str | None = None
    allergies: str | None = None
class CaseAnswerCreate(BaseModel):
    question_id: str
    question: str
    answer: str


class CaseWithAnswersCreate(BaseModel):
    patient_id: int
    chief_complaint: str
    answers: list[CaseAnswerCreate]


@app.post("/cases")
def create_case(
    case: CaseCreate,
    db: Session = Depends(get_db)
):
    new_case = models.Case(
        patient_id=case.patient_id,
        chief_complaint=case.chief_complaint,
        history_of_present_illness=case.history_of_present_illness,
        past_medical_history=case.past_medical_history,
        medications=case.medications,
        allergies=case.allergies
    )

    db.add(new_case)
    db.commit()
    db.refresh(new_case)

    return {
        "message": "Clinical case created successfully",
        "case": {
            "id": new_case.id,
            "patient_id": new_case.patient_id,
            "chief_complaint": new_case.chief_complaint,
            "history_of_present_illness": new_case.history_of_present_illness,
            "past_medical_history": new_case.past_medical_history,
            "medications": new_case.medications,
            "allergies": new_case.allergies,
            "created_at": new_case.created_at
        }
    }
@app.get("/patients/{patient_id}/cases")
def get_patient_cases(
    patient_id: int,
    db: Session = Depends(get_db)
):
    cases = (
        db.query(models.Case)
        .filter(models.Case.patient_id == patient_id)
        .all()
    )

    return {
        "patient_id": patient_id,
        "cases": [
            {
                "id": case.id,
                "chief_complaint": case.chief_complaint,
                "history_of_present_illness": case.history_of_present_illness,
                "past_medical_history": case.past_medical_history,
                "medications": case.medications,
                "allergies": case.allergies,
                "created_at": case.created_at
            }
            for case in cases
        ]
    }
@app.post("/cases/complete")
def create_complete_case(
    case_data: CaseWithAnswersCreate,
    db: Session = Depends(get_db)
):
    new_case = models.Case(
        patient_id=case_data.patient_id,
        chief_complaint=case_data.chief_complaint,
        history_of_present_illness="Structured clinical interview",
        past_medical_history="",
        medications="",
        allergies=""
    )

    db.add(new_case)
    db.commit()
    db.refresh(new_case)

    for answer in case_data.answers:
        new_answer = models.CaseAnswer(
            case_id=new_case.id,
            question_id=answer.question_id,
            question=answer.question,
            answer=answer.answer
        )

        db.add(new_answer)

    db.commit()

    return {
        "message": "Clinical case and answers saved successfully",
        "case_id": new_case.id
    }
@app.get("/cases/{case_id}/summary")
def get_case_summary(
    case_id: int,
    db: Session = Depends(get_db)
):
    # -----------------------------
    # FIND CASE
    # -----------------------------
    case = (
        db.query(models.Case)
        .filter(models.Case.id == case_id)
        .first()
    )

    if not case:
        raise HTTPException(
            status_code=404,
            detail="Case not found"
        )

    # -----------------------------
    # FIND PATIENT
    # -----------------------------
    patient = (
        db.query(models.Patient)
        .filter(
            models.Patient.id == case.patient_id
        )
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    # -----------------------------
    # GET ANSWERS
    # -----------------------------
    answers_db = (
        db.query(models.CaseAnswer)
        .filter(
            models.CaseAnswer.case_id == case_id
        )
        .all()
    )

    answers = [
    {
        "question_id": answer.question_id,
        "question": answer.question,
        "answer": answer.answer
    }
    for answer in answers_db
    ]

    # Separate regular clinical history from AYUSH history
    clinical_history = [
        answer
        for answer in answers
        if not answer["question_id"].startswith("ayush_")
    ]

    ayush_history = [
        answer
        for answer in answers
        if answer["question_id"].startswith("ayush_")
    ]

    # -----------------------------
    # GET DOCUMENTS
    # -----------------------------
    documents = (
        db.query(models.MedicalDocument)
        .filter(
            models.MedicalDocument.case_id == case_id
        )
        .all()
    )

    # -----------------------------
    # RED FLAGS
    # -----------------------------
    red_flags = []

    for answer in answers_db:
        text = answer.answer.lower()

        if (
            "difficulty breathing" in text
            or "shortness of breath" in text
            or "can't breathe" in text
            or "cannot breathe" in text
        ):
            red_flags.append(
                "Patient reports breathing difficulty."
            )

        if (
            "face drooping" in text
            or "slurred speech" in text
            or "one-sided weakness" in text
            or "one sided weakness" in text
        ):
            red_flags.append(
                "Possible stroke-related warning symptom reported."
            )

    red_flags = list(dict.fromkeys(red_flags))

    priority = (
        "URGENT"
        if red_flags
        else "ROUTINE"
    )

    # -----------------------------
    # GENERATE SMART SUMMARY
    # -----------------------------
    generated_summary = generate_clinical_summary(
        chief_complaint=case.chief_complaint,
        answers=answers,
        documents=documents
    )

    # -----------------------------
    # DOCUMENT RESPONSE
    # -----------------------------
    document_data = [
        {
            "id": document.id,
            "filename": document.filename,
            "extracted_text": document.extracted_text,
            "created_at": document.created_at
        }
        for document in documents
    ]

    # -----------------------------
    # RESPONSE
    # -----------------------------
    return {
        "case_id": case.id,

        "patient": {
            "id": patient.id,
            "name": patient.name,
            "age": patient.age,
            "gender": patient.gender,
            "phone": patient.phone
        },

        "priority": priority,

        "red_flags": red_flags,

        "chief_complaint": case.chief_complaint,

        "clinical_history": clinical_history,

        "ayush_history": ayush_history,

        "physician_summary":
            generated_summary["text"],

        "reviewed": case.reviewed,
        "reviewed_at": case.reviewed_at,
        "reviewed_by": case.reviewed_by,

        "summary_sections":
            generated_summary["sections"],

        "documents": document_data,

        "summary": {
            "chief_complaint":
                case.chief_complaint,

            "history": answers,

            "past_medical_history":
                case.past_medical_history or "",

            "medications":
                case.medications or "",

            "allergies":
                case.allergies or ""
        }

        
    }
@app.post("/cases/{case_id}/documents")
async def upload_document(
    case_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    case = (
        db.query(models.Case)
        .filter(models.Case.id == case_id)
        .first()
    )

    if not case:
        raise HTTPException(
            status_code=404,
            detail="Case not found"
        )

    try:
        contents = await file.read()

        image = Image.open(
            io.BytesIO(contents)
        )

        extracted_text = pytesseract.image_to_string(
            image
        )

        # Save OCR result in database
        document = models.MedicalDocument(
            case_id=case_id,
            filename=file.filename,
            extracted_text=extracted_text
        )

        db.add(document)
        db.commit()
        db.refresh(document)

        return {
            "message": "Document processed successfully",
            "document_id": document.id,
            "case_id": case_id,
            "filename": file.filename,
            "extracted_text": extracted_text
        }

    except Exception as error:
        print("========== OCR ERROR ==========")
        print(repr(error))
        print("================================")

        raise HTTPException(
            status_code=500,
            detail=f"OCR failed: {repr(error)}"
        )
@app.get("/cases/{case_id}/documents")
def get_case_documents(
    case_id: int,
    db: Session = Depends(get_db)
):
    documents = (
        db.query(models.MedicalDocument)
        .filter(
            models.MedicalDocument.case_id == case_id
        )
        .all()
    )

    return {
        "case_id": case_id,
        "documents": [
            {
                "id": document.id,
                "filename": document.filename,
                "extracted_text": document.extracted_text,
                "created_at": document.created_at
            }
            for document in documents
        ]
    }
@app.delete("/cases/{case_id}/session")
def delete_case_session(
    case_id: int,
    db: Session = Depends(get_db)
):
    case = db.query(models.Case).filter(
        models.Case.id == case_id
    ).first()

    if not case:
        raise HTTPException(
            status_code=404,
            detail="Case not found"
        )

    # Delete uploaded medical documents
    db.query(models.MedicalDocument).filter(
        models.MedicalDocument.case_id == case_id
    ).delete()

    # Delete case answers
    db.query(models.CaseAnswer).filter(
        models.CaseAnswer.case_id == case_id
    ).delete()

    # Delete the case itself
    db.delete(case)

    db.commit()

    return {
        "message": "Patient session deleted successfully",
        "case_id": case_id
    }
@app.get("/cases")
def get_all_cases(
    db: Session = Depends(get_db)
):
    cases = (
        db.query(models.Case)
        .order_by(models.Case.created_at.desc())
        .all()
    )

    result = []

    for case in cases:
        patient = (
            db.query(models.Patient)
            .filter(
                models.Patient.id == case.patient_id
            )
            .first()
        )

        result.append({
            "case_id": case.id,
            "patient_id": case.patient_id,
            "patient_name": (
                patient.name if patient else "Unknown"
            ),
            "age": (
                patient.age if patient else None
            ),
            "gender": (
                patient.gender if patient else None
            ),
            "chief_complaint": case.chief_complaint,
            "created_at": case.created_at,
            "reviewed": case.reviewed,
            "reviewed_at": case.reviewed_at
        })

    return {
        "cases": result
    }
@app.post("/cases/{case_id}/review")
def review_case(
    case_id: int,
    db: Session = Depends(get_db)
):
    # Find the case
    case = (
        db.query(models.Case)
        .filter(models.Case.id == case_id)
        .first()
    )

    if not case:
        raise HTTPException(
            status_code=404,
            detail="Case not found"
        )

    # Mark case as reviewed
    case.reviewed = True
    case.reviewed_at = datetime.utcnow()
    case.reviewed_by = "Physician"

    db.commit()
    db.refresh(case)

    return {
        "message": "Case marked as reviewed",
        "case_id": case.id,
        "reviewed": case.reviewed,
        "reviewed_at": case.reviewed_at,
        "reviewed_by": case.reviewed_by
    }
@app.get("/patients/{patient_id}/fhir")
def get_patient_fhir(
    patient_id: int,
    db: Session = Depends(get_db)
):
    patient = db.query(models.Patient).filter(
        models.Patient.id == patient_id
    ).first()

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    return {
        "resourceType": "Patient",
        "id": str(patient.id),
        "name": [
            {
                "text": patient.name
            }
        ],
        "gender": (
            patient.gender.lower()
            if patient.gender
            else None
        ),
        "telecom": [
            {
                "system": "phone",
                "value": patient.phone
            }
        ] if patient.phone else [],
        "extension": [
            {
                "url": "https://medikiosk.local/age",
                "valueInteger": patient.age
            }
        ]
    }
@app.post("/ai/next-question")
def get_next_question(data: dict):
    chief_complaint = data.get("chief_complaint", "")
    answers = data.get("answers", [])

    patient = data.get("patient", {})
    age = patient.get("age")
    gender = patient.get("gender")

    language = data.get("language", "en")

    conversation = ""

    for item in answers:
        conversation += (
            f"Question: {item['question']}\n"
            f"Patient answer: {item['answer']}\n\n"
        )

    prompt = f"""
You are a clinical history-taking assistant for a hospital kiosk.

Your job is ONLY to collect and structure patient history.

You must NOT:
- diagnose the patient
- recommend treatment
- prescribe medicine
- give medical advice

Chief complaint:
{chief_complaint}

Patient information:
Age: {age}
Gender: {gender}

Patient's selected language:
{language}

Previous conversation:
{conversation}

IMPORTANT PATIENT CONTEXT RULES:

- Use the patient's recorded age and gender when deciding whether a question is relevant.
- Do not ask questions that are clearly biologically irrelevant to the recorded patient.
- Do not make assumptions beyond the provided information.
- Only ask about reproductive or menstrual history when clinically relevant and appropriate for the recorded patient.

QUESTION RULES:

- Ask exactly ONE short follow-up question.
- Do not repeat information already provided.
- Prefer clinically relevant missing information.
- Use simple language suitable for ordinary patients.
- Ask questions that help collect medical history.
- Do not diagnose.
- Do not recommend treatment.
- Do not ask unnecessary questions.
- Stop when enough useful history has been collected.
- Ask no more than 8 questions in total.

LANGUAGE RULE:

Generate the question in the patient's selected language.

- en = English
- hi = Hindi
- bn = Bengali

OUTPUT FORMAT:

Return ONLY valid JSON.

If another question is needed, return an object containing:
done = false
question = one short patient-facing question
warning = false

If enough information has been collected, return:
done = true
question = empty string
warning = false

If the patient's latest information contains a potentially important warning symptom, return:
done = false
question = one short relevant follow-up question
warning = true

Rules:
- Return valid JSON only.
- No markdown.
- No explanation.
- No diagnosis.
- No treatment advice.
"""

    # Hard limit: maximum 8 questions
    if len(answers) >= 8:
        return {
            "done": True,
            "question": "",
            "warning": False
        }

    try:
        AI_MODEL = os.getenv("AI_MODEL", "llama3.2:3b")

        if AI_PROVIDER == "ollama":
            response = ollama.chat(
                model=AI_MODEL,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )

            raw_response = response["message"]["content"]

        elif AI_PROVIDER == "openai":
            response = openai_client.chat.completions.create(
                model=AI_MODEL,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.2
            )

            raw_response = response.choices[0].message.content

        else:
            raise HTTPException(
                status_code=500,
                detail=f"Unsupported AI provider: {AI_PROVIDER}"
            )
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]

        print("========== OLLAMA RESPONSE ==========")
        print(raw_response)
        print("======================================")

        import json
        import re

        try:
            # First try parsing the complete response.
            ai_result = json.loads(raw_response)

        except json.JSONDecodeError:

            # Ollama sometimes adds explanatory text around the JSON.
            # Extract the first JSON object from the response.
            match = re.search(
                r"\{.*\}",
                raw_response,
                re.DOTALL
            )

            if not match:
                print("Invalid AI JSON:")
                print(raw_response)

                raise HTTPException(
                    status_code=500,
                    detail="AI returned an invalid response format."
                )

            try:
                ai_result = json.loads(match.group(0))

            except json.JSONDecodeError:
                print("Invalid extracted AI JSON:")
                print(match.group(0))

                raise HTTPException(
                    status_code=500,
                    detail="AI returned malformed JSON."
                )

        return {
            "done": bool(
                ai_result.get("done", False)
            ),

            "question": ai_result.get(
                "question",
                ""
            ),

            "warning": bool(
                ai_result.get("warning", False)
            )
        }

    except HTTPException:
        raise

    except Exception as error:
        print("========== OLLAMA ERROR ==========")
        print(repr(error))
        print("===================================")

        raise HTTPException(
            status_code=500,
            detail=f"AI question generation failed: {repr(error)}"
        )