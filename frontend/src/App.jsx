import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import NotificationSettings from './components/NotificationSettings';
import NotificationList from './components/NotificationList';
import AddReminder from './components/AddReminder';
import ReminderDetail from './components/ReminderDetail';
import EditReminder from './components/EditReminder';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="fixed top-0 w-full bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center space-x-8 h-16">
            <Link to="/" className="inline-flex items-center px-4 py-2 text-gray-700 hover:text-blue-600">
              <i className="fas fa-bell mr-2"></i>
              Reminders
            </Link>
            <Link to="/settings" className="inline-flex items-center px-4 py-2 text-gray-700 hover:text-blue-600">
              <i className="fas fa-cog mr-2"></i>
              Settings
            </Link>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <Routes>
          <Route path="/settings" element={<NotificationSettings />} />
          <Route path="/add" element={<AddReminder />} />
          <Route path="/edit/:id" element={<EditReminder />} />
          <Route path="/reminder/:id" element={<ReminderDetail />} />
          <Route path="/" element={<NotificationList />} />
        </Routes>
      </main>
    </div>
  );
}

export default App; 