import { BrowserRouter, Routes, Route } from "react-router-dom";
import FellowshipAttendanceApp from "./FellowshipAttendanceApp";
import AttendanceForm from "./AttendanceForm";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main dashboard (what you pasted above) */}
        <Route path="/" element={<FellowshipAttendanceApp />} />

        {/* Page users see when scanning QR code */}
        <Route path="/attend/:sessionId" element={<AttendanceForm />} />
      </Routes>
    </BrowserRouter>
  );
}
