<<<<<<< HEAD
import { Route, Routes, useLocation } from "react-router-dom";

// Admin management system
import AdminDash from './components/AdminManagement/AdminDashboard.jsx';
import Timetable from './components/AdminManagement/Timetable.jsx';
import Event from './components/AdminManagement/Event.jsx'
=======
import React from 'react';
import { Route, Routes } from "react-router-dom";
import jsPDF from "jspdf";
>>>>>>> new-User-management

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

// Simulate Admin
import SimulateAdmin from "./components/SimulateAdmin/SimulateAdmin";
import TimetableManager from "./components/SimulateAdmin/TimetableManager";

// Optional: NotFound component
const NotFound = () => <div>404 - Page not found</div>;

function App() {
  return (
    <div className="app">
      <Routes>
<<<<<<< HEAD
        {/* Admin Routes */}
        <Route path="" element={<AdminDash/>} />
        <Route path="/dashboard" element={<AdminDash />}/>
        <Route path="/timetable" element={<Timetable />}/>
        <Route path="/events" element={<Event />}/>

        
        {/* User Routes */}
=======
        {/* User Management Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<UserLog />} />
        <Route path="/register" element={<Register />} />
        <Route path="/get-started" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/task-corner" element={<TaskCorner />} />
        <Route path="/report" element={<Report />} />
>>>>>>> new-User-management

        {/* Attendance & Productivity Routes */}
        <Route path="/home" element={<BatchBuddy />} />
        <Route path="/timetable" element={<TimeTable />} />
        <Route path="/attendance" element={<AttendanceView />} />
        <Route path="/mark-attendance" element={<MarkAttendance />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/user-profile" element={<UserProfile />} />

       

        {/* Simulate Admin Route */}
        <Route path="/simulate-admin" element={<SimulateAdmin />} />
        <Route path="/admin-timetable" element={<TimetableManager />} />


        {/* Fallback route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
