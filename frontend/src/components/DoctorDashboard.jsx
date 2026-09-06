import { useEffect, useState } from "react";

function DoctorDashboard() {
  const [cases, setCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [summary, setSummary] = useState(null);

  const [loadingCases, setLoadingCases] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [error, setError] = useState("");

  // -----------------------------
  // LOAD ALL CASES
  // -----------------------------
  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/cases"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Could not load cases."
          );
        }

        setCases(data.cases || []);

        if (data.cases && data.cases.length > 0) {
          setSelectedCaseId(data.cases[0].case_id);
        }
      } catch (err) {
        console.error("Could not load cases:", err);
        setError("Could not load recent cases.");
      } finally {
        setLoadingCases(false);
      }
    };

    fetchCases();
  }, []);

  // -----------------------------
  // LOAD SELECTED CASE
  // -----------------------------
  useEffect(() => {
    if (!selectedCaseId) {
      setSummary(null);
      return;
    }

    const fetchSummary = async () => {
      setLoadingSummary(true);
      setError("");

      try {
        const response = await fetch(
          `http://127.0.0.1:8000/cases/${selectedCaseId}/summary`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail ||
              data.error ||
              "Could not load case."
          );
        }

        setSummary(data);
      } catch (err) {
        console.error(err);
        setSummary(null);
        setError("Could not load clinical summary.");
      } finally {
        setLoadingSummary(false);
      }
    };

    fetchSummary();
  }, [selectedCaseId]);

  // -----------------------------
  // MARK CASE AS REVIEWED
  // -----------------------------
  const markAsReviewed = async () => {
    if (!selectedCaseId || !summary) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/cases/${selectedCaseId}/review`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to mark case as reviewed."
        );
      }

      setSummary((previous) => ({
        ...previous,
        reviewed: true,
        reviewed_at: data.reviewed_at,
        reviewed_by: data.reviewed_by,
      }));

      setCases((previousCases) =>
        previousCases.map((item) =>
          item.case_id === selectedCaseId
            ? {
                ...item,
                reviewed: true,
              }
            : item
        )
      );
    } catch (err) {
      console.error(err);
      alert("Could not mark case as reviewed.");
    }
  };

  // -----------------------------
  // LOADING
  // -----------------------------
  if (loadingCases) {
    return (
      <div className="app dashboard-page">
        <div className="dashboard-loading">
          <div className="loading-icon">🩺</div>
          <h2>Loading Physician Dashboard</h2>
          <p>Preparing recent patient cases...</p>
        </div>
      </div>
    );
  }

  // -----------------------------
  // ERROR
  // -----------------------------
  if (error && cases.length === 0) {
    return (
      <div className="app dashboard-page">
        <div className="dashboard-empty">
          <div className="empty-icon">⚠️</div>
          <h2>Unable to Load Cases</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // -----------------------------
  // NO CASES
  // -----------------------------
  if (cases.length === 0) {
    return (
      <div className="app dashboard-page">
        <header className="dashboard-header">
          <div className="dashboard-brand">
            <div className="dashboard-brand-icon">🩺</div>

            <div>
              <h1>MediKiosk</h1>
              <p>Physician Clinical Dashboard</p>
            </div>
          </div>
        </header>

        <div className="dashboard-empty">
          <div className="empty-icon">📋</div>
          <h2>No Clinical Cases</h2>
          <p>
            Patient consultation records will appear here
            after a consultation is completed.
          </p>
        </div>
      </div>
    );
  }

  const isUrgent = summary?.priority === "URGENT";

  return (
    <div className="app dashboard-page">

      {/* =========================================
          HEADER
      ========================================= */}
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <div className="dashboard-brand-icon">
            🩺
          </div>

          <div>
            <h1>MediKiosk</h1>
            <p>Physician Clinical Dashboard</p>
          </div>
        </div>

        <div className="dashboard-status">
          <span className="status-dot"></span>
          Clinical System Active
        </div>
      </header>

      {/* =========================================
          DASHBOARD BODY
      ========================================= */}
      <div className="dashboard-layout">

        {/* =======================================
            LEFT: CASE LIST
        ======================================= */}
        <aside className="cases-panel">

          <div className="panel-heading">
            <div>
              <span className="section-label">
                CONSULTATIONS
              </span>

              <h2>Recent Cases</h2>
            </div>

            <span className="case-count">
              {cases.length}
            </span>
          </div>

          <div className="cases-list">
            {cases.map((item) => {
              const active =
                selectedCaseId === item.case_id;

              return (
                <button
                  key={item.case_id}
                  className={
                    active
                      ? "case-list-item active"
                      : "case-list-item"
                  }
                  onClick={() => {
                    setSelectedCaseId(item.case_id);
                    setSummary(null);
                    setError("");
                  }}
                >
                  <div className="case-list-top">
                    <span className="case-patient-id">
                      Patient #{item.patient_id}
                    </span>

                    <span
                      className={
                        item.reviewed
                          ? "case-review reviewed"
                          : "case-review pending"
                      }
                    >
                      {item.reviewed
                        ? "Reviewed"
                        : "Pending"}
                    </span>
                  </div>

                  <strong className="case-patient-name">
                    {item.patient_name || "Unknown Patient"}
                  </strong>

                  <span className="case-complaint">
                    {item.chief_complaint ||
                      "No complaint recorded"}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* =======================================
            RIGHT: CASE DETAILS
        ======================================= */}
        <main className="case-details-panel">

          {loadingSummary && (
            <div className="dashboard-loading">
              <div className="loading-icon">🩺</div>
              <h2>Loading Case</h2>
              <p>
                Preparing the patient's clinical summary...
              </p>
            </div>
          )}

          {error && !loadingSummary && (
            <div className="dashboard-error">
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {summary && !loadingSummary && (
            <>

              {/* =================================
                  CASE HEADER
              ================================= */}
              <section className="case-detail-header">

                <div>
                  <span className="section-label">
                    CASE #{selectedCaseId}
                  </span>

                  <h2>
                    {summary.patient?.name ||
                      "Patient Consultation"}
                  </h2>

                  <p>
                    Patient ID:{" "}
                    {summary.patient?.id}
                  </p>
                </div>

                <div
                  className={
                    isUrgent
                      ? "priority-badge urgent"
                      : "priority-badge routine"
                  }
                >
                  <span>
                    {isUrgent ? "🚨" : "🟢"}
                  </span>

                  <div>
                    <small>PRIORITY</small>
                    <strong>
                      {isUrgent
                        ? "URGENT"
                        : "ROUTINE"}
                    </strong>
                  </div>
                </div>
              </section>

              {/* =================================
                  URGENT ALERT
              ================================= */}
              {isUrgent &&
                summary.red_flags?.length > 0 && (
                  <section className="urgent-alert">
                    <div className="urgent-alert-icon">
                      🚨
                    </div>

                    <div>
                      <h3>Priority Clinical Alerts</h3>

                      {summary.red_flags.map(
                        (flag, index) => (
                          <p key={index}>{flag}</p>
                        )
                      )}

                      <small>
                        Requires appropriate clinical
                        attention.
                      </small>
                    </div>
                  </section>
                )}

              {/* =================================
                  PATIENT INFORMATION
              ================================= */}
              <section className="dashboard-card">

                <div className="card-heading">
                  <span className="card-icon">👤</span>

                  <div>
                    <span className="section-label">
                      PATIENT
                    </span>
                    <h3>Patient Information</h3>
                  </div>
                </div>

                <div className="patient-info-grid">

                  <div>
                    <span>Name</span>
                    <strong>
                      {summary.patient?.name ||
                        "Not provided"}
                    </strong>
                  </div>

                  <div>
                    <span>Age</span>
                    <strong>
                      {summary.patient?.age ??
                        "Not provided"}
                    </strong>
                  </div>

                  <div>
                    <span>Gender</span>
                    <strong>
                      {summary.patient?.gender ||
                        "Not provided"}
                    </strong>
                  </div>

                  <div>
                    <span>Phone</span>
                    <strong>
                      {summary.patient?.phone ||
                        "Not provided"}
                    </strong>
                  </div>

                </div>
              </section>

              {/* =================================
                  CHIEF COMPLAINT
              ================================= */}
              <section className="dashboard-card complaint-card">

                <div className="card-heading">
                  <span className="card-icon">🩺</span>

                  <div>
                    <span className="section-label">
                      PRESENTING PROBLEM
                    </span>
                    <h3>Chief Complaint</h3>
                  </div>
                </div>

                <p className="complaint-text">
                  {summary.chief_complaint ||
                    "No complaint recorded."}
                </p>
              </section>

              {/* =================================
                  PHYSICIAN SUMMARY
              ================================= */}
              <section className="dashboard-card summary-highlight">

                <div className="card-heading">
                  <span className="card-icon">📋</span>

                  <div>
                    <span className="section-label">
                      AI-ASSISTED
                    </span>
                    <h3>Physician Summary</h3>
                  </div>
                </div>

                <p>
                  {summary.physician_summary ||
                    "No physician summary available."}
                </p>

                <div className="ai-disclaimer">
                  <span>ℹ️</span>
                  <span>
                    Generated from patient-provided
                    information. Physician review is
                    required before clinical use.
                  </span>
                </div>
              </section>

              {/* =================================
                  CLINICAL HISTORY
              ================================= */}
              <section className="dashboard-card">

                <div className="card-heading">
                  <span className="card-icon">📝</span>

                  <div>
                    <span className="section-label">
                      CONSULTATION
                    </span>
                    <h3>Clinical History</h3>
                  </div>
                </div>

                {summary.clinical_history?.length >
                0 ? (
                  <div className="history-list">
                    {summary.clinical_history.map(
                      (item, index) => (
                        <div
                          className="history-item"
                          key={index}
                        >
                          <span className="history-number">
                            {index + 1}
                          </span>

                          <div>
                            <strong>
                              {item.question}
                            </strong>

                            <p>
                              {item.answer ||
                                "No answer provided."}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="muted-text">
                    No clinical history recorded.
                  </p>
                )}
              </section>

{/* =================================
    AYUSH CONSULTATION
================================= */}
{summary.ayush_history?.length > 0 && (
  <section className="dashboard-card ayush-dashboard-card">

    <div className="card-heading">
      <span className="card-icon">🌿</span>

      <div>
        <span className="section-label">
          AYUSH HISTORY
        </span>

        <h3>AYUSH Consultation</h3>
      </div>
    </div>

    <div className="history-list">
      {summary.ayush_history.map((item, index) => (
        <div
          className="history-item"
          key={index}
        >
          <span className="history-number">
            {index + 1}
          </span>

          <div>
            <strong>
              {item.question}
            </strong>

            <p>
              {item.answer ||
                "No answer provided."}
            </p>
          </div>
        </div>
      ))}
    </div>

  </section>
)}

              {/* =================================
                  PREVIOUS MEDICAL INFORMATION
              ================================= */}
              

              {/* =================================
                  DOCUMENTS
              ================================= */}
              <section className="dashboard-card">

                <div className="card-heading">
                  <span className="card-icon">📄</span>

                  <div>
                    <span className="section-label">
                      DOCUMENTS
                    </span>
                    <h3>
                      Previous Medical Documents
                    </h3>
                  </div>
                </div>

                {summary.documents?.length > 0 ? (
                  <div className="document-list">

                    {summary.documents.map((doc) => (
                      <details
                        className="doctor-document"
                        key={doc.id}
                      >
                        <summary>
                          <span>
                            📄 {doc.filename}
                          </span>

                          <small>
                            View extracted text
                          </small>
                        </summary>

                        <div className="document-text">
                          <pre>
                            {doc.extracted_text ||
                              "No text extracted."}
                          </pre>
                        </div>
                      </details>
                    ))}

                  </div>
                ) : (
                  <div className="empty-document">
                    <span>📂</span>
                    <p>
                      No previous medical documents
                      were uploaded.
                    </p>
                  </div>
                )}
              </section>

              {/* =================================
                  DOCTOR REVIEW
              ================================= */}
              <section className="dashboard-card review-card">

                <div className="card-heading">
                  <span className="card-icon">👨‍⚕️</span>

                  <div>
                    <span className="section-label">
                      CLINICAL VERIFICATION
                    </span>
                    <h3>Doctor Review</h3>
                  </div>
                </div>

                <p className="review-description">
                  The information above is generated
                  from patient-provided information and
                  uploaded documents. It should be
                  reviewed by the healthcare practitioner
                  before clinical use.
                </p>

                <div
                  className={
                    summary.reviewed
                      ? "review-status-box reviewed"
                      : "review-status-box pending"
                  }
                >
                  <div>
                    <span>Review Status</span>

                    <strong>
                      {summary.reviewed
                        ? "✅ Reviewed"
                        : "🕐 Pending Review"}
                    </strong>
                  </div>

                  {summary.reviewed && (
                    <div>
                      <span>Reviewed By</span>

                      <strong>
                        {summary.reviewed_by ||
                          "Physician"}
                      </strong>
                    </div>
                  )}
                </div>

                {!summary.reviewed && (
                  <button
                    className="review-button"
                    onClick={markAsReviewed}
                  >
                    ✓ Mark Case as Reviewed
                  </button>
                )}

                {summary.reviewed && (
                  <div className="review-complete">
                    ✓ This case has been reviewed by the
                    physician.
                  </div>
                )}

              </section>

            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default DoctorDashboard;