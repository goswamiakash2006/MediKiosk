import { useState, useRef } from "react";
import clinicalQuestions from "../data/clinicalQuestions";
import ayushQuestions from "../data/ayushQuestions";
import translations from "../data/translations";
import detectComplaint from "../utils/complaintDetector";
import detectRedFlags from "../utils/redFlagDetector";
import API_BASE_URL from "../api";

function CaseTaking({
  patientId,
  patientInfo,
  language,
  onComplete,
}) {
  const t = translations[language] || translations.en;

  const [stage, setStage] = useState("complaint");

  const [complaint, setComplaint] = useState("");

  const [questions, setQuestions] = useState([]);

  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [answers, setAnswers] = useState({});

  const [currentAnswer, setCurrentAnswer] = useState("");

  const [ayushAnswers, setAyushAnswers] = useState({});

  const [redFlags, setRedFlags] = useState([]);

  const [listening, setListening] = useState(false);

  const [aiLoading, setAiLoading] = useState(false);

  const recognitionRef = useRef(null);


  /* ============================= */
  /* VOICE INPUT                   */
  /* ============================= */

  const startVoiceInput = (targetSetter) => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    const recognition =
      new window.webkitSpeechRecognition();

    recognition.lang =
      language === "hi"
        ? "hi-IN"
        : language === "bn"
        ? "bn-IN"
        : "en-IN";

    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event) => {
      const text =
        event.results[0][0].transcript;

      targetSetter((previous) =>
        previous
          ? `${previous} ${text}`
          : text
      );
    };

    recognition.onerror = (event) => {
      console.error(
        "Speech recognition error:",
        event.error
      );

      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    recognition.start();
  };


  /* ============================= */
  /* START CASE                    */
  /* ============================= */

  const submitComplaint = async () => {
    if (!complaint.trim()) {
      alert(
        t.complaintRequired ||
        "Please describe your main problem."
      );

      return;
    }

    const flags = detectRedFlags(complaint);

    setRedFlags(flags);

    const firstQuestion = {
      id: "ai_1",

      question: {
        en: "Can you describe the problem in more detail?",
        hi: "क्या आप अपनी समस्या के बारे में थोड़ा और बता सकते हैं?",
        bn: "আপনি কি আপনার সমস্যাটি সম্পর্কে একটু আরও বিস্তারিত বলতে পারেন?"
      }
    };

    setQuestions([firstQuestion]);

    setCurrentQuestion(0);

    setCurrentAnswer("");

    setAnswers({});

    setStage("questions");
  };


  /* ============================= */
  /* SAVE CASE                     */
  /* ============================= */

  const saveCase = async (
  finalAnswers,
  finalAyushAnswers = {}
) => {
  try {
    setAiLoading(false);

    const structuredAnswers = questions.map(
      (question) => ({
        question_id: question.id,

        question:
          question.question[language] ||
          question.question.en,

        answer:
          finalAnswers[question.id] || "",
      })
    );

    const ayushStructuredAnswers =
      Object.entries(finalAyushAnswers).map(
        ([index, answer]) => ({
          question_id: `ayush_${index}`,

          question:
            ayushQuestions[language]?.[Number(index)] ||
            ayushQuestions.en[Number(index)],

          answer,
        })
      );

    const response = await fetch(
      `${API_BASE_URL}/cases/complete`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          patient_id: patientId,

          chief_complaint: complaint,

          answers: [
            ...structuredAnswers,
            ...ayushStructuredAnswers,
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);

      alert(
        data.detail ||
        "Could not save the clinical history."
      );

      return;
    }

    onComplete(data.case_id);

  } catch (error) {
    console.error(error);

    alert(
      "Could not connect to the backend."
    );

  } finally {
    setAiLoading(false);
  }
};


  /* ============================= */
  /* SUBMIT ANSWER                 */
  /* ============================= */

  const submitAnswer = async () => {
    const answer = currentAnswer.trim();

    if (!answer) {
      alert(
        t.answerRequired ||
        "Please enter an answer."
      );

      return;
    }

    const question =
      questions[currentQuestion];

    const updatedAnswers = {
      ...answers,

      [question.id]: answer,
    };

    setAnswers(updatedAnswers);

    setCurrentAnswer("");


    /* RED FLAG CHECK */

    const newFlags =
      detectRedFlags(answer);

    if (newFlags.length > 0) {
      setRedFlags((previous) => {
        const existingMessages =
          previous.map(
            (flag) =>
              flag.message || flag
          );

        const uniqueFlags =
          newFlags.filter(
            (flag) =>
              !existingMessages.includes(
                flag.message || flag
              )
          );

        return [
          ...previous,
          ...uniqueFlags,
        ];
      });
    }


    /* ASK AI */

    try {
      setAiLoading(true);

      const conversation =
        questions
          .slice(
            0,
            currentQuestion + 1
          )
          .map((q) => ({
            question_id: q.id,

            question:
              q.question[language] ||
              q.question.en,

            answer:
              updatedAnswers[q.id] || "",
          }));


      const response = await fetch(
        `${API_BASE_URL}/ai/next-question`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            chief_complaint:
              complaint,

            patient: {
              age:
                patientInfo?.age,

              gender:
                patientInfo?.gender,
            },

            language,

            answers:
              conversation,
          }),
        }
      );


      const data =
        await response.json();


      if (!response.ok) {
        console.error(data);

        alert(
          "AI could not generate the next question."
        );

        return;
      }


      /* AI WARNING */

      if (data.warning) {
        setRedFlags((previous) => {
          const message =
            "AI detected a potentially important warning symptom.";

          if (
            previous.some(
              (flag) =>
                (flag.message || flag) ===
                message
            )
          ) {
            return previous;
          }

          return [
            ...previous,
            { message },
          ];
        });
      }


      /* AI FINISHED */

      if (data.done) {
        setStage("ayushChoice");

        return;
      }


      /* ADD NEXT QUESTION */

      const nextQuestion = {
        id:
          `ai_${questions.length + 1}`,

        question: {
          en: data.question,
          hi: data.question,
          bn: data.question,
        },
      };


      setQuestions((previous) => [
        ...previous,
        nextQuestion,
      ]);

      setCurrentQuestion(
        (previous) =>
          previous + 1
      );

    } catch (error) {
      console.error(error);

      alert(
        "Could not connect to the AI service."
      );

    } finally {
      setAiLoading(false);
    }
  };


  /* ============================= */
  /* AYUSH CHOICE                  */
  /* ============================= */

  const chooseAyush = (choice) => {
    if (choice === "yes") {
      setStage("ayush");

      setCurrentQuestion(0);

      return;
    }

    saveCase(answers);
  };


  /* ============================= */
  /* AYUSH ANSWER                  */
  /* ============================= */

  const submitAyushAnswer = () => {
  const answer = currentAnswer.trim();

  if (!answer) {
    alert(
      t.answerRequired ||
      "Please enter an answer."
    );
    return;
  }

  const updatedAyushAnswers = {
    ...ayushAnswers,
    [currentQuestion]: answer,
  };

  setAyushAnswers(updatedAyushAnswers);
  setCurrentAnswer("");

  const ayushList =
    ayushQuestions[language] ||
    ayushQuestions.en;

  if (currentQuestion < ayushList.length - 1) {
    setCurrentQuestion(
      (previous) => previous + 1
    );
    return;
  }

  // Last AYUSH question
  saveCase(
    answers,
    updatedAyushAnswers
  );
};


  /* ============================= */
  /* AI LOADING SCREEN             */
  /* ============================= */

  if (aiLoading) {
    return (
      <div className="app loading-screen">

        <div className="ai-loading-card">

          <div className="ai-icon">
            🧠
          </div>

          <div className="loading-spinner"></div>

          <h1>
            Preparing your next question
          </h1>

          <p>
            MediKiosk is processing your response.
          </p>

          <small>
            Please wait...
          </small>

        </div>

      </div>
    );
  }


  /* ============================= */
  /* COMPLAINT SCREEN              */
  /* ============================= */

  if (stage === "complaint") {
    return (
      <div className="app">

        <div className="case-card">

          <div className="case-header">

            <div className="case-icon">
              🩺
            </div>

            <div>
              <h1>
                Tell Us About Your Problem
              </h1>

              <p>
                Start by describing what is troubling you.
              </p>
            </div>

          </div>


          <div className="patient-mini-card">

            <span>👤</span>

            <div>
              <strong>
                {patientInfo?.name ||
                  `Patient #${patientId}`}
              </strong>

              <small>
                {patientInfo?.age} years ·{" "}
                {patientInfo?.gender}
              </small>
            </div>

          </div>


          <label className="case-label">
            What is your main problem?
          </label>

          <div className="voice-input-wrapper">

            <textarea
              value={complaint}
              onChange={(event) =>
                setComplaint(
                  event.target.value
                )
              }
              placeholder="For example: I have been having chest pain since yesterday..."
            />

            <button
              className={
                listening
                  ? "voice-button listening"
                  : "voice-button"
              }
              onClick={() =>
                startVoiceInput(
                  setComplaint
                )
              }
            >
              {listening
                ? "🔴 Listening..."
                : "🎙️ Speak"}
            </button>

          </div>


          <div className="case-hint">
            💡 You can type your answer or use
            voice input.
          </div>


          {redFlags.length > 0 && (
            <div className="red-flag">

              <h2>
                ⚠️ Important Information
              </h2>

              {redFlags.map(
                (flag, index) => (
                  <p key={index}>
                    {flag.message || flag}
                  </p>
                )
              )}

            </div>
          )}


          <button
            className="primary-wide-button"
            onClick={submitComplaint}
          >
            Continue →
          </button>

        </div>

      </div>
    );
  }


  /* ============================= */
  /* QUESTIONS SCREEN              */
  /* ============================= */

  if (stage === "questions") {

    const question =
      questions[currentQuestion];

    if (!question) {
      return null;
    }

    const progress =
      Math.round(
        ((currentQuestion + 1) /
          8) *
          100
      );

    return (
      <div className="app">

        <div className="case-card">

          <div className="question-top">

            <div>

              <span className="section-label">
                CLINICAL HISTORY
              </span>

              <h1>
                Let's understand your symptoms
              </h1>

            </div>

            <span className="question-count">
              {currentQuestion + 1} / 8
            </span>

          </div>


          <div className="progress-track">
            <div
              className="progress-bar"
              style={{
                width: `${Math.min(
                  progress,
                  100
                )}%`,
              }}
            />
          </div>


          {redFlags.length > 0 && (
            <div className="red-flag compact">

              <strong>
                ⚠️ Important symptom detected
              </strong>

              <p>
                Your response may require
                additional attention from the physician.
              </p>

            </div>
          )}


          <div className="question-box">

            <span className="question-number">
              Question {currentQuestion + 1}
            </span>

            <h2>
              {question.question[language] ||
                question.question.en}
            </h2>

          </div>


          <label className="case-label">
            Your answer
          </label>

          <div className="voice-input-wrapper">

            <textarea
              value={currentAnswer}
              onChange={(event) =>
                setCurrentAnswer(
                  event.target.value
                )
              }
              placeholder="Type your answer here..."
              autoFocus
            />

            <button
              className={
                listening
                  ? "voice-button listening"
                  : "voice-button"
              }
              onClick={() =>
                startVoiceInput(
                  setCurrentAnswer
                )
              }
            >
              {listening
                ? "🔴 Listening..."
                : "🎙️ Speak"}
            </button>

          </div>


          <div className="question-actions">

            <button
              className="primary-wide-button"
              onClick={submitAnswer}
            >
              Continue →
            </button>

          </div>

        </div>

      </div>
    );
  }


  /* ============================= */
  /* AYUSH CHOICE                  */
  /* ============================= */

  if (stage === "ayushChoice") {
    return (
      <div className="app">

        <div className="case-card ayush-choice-card">

          <div className="case-icon">
            🌿
          </div>

          <h1>
            AYUSH Consultation
          </h1>

          <p className="subtitle">
            Would you like to provide additional
            information for an AYUSH consultation?
          </p>


          <div className="choice-grid">

            <button
              className="choice-button"
              onClick={() =>
                chooseAyush("yes")
              }
            >
              <span>🌿</span>

              <strong>
                Yes, continue
              </strong>

              <small>
                Provide additional AYUSH history
              </small>
            </button>


            <button
              className="choice-button"
              onClick={() =>
                chooseAyush("no")
              }
            >
              <span>➡️</span>

              <strong>
                No, continue to documents
              </strong>

              <small>
                Finish the clinical history
              </small>
            </button>

          </div>

        </div>

      </div>
    );
  }


  /* ============================= */
/* AYUSH QUESTIONS               */
/* ============================= */

if (stage === "ayush") {

  const ayushList =
    ayushQuestions[language] ||
    ayushQuestions.en;

  const question =
    ayushList[currentQuestion];

  if (!question) {
    return null;
  }

  const ayushTotal =
    ayushList.length;

  const progress =
    Math.round(
      ((currentQuestion + 1) /
        ayushTotal) *
        100
    );

  return (
    <div className="app">

      <div className="case-card">

        <div className="question-top">

          <div>

            <span className="section-label">
              AYUSH HISTORY
            </span>

            <h1>
              Additional Consultation Details
            </h1>

          </div>

          <span className="question-count">
            {currentQuestion + 1} / {ayushTotal}
          </span>

        </div>


        <div className="progress-track">

          <div
            className="progress-bar"
            style={{
              width: `${progress}%`,
            }}
          />

        </div>


        <div className="question-box ayush-question">

          <span className="question-number">
            AYUSH Question {currentQuestion + 1}
          </span>

          <h2>
            {question}
          </h2>

        </div>


        <label className="case-label">
          Your answer
        </label>


        <div className="voice-input-wrapper">

          <textarea
            value={currentAnswer}
            onChange={(event) =>
              setCurrentAnswer(
                event.target.value
              )
            }
            placeholder="Enter your answer..."
            autoFocus
          />

          <button
            className={
              listening
                ? "voice-button listening"
                : "voice-button"
            }
            onClick={() =>
              startVoiceInput(
                setCurrentAnswer
              )
            }
          >
            {listening
              ? "🔴 Listening..."
              : "🎙️ Speak"}
          </button>

        </div>


        <button
          className="primary-wide-button"
          onClick={submitAyushAnswer}
        >
          {currentQuestion === ayushTotal - 1
            ? "Finish Consultation ✓"
            : "Continue →"}
        </button>

      </div>

    </div>
  );
}


  return null;
}

export default CaseTaking;