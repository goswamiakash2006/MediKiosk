from sqlalchemy import Boolean, Column, Integer, String, Text, DateTime, ForeignKey
from datetime import datetime

from database import Base


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)
    phone = Column(String, nullable=False)
class Case(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, nullable=False)

    chief_complaint = Column(String, nullable=False)
    history_of_present_illness = Column(String, nullable=True)
    past_medical_history = Column(String, nullable=True)
    medications = Column(String, nullable=True)
    allergies = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    reviewed = Column(Boolean, default=False)
    reviewed_at = Column(DateTime, nullable=True)
    reviewed_by = Column(String, nullable=True)
class CaseAnswer(Base):
    __tablename__ = "case_answers"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False)

    question_id = Column(String, nullable=False)
    question = Column(String, nullable=False)
    answer = Column(String, nullable=False)
class MedicalDocument(Base):
    __tablename__ = "medical_documents"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False)

    filename = Column(String, nullable=False)
    extracted_text = Column(Text, nullable=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )