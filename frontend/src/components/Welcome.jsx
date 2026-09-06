function Welcome({ onStart }) {
  return (
    <div className="app">
      <h1>MediKiosk</h1>

      <p>
        Digital Clinical History & Patient Intake
      </p>

      <button onClick={onStart}>
        Start Patient Registration
      </button>
    </div>
  );
}

export default Welcome;