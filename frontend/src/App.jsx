import { Route, Routes, useLocation } from "react-router-dom";

//Admin management system

//User management system

//Attendance management system

//Notification management system


function App() {

  return (
    <div className='min-h-screen bg-gradient-to-b from-[#140d25] via-[#2a1340] to-[#402060] flex items-center justify-center relative overflow-hidden'>
      <Routes>

        {/* Admin Routes */}
        <Route path="/test" element={<SignUp />} />


        {/* User Routes */}


        {/* Notification Routes */}


        {/* Attendance Routes */}


      </Routes>
    </div>
  )
}

export default App
