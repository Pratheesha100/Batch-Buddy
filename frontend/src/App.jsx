import { Route, Routes, useLocation } from "react-router-dom";


// Admin management system
import Test from "./components/AdminManagement/test"; // Capitalized

// User management system

// Attendance management system
import BatchBuddy from "./components/Attendance&Productivity/Home";
import TimeTable from "./components/Attendance&Productivity/TimeTable";
import AttendanceView from "./components/Attendance&Productivity/AttendanceView";
import MarkAttendance from "./components/Attendance&Productivity/MarkAttendance";
import Contact from "./components/Attendance&Productivity/Contact";
import AboutUs from './components/Attendance&Productivity/AboutUs';

// Notification management system

function App() {
  const location = useLocation();

  return (
      <Routes>
        {/* Admin Routes */}
        <Route path="/" element={<BatchBuddy />} />
        <Route path="/timetable" element={<TimeTable />} />
        <Route path="/attendance" element={<AttendanceView />} />
        <Route path="/mark-attendance" element={<MarkAttendance />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<AboutUs />} />
        
        {/* User Routes */}

        {/* Notification Routes */}

        {/* Attendance Routes */}
        

      </Routes>  
      
  );
}

export default App;
