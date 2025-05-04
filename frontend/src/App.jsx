<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import reminderService from './services/reminderService.jsx';
import notificationService, { socket } from './services/notificationService';
import ReminderAlert from './components/ReminderAlert';

// Import your components
import NotificationList from './components/NotificationList';
import AddReminder from './components/AddReminder';
import EditReminder from './components/EditReminder';
import ReminderDetail from './components/ReminderDetail';
import NotificationTest from './components/NotificationTest';

function App() {
  const [activeReminder, setActiveReminder] = useState(null);

  useEffect(() => {
    // Request notification permission on load
    if ('Notification' in window) {
      Notification.requestPermission();
    }

    // Connect to socket server
    socket.connect();

    // Socket event listeners
    socket.on('reminderDue', (data) => {
      console.log('Reminder due received:', data);
      
      if (data && data._id) {
        // Always set as active reminder to show the alert
        setActiveReminder(data);

        // Play sound if enabled
        if (data.notificationTypes?.sound) {
          notificationService.playSound();
        }

        // Show browser notification if enabled
        if (data.notificationTypes?.push && Notification.permission === 'granted') {
          new Notification(data.title, {
            body: data.description || 'Reminder due now!',
            icon: '/favicon.ico'
          });
        }

        // Show toast notification
        toast.info(`Reminder: ${data.title}${data.description ? ` - ${data.description}` : ''}`, {
          position: "top-right",
          autoClose: false,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        console.error('Invalid reminder data received:', data);
      }
    });

    // Start checking reminders
    const checkInterval = setInterval(() => {
      reminderService.checkDueReminders();
    }, 30000); // Check every 30 seconds to match server

    // Initial check
    reminderService.checkDueReminders();

    return () => {
      clearInterval(checkInterval);
      socket.off('reminderDue');
      socket.disconnect();
    };
  }, []);

  const handleDismissReminder = async () => {
    if (activeReminder?._id) {
      try {
        await reminderService.dismissReminder(activeReminder._id);
        setActiveReminder(null);
        toast.success('Reminder dismissed');
      } catch (error) {
        console.error('Error dismissing reminder:', error);
        toast.error('Failed to dismiss reminder');
      }
    }
  };

  const handleEnableSound = () => {
    notificationService.enableSoundNotifications();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Full-screen reminder alert */}
      {activeReminder && (
        <ReminderAlert
          reminder={activeReminder}
          onDismiss={handleDismissReminder}
        />
      )}

      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-xl font-bold text-gray-900">
                  Reminder App
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Home
                </Link>
                <Link
                  to="/add"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Add Reminder
                </Link>
                <Link
                  to="/test-notifications"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Test Notifications
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleEnableSound}
                className="ml-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <i className="fas fa-volume-up mr-2"></i>
                Enable Sound
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<NotificationList />} />
          <Route path="/add" element={<AddReminder />} />
          <Route path="/edit/:id" element={<EditReminder />} />
          <Route path="/reminders/:id" element={<ReminderDetail />} />
          <Route path="/test-notifications" element={<NotificationTest />} />
        </Routes>
      </main>
=======
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
>>>>>>> origin/main2_test
    </div>
  );
}

<<<<<<< HEAD
export default App;
=======
export default App;
>>>>>>> origin/main2_test
