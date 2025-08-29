import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const API_BASE_URL = "https://attendance-backend-1-vbuv.onrender.com/api"; 

export default function ScanPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone) {
      setMessage({ text: "Phone number is required", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, sessionId }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage({ text: data.message, type: "success" });
        setName("");
        setPhone("");
      } else {
        setMessage({ text: data.error, type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Error submitting attendance", type: "error" });
    }
    setLoading(false);
  };

  return (
    <div className="scan-container">
      <h2>Mark Attendance</h2>
      <p>Session ID: {sessionId}</p>

      {message && (
        <p style={{ color: message.type === "error" ? "red" : "green" }}>
          {message.text}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Phone (required):</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Name (only if first time):</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Attendance"}
        </button>
      </form>
    </div>
  );
}
