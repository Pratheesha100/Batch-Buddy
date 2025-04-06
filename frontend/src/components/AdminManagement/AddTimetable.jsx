import React, { useState } from "react";
import "./shared.css";

function AddTimetable({ onClose }) {
  const [formData, setFormData] = useState({
    faculty: '',
    batch: '',
    year: '',
    group: '',
    course: '',
    lecturer: '',
    session: '',
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    roomNumber: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation rules
  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'faculty':
        if (!value) {
          error = 'Please select a faculty';
        }
        break;

      case 'batch':
        if (!value) {
          error = 'Please select a batch';
        }
        break;

      case 'year':
        if (!value) {
          error = 'Please select a year';
        }
        break;

      case 'group':
        if (!value) {
          error = 'Please select a group';
        }
        break;

      case 'course':
        if (!value) {
          error = 'Please select a course';
        }
        break;

      case 'lecturer':
        if (!value) {
          error = 'Please select a lecturer';
        }
        break;

      case 'session':
        if (!value) {
          error = 'Please select a session type';
        }
        break;

      case 'dayOfWeek':
        if (!value) {
          error = 'Please select a day of the week';
        }
        break;

      case 'startTime':
        if (!value) {
          error = 'Start time is required';
        }
        break;

      case 'endTime':
        if (!value) {
          error = 'End time is required';
        } else if (formData.startTime && value <= formData.startTime) {
          error = 'End time must be after start time';
        }
        break;

      case 'roomNumber':
        if (!value) {
          error = 'Please select a room number';
        }
        break;

      case 'notes':
        if (value.length > 500) {
          error = 'Notes must not exceed 500 characters';
        }
        break;
    }
    return error;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate on change
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);

    // If there are no errors, proceed with submission
    if (Object.keys(newErrors).length === 0) {
      try {
        // Add your API call here
        console.log('Form submitted:', formData);
        onClose(); // Close the modal after successful submission
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    }

    setIsSubmitting(false);
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-content-container">
        <div className="admin-form-name-container">
          <h2>Add Timetable Details</h2>
          <p>Fill in the details to create a new timetable entry</p>
        </div>
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            <div>
              <label className="admin-label">Faculty</label>
              <select 
                name="faculty"
                value={formData.faculty}
                onChange={handleChange}
                className={errors.faculty ? 'admin-select admin-error' : 'admin-select'}
                required
              >
                <option value="">Select Faculty</option>
                <option value="computing">Computing</option>
                <option value="engineering">Engineering</option>
                <option value="business">Business</option>
                <option value="humanities">Humanities</option>
              </select>
              {errors.faculty && <span className="admin-error-message">{errors.faculty}</span>}
            </div>
            <div>
              <label className="admin-label">Batch </label>
              <select 
                name="batch"
                value={formData.batch}
                onChange={handleChange}
                className={errors.batch ? 'admin-select admin-error' : 'admin-select'}
                required
              >
                <option value="">Select Batch</option>
                <option value="batch1">Weekday</option>
                <option value="batch2">Weekend</option>
              </select>
              {errors.batch && <span className="admin-error-message">{errors.batch}</span>}
            </div>
            <div>
              <label className="admin-label">Year </label>
              <select 
                name="year"
                value={formData.year}
                onChange={handleChange}
                className={errors.year ? 'admin-select admin-error' : 'admin-select'}
                required
              >
                <option value="">Select Year</option>
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
                <option value="4">Year 4</option>
              </select>
              {errors.year && <span className="admin-error-message">{errors.year}</span>}
            </div>
            <div>
              <label className="admin-label">Group</label>
              <select 
                name="group"
                value={formData.group}
                onChange={handleChange}
                className={errors.group ? 'admin-select admin-error' : 'admin-select'}
                required
              >
                <option value="">Select Group</option>
                <option value="A">Group 1</option>
                <option value="B">Group 2</option>
                <option value="C">Group 3</option>
              </select>
              {errors.group && <span className="admin-error-message">{errors.group}</span>}
            </div>
            <div>
              <label className="admin-label">Course </label>
              <select 
                name="course"
                value={formData.course}
                onChange={handleChange}
                className={errors.course ? 'admin-select admin-error' : 'admin-select'}
                required
              >
                <option value="">Select Course</option>
                <option value="cs101">CS101</option>
                <option value="cs102">CS102</option>
                <option value="cs103">CS103</option>
              </select>
              {errors.course && <span className="admin-error-message">{errors.course}</span>}
            </div>
            <div>
              <label className="admin-label">Lecturer</label>
              <select 
                name="lecturer"
                value={formData.lecturer}
                onChange={handleChange}
                className={errors.lecturer ? 'admin-select admin-error' : 'admin-select'}
                required
              >
                <option value="">Select Lecturer</option>
                <option value="lecturer1">Dr. Smith</option>
                <option value="lecturer2">Prof. Johnson</option>
                <option value="lecturer3">Dr. Williams</option>
              </select>
              {errors.lecturer && <span className="admin-error-message">{errors.lecturer}</span>}
            </div>
            <div>
              <label className="admin-label">Session</label>
              <select 
                name="session"
                value={formData.session}
                onChange={handleChange}
                className={errors.session ?'admin-select admin-error' : 'admin-select'}
                required
              >
                <option value="">Select Session</option>
                <option value="lecture">Lecture</option>
                <option value="practical">Practical</option>
                <option value="tutorial">Tutorial</option>
              </select>
              {errors.session && <span className="admin-error-message">{errors.session}</span>}
            </div>
            <div>
              <label className="admin-label">Day of Week</label>
              <select 
                name="dayOfWeek"
                value={formData.dayOfWeek}
                onChange={handleChange}
                className={errors.dayOfWeek ? 'admin-select admin-error' : 'admin-select'}
                required
              >
                <option value="">Select Day</option>
                <option value="monday">Monday</option>
                <option value="tuesday">Tuesday</option>
                <option value="wednesday">Wednesday</option>
                <option value="thursday">Thursday</option>
                <option value="friday">Friday</option>
                <option value="saturday">Saturday</option>
                <option value="sunday">Sunday</option>
              </select>
              {errors.dayOfWeek && <span className="admin-error-message">{errors.dayOfWeek}</span>}
            </div>
            <div>
              <label className="admin-label">Start Time</label>
              <input 
                type="time" 
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className={errors.startTime ?'admin-input admin-error' : 'admin-input'}
                required
              />
              {errors.startTime && <span className="admin-error-message">{errors.startTime}</span>}
            </div>
            <div>
              <label className="admin-label">End Time</label>
              <input 
                type="time" 
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className={errors.endTime ? 'admin-input admin-error' : 'admin-input'}
                required
              />
              {errors.endTime && <span className="admin-error-message">{errors.endTime}</span>}
            </div>
            <div>
              <label className="admin-label">Room Number</label>
              <select 
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleChange}
                className={errors.roomNumber ? 'admin-select admin-error' : 'admin-select'}
                required
              >
                <option value="">Select Room</option>
                <option value="101">Room 101</option>
                <option value="102">Room 102</option>
                <option value="103">Room 103</option>
              </select>
              {errors.roomNumber && <span className="admin-error-message">{errors.roomNumber}</span>}
            </div>
          </div>
          <div className="admin-note-container">
            <label className="admin-label">Additional Notes</label>
            <textarea 
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Enter any additional notes or requirements"
              className={errors.notes ? 'admin-textarea admin-error' : 'admin-textarea'}
            ></textarea>
            {errors.notes && <span className="admin-error-message">{errors.notes}</span>}
          </div>
          <div className="admin-form-actions">
            <button
              type="button"
              className="admin-btn admin-cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="admin-btn admin-save-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Timetable'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTimetable;

