import { useState } from "react";

function PhysicianLogin({ onLogin, onBack }) {
  const [physicianId, setPhysicianId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (!physicianId.trim() || !password.trim()) {
      setError("Please enter Physician ID and password.");
      return;
    }

    // Prototype authentication
    if (
      physicianId === "doctor" &&
      password === "1234"
    ) {
      setError("");
      onLogin();
    } else {
      setError("Invalid Physician ID or password.");
    }
  };

  return (
    <div className="app">
      <h1>🩺 Physician Login</h1>

      <p>Sign in to access patient clinical records.</p>

      <input
        type="text"
        placeholder="Physician ID"
        value={physicianId}
        onChange={(event) =>
          setPhysicianId(event.target.value)
        }
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(event) =>
          setPassword(event.target.value)
        }
      />

      {error && (
        <p className="error">
          {error}
        </p>
      )}

      <button onClick={handleLogin}>
        Login
      </button>

      <button onClick={onBack}>
        Back
      </button>

      <p>
        <small>
          Prototype credentials: doctor / 1234
        </small>
      </p>
    </div>
  );
}

export default PhysicianLogin;