import React, { useState, useEffect } from 'react';
import '../styles/ReminderDetail.css';
import { notificationService } from '../services/NotificationService';

const ReminderDetail = ({ reminder, onBack, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedReminder, setEditedReminder] = useState({ ...reminder });
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(reminder.status);
  const [error, setError] = useState('');

  useEffect(() => {
    setEditedReminder({ ...reminder });
  }, [reminder]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this reminder?')) return;
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5001/api/reminders/${reminder._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete reminder');
      
      onDelete(reminder._id);
      onBack();
    } catch (err) {
      console.error('Error deleting reminder:', err);
      setError('Failed to delete reminder');
    } finally {
      setIsLoading(false);
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

      if (!response.ok) throw new Error('Failed to update reminder status');
      const updatedReminder = await response.json();
      setStatus(updatedReminder.status);

      if (newStatus === 'active') {
        notificationService.scheduleNotification(updatedReminder);
      } else {
        notificationService.cancelAllNotifications();
      }

      onEdit(updatedReminder);
      alert('Reminder status updated');
    } catch (err) {
      console.error('Error updating reminder status:', err);
      setError('Failed to update reminder status');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editedReminder.title || !editedReminder.date || !editedReminder.time) {
      alert('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`http://localhost:5001/api/reminders/${reminder._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedReminder),
      });

      if (!response.ok) throw new Error('Failed to update reminder');
      const updatedReminder = await response.json();
      onEdit(updatedReminder);
      setIsEditing(false);
      alert('Reminder updated');
      onBack();
    } catch (err) {
      console.error('Error updating reminder:', err);
      setError('Failed to update reminder');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedReminder({ ...reminder });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedReminder((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="reminder-detail">
      <div className="detail-header">
        <button className="back-btn" onClick={onBack}>
          <i className="fas fa-arrow-left"></i> Back to Reminders
        </button>
        <div className="header-actions">
          {isEditing ? (
            <>
              <button className="save-btn" onClick={handleSave} disabled={isLoading}>
                <i className="fas fa-save"></i> {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button className="cancel-btn" onClick={handleCancel}>
                <i className="fas fa-times"></i> Cancel
              </button>
            </>
          ) : (
            <>
              <button className="edit-btn" onClick={handleEdit}>
                <i className="fas fa-edit"></i> Edit Reminder
              </button>
              <button className="delete-btn" onClick={handleDelete} disabled={isLoading}>
                <i className="fas fa-trash"></i> {isLoading ? 'Deleting...' : 'Delete Reminder'}
              </button>
            </>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

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
          <span className={`status-badge ${status.toLowerCase()}`}>{status}</span>
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
            <p>{reminder.description || 'No description provided.'}</p>
          )}
        </div>

        <div className="detail-section">
          <h3>Actions</h3>
          <div className="action-buttons">
            <button
              className="mark-read-btn"
              onClick={() => handleStatusUpdate('read')}
              disabled={isLoading}
            >
              <i className="fas fa-check"></i> Mark as Read
            </button>
            <button
              className="snooze-btn"
              onClick={() => handleStatusUpdate('snoozed')}
              disabled={isLoading}
            >
              <i className="fas fa-clock"></i> Snooze for 15 minutes
            </button>
            <button
              className="dismiss-btn"
              onClick={() => handleStatusUpdate('dismissed')}
              disabled={isLoading}
            >
              <i className="fas fa-check"></i> Mark as Complete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReminderDetail;
