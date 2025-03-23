import React, { useState } from 'react';
import NotificationSettings from './components/NotificationSettings';
import NotificationList from './components/NotificationList';
import AddReminder from './components/AddReminder';
import ReminderDetail from './components/ReminderDetail';
import './styles/App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('reminders');
  const [selectedReminder, setSelectedReminder] = useState(null);

  const renderPage = () => {
    switch (currentPage) {
      case 'reminders':
        return (
          <NotificationList
            onAddClick={() => setCurrentPage('add')}
            onReminderClick={(reminder) => {
              setSelectedReminder(reminder);
              setCurrentPage('detail');
            }}
          />
        );
      case 'settings':
        return <NotificationSettings />;
      case 'add':
        return (
          <AddReminder
            onCancel={() => setCurrentPage('reminders')}
            onSave={() => setCurrentPage('reminders')}
          />
        );
      case 'detail':
        return (
          <ReminderDetail
            reminder={selectedReminder}
            onBack={() => setCurrentPage('reminders')}
            onEdit={() => setCurrentPage('add')}
            onDelete={() => setCurrentPage('reminders')}
          />
        );
      default:
        return <NotificationList />;
    }
  };

  return (
    <div className="App">
      <nav className="main-nav">
        <button
          className={`nav-btn ${currentPage === 'reminders' ? 'active' : ''}`}
          onClick={() => setCurrentPage('reminders')}
        >
          <i className="fas fa-bell"></i>
          Reminders
        </button>
        <button
          className={`nav-btn ${currentPage === 'settings' ? 'active' : ''}`}
          onClick={() => setCurrentPage('settings')}
        >
          <i className="fas fa-cog"></i>
          Settings
        </button>
      </nav>
      <div className="app-container">
        {renderPage()}
      </div>
    </div>
  );
}

export default App; 