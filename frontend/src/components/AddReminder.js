import React, { useState } from 'react';
import '../styles/AddReminder.css';

const AddReminder = ({ onCancel, onSave }) => {
  const [reminder, setReminder] = useState({
    title: '',
    date: '',
    time: '',
    type: 'Academic',
    description: '',
    status: 'active'
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReminder((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Function to check if the date is in the past
  const isDateInPast = (date) => {
    const currentDate = new Date();
    const selectedDate = new Date(date);

    // Set time to 00:00:00 to only compare the date (ignore time part)
    selectedDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);

    return selectedDate < currentDate;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate if the selected date is not in the past
    if (isDateInPast(reminder.date)) {
      setError('The selected date cannot be in the past.');
      return; // Prevent form submission if the date is in the past
    } else {
      setError(''); // Clear error message when the date is valid
    }

    try {
      const response = await fetch('http://localhost:5001/api/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reminder),
      });

      if (response.ok) {
        alert('Reminder added successfully!');
        onSave(); // This will navigate back to the reminders list
      } else {
        alert('Error adding reminder');
      }
    } catch (error) {
      console.error('Error saving reminder:', error);
      alert('Error saving reminder');
    }
  };

  return (
    <div className="add-reminder">
      <div className="form-header">
        <h1>Add New Reminder</h1>
        <p>Create a new reminder for your schedule</p>
      </div>

      <form onSubmit={handleSubmit} className="reminder-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={reminder.title}
            onChange={handleChange}
            placeholder="Enter reminder title"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={reminder.date}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]} // Disable previous days
            />
          </div>

          <div className="form-group">
            <label htmlFor="time">Time</label>
            <input
              type="time"
              id="time"
              name="time"
              value={reminder.time}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="type">Type</label>
            <select
              id="type"
              name="type"
              value={reminder.type}
              onChange={handleChange}
              required
            >
              <option value="Academic">Academic</option>
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="Medical">Medical</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={reminder.description}
            onChange={handleChange}
            placeholder="Enter reminder description"
            rows="4"
          />
        </div>

        {error && <p className="error">{error}</p>} {/* Display error message */}

        <div className="form-actions">
          <button type="submit" className="save-btn">Save Reminder</button>
          <button type="button" className="cancel-btn" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AddReminder;
