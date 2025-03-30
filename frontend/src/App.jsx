import React from 'react';
import { Route, Routes } from "react-router-dom";
import LandingPage from "./components/UserManagement/landingPage";
import UserLog from "./components/UserManagement/UserLog";
import Register from "./components/UserManagement/Register";

// Admin management system

// User management system

// Attendance management system

// Notification management system

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<UserLog />} />
        <Route path="/register" element={<Register />} />
        <Route path="/get-started" element={<UserLog />} />
        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </div>
  );
}

export default App;
