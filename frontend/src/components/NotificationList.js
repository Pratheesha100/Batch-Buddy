import React, { useState, useEffect } from 'react';
import '../styles/NotificationList.css';
import { notificationService } from '../services/NotificationService';

const NotificationList = ({ onAddClick, onReminderClick }) => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReminders();
    setupNotifications();
    return () => {
      notificationService.cancelAllNotifications();
    };
  }, []);

  const setupNotifications = async () => {
    const permissionGranted = await notificationService.requestPermission();
    if (permissionGranted) {
      console.log('Notification permission granted');
    }
  };

  const fetchReminders = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/reminders');
      if (!response.ok) {
        throw new Error('Failed to fetch reminders');
      }
      const data = await response.json();
      setReminders(data);
      // Schedule notifications for active reminders
      data.forEach(reminder => {
        if (reminder.status === 'active') {
          notificationService.scheduleNotification(reminder);
        }
      });
    } catch (err) {
      setError(err.message);
      console.error('Error fetching reminders:', err);
      alert('Failed to load reminders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this reminder?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/reminders/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete reminder');
      }

      // Update the local state by filtering out the deleted reminder
      setReminders(reminders.filter(reminder => reminder._id !== id));
      alert('Reminder deleted successfully');
    } catch (err) {
      console.error('Error deleting reminder:', err);
      alert(`Failed to delete reminder: ${err.message}`);
      // Refresh the reminders list to ensure UI is in sync with backend
      fetchReminders();
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5001/api/reminders/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update reminder status');
      }

      const updatedReminder = await response.json();
      // Update the local state with the updated reminder
      setReminders(reminders.map(reminder => 
        reminder._id === id ? updatedReminder : reminder
      ));
      alert(`Reminder ${newStatus} successfully`);
    } catch (err) {
      console.error('Error updating reminder status:', err);
      alert('Failed to update reminder status');
      // Refresh the reminders list to ensure UI is in sync with backend
      fetchReminders();
    }
  };

  const handleVoiceInput = () => {
    // Placeholder for voice input functionality
    console.log('Voice input activated');
  };

  const handleReadSchedule = () => {
    // Placeholder for reading schedule functionality
    console.log('Reading schedule');
  };

  if (loading) {
    return <div className="loading">Loading reminders...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>Error: {error}</p>
        <button onClick={fetchReminders} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="notification-list">
      <div className="list-header">
        <h2>My Reminders</h2>
        <button className="add-btn" onClick={onAddClick}>
          Create New Reminder
        </button>
      </div>

      <div className="reminders-container">
        {reminders.length === 0 ? (
          <div className="no-reminders">
            <p>No reminders found. Create your first reminder!</p>
          </div>
        ) : (
          reminders.map((reminder) => (
            <div
              key={reminder._id}
              className="reminder-card"
              onClick={() => onReminderClick(reminder)}
            >
              <div className="reminder-header">
                <h3>{reminder.title}</h3>
                <span className={`status-badge ${reminder.status}`}>
                  {reminder.status}
                </span>
              </div>
              <div className="reminder-info">
                <p>
                  <i className="fas fa-calendar"></i> {new Date(reminder.date).toLocaleDateString()}
                </p>
                <p>
                  <i className="fas fa-clock"></i> {reminder.time}
                </p>
                <p>
                  <i className="fas fa-tag"></i> {reminder.type}
                </p>
              </div>
              <p className="reminder-description">{reminder.description}</p>
              <div className="reminder-actions" onClick={(e) => e.stopPropagation()}>
                <button 
                  className="snooze-btn"
                  onClick={() => handleStatusUpdate(reminder._id, 'snoozed')}
                >
                  <i className="fas fa-clock"></i> Snooze
                </button>
                <button 
                  className="dismiss-btn"
                  onClick={() => handleStatusUpdate(reminder._id, 'dismissed')}
                >
                  <i className="fas fa-check"></i> Dismiss
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="action-buttons">
        <button className="voice-btn" onClick={handleVoiceInput}>
          <i className="fas fa-microphone"></i> Voice Input
        </button>
        <button className="read-btn" onClick={handleReadSchedule}>
          <i className="fas fa-volume-up"></i> Read Schedule
        </button>
      </div>
    </div>
  );
};

export default NotificationList; 