import { useParams } from "react-router-dom";
import { useState } from "react";

export default function AttendanceForm() {
  const { sessionId } = useParams();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const name = e.target.name.value;
    const email = e.target.email.value;
    const phone = e.target.phone.value;

    try {
      const res = await fetch("http://localhost:5000/api/attendees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, name, email, phone }),
      });

      if (!res.ok) throw new Error("Failed to submit");

      alert("✅ Attendance recorded successfully!");
      e.target.reset();
    } catch (err) {
      alert("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md space-y-4 w-full max-w-md"
      >
        <h2 className="text-xl font-bold text-center">
          Register Attendance
        </h2>

        <p className="text-gray-500 text-sm text-center">
          Session ID: <span className="font-mono">{sessionId}</span>
        </p>

        <input
          name="name"
          placeholder="Full Name"
          required
          className="border p-2 w-full rounded"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="border p-2 w-full rounded"
        />
        <input
          name="phone"
          placeholder="Phone Number"
          className="border p-2 w-full rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
