function RoleSelection({ onSelect }) {
  return (
    <div className="app">
      <div className="welcome-card">

        <div className="brand-icon">
          🩺
        </div>

        <h1>MediKiosk</h1>

        <p className="subtitle">
          Smart Patient History &amp; Consultation Assistant
        </p>

        <div className="role-container">

          <button
            className="role-button"
            onClick={() => onSelect("patient")}
          >
            <span className="role-icon">👤</span>

            <span>
              <strong>Patient</strong>
              <small>Start a health consultation</small>
            </span>
          </button>

          <button
            className="role-button"
            onClick={() => onSelect("physician")}
          >
            <span className="role-icon">🩺</span>

            <span>
              <strong>Physician</strong>
              <small>Review patient cases</small>
            </span>
          </button>

        </div>

        <p className="privacy-note">
          🔒 Your information is handled securely
        </p>

      </div>
    </div>
  );
}

export default RoleSelection;