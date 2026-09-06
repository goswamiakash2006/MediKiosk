import React from "react";
import API_BASE_URL from "../api";

function PatientRegistration({ language, onRegistered }) {
  const [patient, setPatient] = React.useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
  });

  const [loading, setLoading] = React.useState(false);

  const updatePatient = (event) => {
    setPatient({
      ...patient,
      [event.target.name]: event.target.value,
    });
  };

  const registerPatient = async () => {
    if (
      !patient.name.trim() ||
      !patient.age ||
      !patient.gender ||
      !patient.phone.trim()
    ) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/patients`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: patient.name.trim(),
            age: Number(patient.age),
            gender: patient.gender,
            phone: patient.phone.trim(),
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        onRegistered(data.patient);
      } else {
        alert(data.detail || "Registration failed.");
      }
    } catch (error) {
      console.error(error);
      alert("Could not connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="registration-card">

        <div className="brand-icon">
          👤
        </div>

        <h1>Patient Registration</h1>

        <p className="subtitle">
          Please enter your basic information to begin your consultation.
        </p>

        <div className="registration-form">

          <div className="form-field">
            <label htmlFor="name">
              Full Name
            </label>

            <input
              id="name"
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={patient.name}
              onChange={updatePatient}
            />
          </div>

          <div className="form-row">

            <div className="form-field">
              <label htmlFor="age">
                Age
              </label>

              <input
                id="age"
                type="number"
                name="age"
                placeholder="Age"
                min="0"
                max="120"
                value={patient.age}
                onChange={updatePatient}
              />
            </div>

            <div className="form-field">
              <label htmlFor="gender">
                Gender
              </label>

              <select
                id="gender"
                name="gender"
                value={patient.gender}
                onChange={updatePatient}
              >
                <option value="">
                  Select gender
                </option>

                <option value="Male">
                  Male
                </option>

                <option value="Female">
                  Female
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </div>

          </div>

          <div className="form-field">
            <label htmlFor="phone">
              Phone Number
            </label>

            <input
              id="phone"
              type="tel"
              name="phone"
              placeholder="Enter phone number"
              value={patient.phone}
              onChange={updatePatient}
            />
          </div>

          <div className="registration-note">
            🔒 Your information will be used for your consultation.
          </div>

          <button
            className="registration-button"
            onClick={registerPatient}
            disabled={loading}
          >
            {loading
              ? "Registering..."
              : "Continue to Consultation →"}
          </button>

        </div>

        <p className="language-label">
          Selected language:{" "}
          <strong>{language.toUpperCase()}</strong>
        </p>

      </div>
    </div>
  );
}

export default PatientRegistration;