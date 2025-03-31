import React from 'react';
import { Route, Routes } from "react-router-dom";


// Admin management system

// User management system
import LandingPage from "./components/UserManagement/landingPage";
import UserLog from "./components/UserManagement/UserLog";
import Register from "./components/UserManagement/Register";
import ResetPassword from "./components/UserManagement/ResetPassword";

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<UserLog />} />
        <Route path="/register" element={<Register />} />
        <Route path="/get-started" element={<UserLog />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </div>
  );
}

// Attendance management system

// Notification management system



export default App;
