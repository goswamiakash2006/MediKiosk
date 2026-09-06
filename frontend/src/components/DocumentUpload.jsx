import { useState } from "react";

function DocumentUpload({ caseId, onComplete }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [ocrText, setOcrText] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (!selectedFile) return;

    setFile(selectedFile);
    setUploaded(false);
    setOcrText("");
  };

  const uploadDocument = async () => {
    if (!file) {
      alert("Please select a document first.");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch(
        `http://127.0.0.1:8000/cases/${caseId}/documents`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.detail ||
          "Could not upload the document."
        );
        return;
      }

      setUploaded(true);

      if (data.ocr_text) {
        setOcrText(data.ocr_text);
      }

    } catch (error) {
      console.error(error);

      alert(
        "Could not connect to the backend."
      );
    } finally {
      setUploading(false);
    }
  };

  const finishDocuments = () => {
    onComplete();
  };

  return (
    <div className="app">

      <div className="document-card">

        {/* HEADER */}

        <div className="document-header">

          <div className="document-icon">
            📄
          </div>

          <div>
            <span className="section-label">
              MEDICAL DOCUMENTS
            </span>

            <h1>
              Add Previous Medical Records
            </h1>

            <p>
              Upload prescriptions, reports, or other
              medical documents for the physician.
            </p>
          </div>

        </div>


        {/* UPLOAD AREA */}

        {!uploaded && (
          <>
            <label
              htmlFor="document-upload"
              className="upload-area"
            >

              <div className="upload-symbol">
                ⬆️
              </div>

              <strong>
                {file
                  ? file.name
                  : "Choose a medical document"}
              </strong>

              <span>
                {file
                  ? `${(
                      file.size / 1024
                    ).toFixed(1)} KB`
                  : "Click here to select a file"}
              </span>

              <small>
                PDF, JPG, JPEG or PNG
              </small>

            </label>

            <input
              id="document-upload"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              hidden
            />


            {file && (
              <div className="selected-file">

                <span>📎</span>

                <div>
                  <strong>
                    {file.name}
                  </strong>

                  <small>
                    Ready to upload
                  </small>
                </div>

                <button
                  className="remove-file"
                  onClick={() => {
                    setFile(null);
                  }}
                >
                  ✕
                </button>

              </div>
            )}


            <button
              className="primary-wide-button"
              onClick={uploadDocument}
              disabled={!file || uploading}
            >
              {uploading
                ? "Processing document..."
                : "Upload & Process Document →"}
            </button>

          </>
        )}


        {/* OCR RESULT */}

        {uploaded && (
          <div className="ocr-success">

            <div className="success-icon">
              ✓
            </div>

            <h2>
              Document processed successfully
            </h2>

            <p>
              The document has been added to this
              patient's case.
            </p>


            {ocrText && (
              <div className="ocr-preview">

                <div className="ocr-preview-header">
                  <strong>
                    Extracted Information
                  </strong>

                  <span>
                    OCR
                  </span>
                </div>

                <div className="ocr-text">
                  {ocrText}
                </div>

              </div>
            )}


            <button
              className="primary-wide-button"
              onClick={finishDocuments}
            >
              Continue to Completion →
            </button>

          </div>
        )}


        {/* SKIP */}

        {!uploaded && (
          <button
            className="skip-button"
            onClick={finishDocuments}
          >
            Skip for now
          </button>
        )}

        <p className="document-security">
          🔒 Your uploaded documents are associated
          with this consultation.
        </p>

      </div>

    </div>
  );
}

export default DocumentUpload;