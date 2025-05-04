import { Route, Routes, useLocation } from "react-router-dom";

// Admin management system
import AdminDash from './components/AdminManagement/AdminDashboard.jsx';
import Timetable from './components/AdminManagement/Timetable.jsx';
import Event from './components/AdminManagement/Event.jsx'
import Faculty from "./components/AdminManagement/Faculty.jsx";
import Student from "./components/AdminManagement/Student.jsx";
import Lecturer from "./components/AdminManagement/Lecturer.jsx";
import Location from "./components/AdminManagement/Location.jsx";
import AnalysisPage from "./components/AdminManagement/AnalysisPage.jsx";

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
        <Route path="/faculties" element={<Faculty/>}/>
        <Route path="/students" element={<Student/>}/>
        <Route path="/lecturers" element={<Lecturer/>}/>
        <Route path="/locations" element={<Location/>}/>
        <Route path="/analysis" element={<AnalysisPage/>}/>


        
        {/* User Routes */}

        {/* Notification Routes */}

        {/* Attendance Routes */}
      </Routes>  
      
  );
}

export default App;
