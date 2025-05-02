import React from 'react';
import { Route, Routes } from "react-router-dom";
import jsPDF from "jspdf";

// User management system
import LandingPage from "./components/UserManagement/landingPage";
import UserLog from "./components/UserManagement/UserLog";
import Register from "./components/UserManagement/Register";
import ResetPassword from "./components/UserManagement/ResetPassword";
import Report from "./components/UserManagement/Report";

// Attendance & Productivity management system
import BatchBuddy from "./components/Attendance&Productivity/Home";
import TimeTable from "./components/Attendance&Productivity/TimeTable";
import AttendanceView from "./components/Attendance&Productivity/AttendanceView";
import MarkAttendance from "./components/Attendance&Productivity/MarkAttendance";
import Contact from "./components/Attendance&Productivity/Contact";
import AboutUs from "./components/Attendance&Productivity/AboutUs";
import UserProfile from "./components/Attendance&Productivity/UserProfile";
import TaskCorner from "./components/UserManagement/TaskCorner";

// Optional: NotFound component
const NotFound = () => <div>404 - Page not found</div>;

function App() {
  return (
    <div className="app">
      <Routes>
        {/* User Management Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<UserLog />} />
        <Route path="/register" element={<Register />} />
        <Route path="/get-started" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Attendance & Productivity Routes */}
        <Route path="/home" element={<BatchBuddy />} />
        <Route path="/timetable" element={<TimeTable />} />
        <Route path="/attendance" element={<AttendanceView />} />
        <Route path="/mark-attendance" element={<MarkAttendance />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/user-profile" element={<UserProfile />} />
        <Route path="/task-corner" element={<TaskCorner />} />
        <Route path="/report" element={<Report />} />

        {/* Fallback route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
