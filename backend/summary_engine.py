import ollama


def generate_clinical_summary(
    chief_complaint,
    answers,
    documents
):
    """
    Generate a physician-ready clinical summary using
    a locally running Ollama model.

    Falls back to deterministic extraction if Ollama
    is unavailable.
    """

    # Build patient information
    history_text = ""

    for item in answers:
        question = item["question"].strip()
        answer = item["answer"].strip()

        if answer:
            history_text += f"Question: {question}\n"
            history_text += f"Answer: {answer}\n\n"

    document_text = ""

    for document in documents:
        text = (document.extracted_text or "").strip()

        if text:
            document_text += (
                f"Document: {document.filename}\n"
                f"{text}\n\n"
            )

    prompt = f"""
You are a clinical documentation assistant.

Your task is to organize the patient's information into
a concise physician-ready clinical history.

IMPORTANT:
- Do NOT diagnose the patient.
- Do NOT recommend treatment.
- Do NOT invent information.
- Only use information provided below.
- Clearly separate reported symptoms from missing information.
- Preserve important details such as duration, severity,
  location, associated symptoms, medications, allergies,
  and previous records.

Patient's chief complaint:
{chief_complaint}

Patient interview:
{history_text}

Previous medical documents:
{document_text}

Generate the following sections:

1. Chief Complaint
2. Presenting Symptoms
3. Duration
4. Location
5. Severity
6. Associated Symptoms
7. Relevant Clinical History
8. Previous Medical Records
9. Important Information for Physician

Keep the summary concise and medically structured.
"""

    try:
        response = ollama.chat(
            model="llama3",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        ai_summary = response["message"]["content"]

        return {
            "text": ai_summary,
            "sections": {
                "ai_generated": True,
                "chief_complaint": chief_complaint,
                "clinical_history": [
                    {
                        "question": item["question"],
                        "answer": item["answer"]
                    }
                    for item in answers
                    if item["answer"].strip()
                ],
                "previous_records": [
                    {
                        "filename": document.filename,
                        "text": document.extracted_text
                    }
                    for document in documents
                    if document.extracted_text
                ]
            }
        }

    except Exception as error:
        print("Ollama unavailable:", error)

        return fallback_summary(
            chief_complaint,
            answers,
            documents
        )


def fallback_summary(
    chief_complaint,
    answers,
    documents
):
    """
    Deterministic fallback used when the local AI model
    cannot be reached.
    """

    sections = {
        "chief_complaint": chief_complaint.strip(),
        "symptoms": [],
        "duration": [],
        "location": [],
        "severity": [],
        "associated_symptoms": [],
        "clinical_history": [],
        "previous_records": []
    }

    for item in answers:
        question = item["question"].strip()
        answer = item["answer"].strip()

        if not answer:
            continue

        question_lower = question.lower()

        sections["clinical_history"].append({
            "question": question,
            "answer": answer
        })

        if any(word in question_lower for word in [
            "how long",
            "duration",
            "when did"
        ]):
            sections["duration"].append(answer)

        if any(word in question_lower for word in [
            "where",
            "location",
            "which part"
        ]):
            sections["location"].append(answer)

        if any(word in question_lower for word in [
            "severity",
            "scale",
            "how severe",
            "how bad"
        ]):
            sections["severity"].append(answer)

        if any(word in question_lower for word in [
            "associated",
            "other symptoms",
            "any other",
            "also"
        ]):
            sections["associated_symptoms"].append(answer)

        sections["symptoms"].append({
            "question": question,
            "answer": answer
        })

    for document in documents:
        text = (document.extracted_text or "").strip()

        if text:
            sections["previous_records"].append({
                "filename": document.filename,
                "text": text
            })

    summary_parts = [
        f"Chief complaint: {chief_complaint.strip()}."
    ]

    if sections["duration"]:
        summary_parts.append(
            "Duration: " +
            "; ".join(sections["duration"]) +
            "."
        )

    if sections["location"]:
        summary_parts.append(
            "Location: " +
            "; ".join(sections["location"]) +
            "."
        )

    if sections["severity"]:
        summary_parts.append(
            "Severity: " +
            "; ".join(sections["severity"]) +
            "."
        )

    if sections["associated_symptoms"]:
        summary_parts.append(
            "Associated symptoms: " +
            "; ".join(
                sections["associated_symptoms"]
            ) +
            "."
        )

    return {
        "text": " ".join(summary_parts),
        "sections": sections
    }