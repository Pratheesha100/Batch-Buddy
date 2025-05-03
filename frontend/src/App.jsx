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
    </div>
  );
}

export default App;