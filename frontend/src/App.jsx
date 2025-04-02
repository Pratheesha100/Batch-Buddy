import { Route, Routes, useLocation } from "react-router-dom";

// Admin management system
import AdminDash from './components/AdminManagement/AdminDashboard.jsx';
import Timetable from './components/AdminManagement/Timetable.jsx';
import Event from './components/AdminManagement/Event.jsx'

// User management system

// Attendance management system

// Notification management system

function App() {
  const location = useLocation();

  return (
      <Routes>
        {/* Admin Routes */}
        <Route path="" element={<AdminDash/>} />
        <Route path="/dashboard" element={<AdminDash />}/>
        <Route path="/timetable" element={<Timetable />}/>
        <Route path="/events" element={<Event />}/>

        
        {/* User Routes */}

        {/* Notification Routes */}

        {/* Attendance Routes */}
      </Routes>  
      
  );
}

export default App;
