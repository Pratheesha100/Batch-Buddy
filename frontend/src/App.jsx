import { Route, Routes, useLocation } from "react-router-dom";

// Admin management system
import Test from "./components/AdminManagement/test"; // Capitalized
import UserLog from "./components/UserManagement/UserLog";

// User management system

// Attendance management system

// Notification management system

function App() {
  const location = useLocation();

  return (
      <Routes>
        {/* Admin Routes */}
        <Route path="/" element={<UserLog />} />
        
        {/* User Routes */}

        {/* Notification Routes */}

        {/* Attendance Routes */}
      </Routes>  
      
  );
}

export default App;
