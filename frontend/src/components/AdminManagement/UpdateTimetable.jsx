import React, { useState, useEffect } from "react";
import "./updateTimetable.css";

function UpdateTimetable({ timetable, onClose, onUpdate }) {
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

  // Initialize form data when timetable prop changes
  useEffect(() => {
    if (timetable) {
      setFormData({
        faculty: timetable.faculty || '',
        batch: timetable.batch || '',
        year: timetable.year || '',
        group: timetable.group || '',
        course: timetable.course || '',
        lecturer: timetable.professor || '',
        session: timetable.type || '',
        dayOfWeek: timetable.day?.toLowerCase() || '',
        startTime: timetable.oldTime || '',
        endTime: timetable.newTime || '',
        roomNumber: timetable.room || '',
        notes: timetable.notes || ''
      });
    }
  }, [timetable]);

  // Helper function to convert 12-hour time format to 24-hour format
  const convertTo24Hour = (time12h) => {
    if (!time12h) return '';
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    
    if (hours === '12') {
      hours = '00';
    }
    
    if (modifier === 'PM') {
      hours = parseInt(hours, 10) + 12;
    }
    
    return `${hours.padStart(2, '0')}:${minutes}`;
  };

  // Helper function to convert 24-hour time format to 12-hour format for submission
  const convertTo12Hour = (time24h) => {
    if (!time24h) return '';
    const [hours, minutes] = time24h.split(':');
    const hour = parseInt(hours, 10);
    
    if (hour === 0) {
      return `12:${minutes} AM`;
    } else if (hour < 12) {
      return `${hour}:${minutes} AM`;
    } else if (hour === 12) {
      return `12:${minutes} PM`;
    } else {
      return `${hour - 12}:${minutes} PM`;
    }
  };

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
        // Convert the form data back to the table data format
        const updatedData = {
          ...timetable,
          faculty: formData.faculty,
          year: formData.year,
          batch: formData.batch,
          group: formData.group,
          course: formData.course,
          professor: formData.lecturer,
          room: formData.roomNumber,
          oldTime: formData.startTime,
          newTime: formData.endTime,
          notes: formData.notes
        };
        
        await onUpdate(updatedData);
        onClose();
      } catch (error) {
        console.error('Error updating timetable:', error);
      }
    }

    setIsSubmitting(false);
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-content-container">
        <div className="admin-form-name-container">
          <h2>Update Timetable Details</h2>
          <p>Modify the details to update the timetable entry</p>
        </div>
        <form className="admin-timetable-form" onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            <div>
              <label>Faculty</label>
              <select 
                name="faculty"
                value={formData.faculty}
                onChange={handleChange}
                className={errors.faculty ? 'admin-error' : ''}
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
              <label>Batch </label>
              <select 
                name="batch"
                value={formData.batch}
                onChange={handleChange}
                className={errors.batch ? 'admin-error' : ''}
                required
              >
                <option value="">Select Batch</option>
                <option value="Weekday">Weekday</option>
                <option value="Weekend">Weekend</option>
              </select>
              {errors.batch && <span className="admin-error-message">{errors.batch}</span>}
            </div>
            <div>
              <label>Year </label>
              <select 
                name="year"
                value={formData.year}
                onChange={handleChange}
                className={errors.year ? 'admin-error' : ''}
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
              <label>Group</label>
              <select 
                name="group"
                value={formData.group}
                onChange={handleChange}
                className={errors.group ? 'admin-error' : ''}
                required
              >
                <option value="">Select Group</option>
                <option value="G1">G1</option>
                <option value="G2">G2</option>
                <option value="G3">G3</option>
              </select>
              {errors.group && <span className="admin-error-message">{errors.group}</span>}
            </div>
            <div>
              <label>Course </label>
              <select 
                name="course"
                value={formData.course}
                onChange={handleChange}
                className={errors.course ? 'admin-error' : ''}
                required
              >
                <option value="">Select Course</option>
                <option value="CS101">CS101</option>
                <option value="CS102">CS102</option>
                <option value="CS103">CS103</option>
              </select>
              {errors.course && <span className="admin-error-message">{errors.course}</span>}
            </div>
            <div>
              <label>Lecturer</label>
              <select 
                name="lecturer"
                value={formData.lecturer}
                onChange={handleChange}
                className={errors.lecturer ? 'admin-error' : ''}
                required
              >
                <option value="">Select Lecturer</option>
                <option value="L101">L101</option>
                <option value="L102">L102</option>
                <option value="L103">L103</option>
              </select>
              {errors.lecturer && <span className="admin-error-message">{errors.lecturer}</span>}
            </div>
            <div>
              <label>Session</label>
              <select 
                name="session"
                value={formData.session}
                onChange={handleChange}
                className={errors.session ? 'admin-error' : ''}
                required
              >
                <option value="">Select Session</option>
                <option value="Lecture">Lecture</option>
                <option value="Practical">Practical</option>
                <option value="Tutorial">Tutorial</option>
              </select>
              {errors.session && <span className="admin-error-message">{errors.session}</span>}
            </div>
            <div>
              <label>Day of Week</label>
              <select 
                name="dayOfWeek"
                value={formData.dayOfWeek}
                onChange={handleChange}
                className={errors.dayOfWeek ? 'admin-error' : ''}
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
              <label>Start Time</label>
              <input 
                type="time" 
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className={errors.startTime ? 'admin-error' : ''}
                required
              />
              {errors.startTime && <span className="admin-error-message">{errors.startTime}</span>}
            </div>
            <div>
              <label>End Time</label>
              <input 
                type="time" 
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className={errors.endTime ? 'admin-error' : ''}
                required
              />
              {errors.endTime && <span className="admin-error-message">{errors.endTime}</span>}
            </div>
    <div>
              <label>Room Number</label>
              <select 
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleChange}
                className={errors.roomNumber ? 'admin-error' : ''}
                required
              >
                <option value="">Select Room</option>
                <option value="R201">R201</option>
                <option value="R202">R202</option>
                <option value="R203">R203</option>
              </select>
              {errors.roomNumber && <span className="admin-error-message">{errors.roomNumber}</span>}
            </div>
          </div>
          <div className="admin-note-container">
            <label>Additional Notes</label>
            <textarea 
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Enter any additional notes or requirements"
              className={errors.notes ? 'admin-error' : ''}
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
              {isSubmitting ? 'Updating...' : 'Update Timetable'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateTimetable;
