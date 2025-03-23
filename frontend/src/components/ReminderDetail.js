import React, { useState } from 'react';
import '../styles/ReminderDetail.css';
import { notificationService } from '../services/NotificationService';

const ReminderDetail = ({ reminder, onBack, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedReminder, setEditedReminder] = useState(null);

  if (!reminder) {
    return (
      <div className="reminder-detail">
        <div className="detail-header">
          <button className="back-btn" onClick={onBack}>
            <i className="fas fa-arrow-left"></i>
            Back to Reminders
          </button>
          <h1>Reminder Not Found</h1>
        </div>
        <p>This reminder could not be found.</p>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this reminder?')) {
      return;
    }
    try {
      await onDelete(reminder._id);
      onBack(); // Navigate back after successful deletion
    } catch (error) {
      console.error('Error deleting reminder:', error);
      alert('Failed to delete reminder');
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const response = await fetch(`http://localhost:5001/api/reminders/${reminder._id}/status`, {
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
      onEdit(updatedReminder); // Update parent component
      
      // Handle notifications based on status
      if (newStatus === 'active') {
        notificationService.scheduleNotification(updatedReminder);
      } else {
        notificationService.cancelAllNotifications();
      }
      
      alert('Reminder status updated successfully');
      onBack(); // Navigate back after successful status update
    } catch (err) {
      console.error('Error updating reminder status:', err);
      alert('Failed to update reminder status');
    }
  };

  const handleEdit = () => {
    setEditedReminder({
      ...reminder,
      date: new Date(reminder.date).toISOString().split('T')[0]
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/reminders/${reminder._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedReminder),
      });

      if (!response.ok) {
        throw new Error('Failed to update reminder');
      }

      const updatedReminder = await response.json();
      onEdit(updatedReminder); // Update parent component
      
      // Update notifications if status is active
      if (updatedReminder.status === 'active') {
        notificationService.scheduleNotification(updatedReminder);
      }
      
      setIsEditing(false);
      alert('Reminder updated successfully');
      onBack(); // Navigate back after successful update
    } catch (err) {
      console.error('Error updating reminder:', err);
      alert('Failed to update reminder');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedReminder(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedReminder(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="reminder-detail">
      <div className="detail-header">
        <button className="back-btn" onClick={onBack}>
          <i className="fas fa-arrow-left"></i>
          Back to Reminders
        </button>
        <div className="header-actions">
          {isEditing ? (
            <>
              <button className="save-btn" onClick={handleSave}>
                <i className="fas fa-save"></i>
                Save Changes
              </button>
              <button className="cancel-btn" onClick={handleCancel}>
                <i className="fas fa-times"></i>
                Cancel
              </button>
            </>
          ) : (
            <>
              <button className="edit-btn" onClick={handleEdit}>
                <i className="fas fa-edit"></i>
                Edit Reminder
              </button>
              <button className="delete-btn" onClick={handleDelete}>
                <i className="fas fa-trash"></i>
                Delete Reminder
              </button>
            </>
          )}
        </div>
      </div>

      <div className="detail-content">
        <div className="detail-section">
          {isEditing ? (
            <input
              type="text"
              name="title"
              value={editedReminder.title}
              onChange={handleInputChange}
              className="edit-input"
            />
          ) : (
            <h2>{reminder.title}</h2>
          )}
          <span className={`status-badge ${reminder.status.toLowerCase()}`}>
            {reminder.status}
          </span>
        </div>

        <div className="detail-section">
          <h3>Date & Time</h3>
          <div className="info-grid">
            <div className="info-item">
              <i className="far fa-calendar"></i>
              {isEditing ? (
                <input
                  type="date"
                  name="date"
                  value={editedReminder.date}
                  onChange={handleInputChange}
                  className="edit-input"
                />
              ) : (
                <span>{new Date(reminder.date).toLocaleDateString()}</span>
              )}
            </div>
            <div className="info-item">
              <i className="far fa-clock"></i>
              {isEditing ? (
                <input
                  type="time"
                  name="time"
                  value={editedReminder.time}
                  onChange={handleInputChange}
                  className="edit-input"
                />
              ) : (
                <span>{reminder.time}</span>
              )}
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>Notification Type</h3>
          <div className="info-item">
            <i className="fas fa-bell"></i>
            {isEditing ? (
              <select
                name="type"
                value={editedReminder.type}
                onChange={handleInputChange}
                className="edit-input"
              >
                <option value="Academic">Academic</option>
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Medical">Medical</option>
              </select>
            ) : (
              <span>{reminder.type}</span>
            )}
          </div>
        </div>

        <div className="detail-section">
          <h3>Description</h3>
          {isEditing ? (
            <textarea
              name="description"
              value={editedReminder.description || ''}
              onChange={handleInputChange}
              className="edit-input"
              rows="4"
            />
          ) : (
            <p className="description">{reminder.description || 'No description provided.'}</p>
          )}
        </div>

        <div className="detail-section">
          <h3>Additional Actions</h3>
          <div className="action-buttons">
            <button 
              className="snooze-btn"
              onClick={() => handleStatusUpdate('snoozed')}
            >
              <i className="fas fa-clock"></i>
              Snooze for 15 minutes
            </button>
            <button 
              className="dismiss-btn"
              onClick={() => handleStatusUpdate('dismissed')}
            >
              <i className="fas fa-check"></i>
              Mark as Complete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReminderDetail; 