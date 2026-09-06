function LanguageSelection({ onSelect }) {
  return (
    <div className="app">
      <div className="welcome-card language-card">

        <div className="brand-icon">
          🌐
        </div>

        <h1>Select Language</h1>

        <p className="subtitle">
          Choose the language you are most comfortable speaking.
        </p>

        <div className="language-container">

          <button onClick={() => onSelect("en")}>
            <span className="language-native">English</span>
            <small>English</small>
          </button>

          <button onClick={() => onSelect("hi")}>
            <span className="language-native">हिन्दी</span>
            <small>Hindi</small>
          </button>

          <button onClick={() => onSelect("bn")}>
            <span className="language-native">বাংলা</span>
            <small>Bengali</small>
          </button>

        </div>

        <p className="privacy-note">
          You can change this before starting your consultation.
        </p>

      </div>
    </div>
  );
}

export default LanguageSelection;