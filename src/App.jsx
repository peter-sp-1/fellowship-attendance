import { Routes, Route } from 'react-router-dom';
import FellowshipAttendanceApp from './FellowshipAttendanceApp.jsx';
import AttendanceForm from './AttendanceForm.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<FellowshipAttendanceApp />} />
      <Route path="/attend/:sessionId" element={<AttendanceForm />} />
    </Routes>
  );
}
