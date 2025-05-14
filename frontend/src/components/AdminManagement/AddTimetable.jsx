import React, { useState, useEffect } from "react";
import Swal from 'sweetalert2';
import "./shared.css";

// Helper function to format time (similar to UpdateTimetable)
const formatTimeForInput = (timeString) => {
    if (!timeString) return '';
    const parts = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (!parts) return timeString;
    let hours = parseInt(parts[1], 10);
    const minutes = parts[2];
    const period = parts[3] ? parts[3].toUpperCase() : null;
    if (period === 'PM' && hours < 12) hours += 12;
    else if (period === 'AM' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${minutes}`;
};

function AddTimetable({ onClose, onTimetableAdded }) {
  // State for dropdown data
  const [faculties, setFaculties] = useState([]);
  const [batches, setBatches] = useState([]);
  const [modules, setModules] = useState([]);
  const [groups, setGroups] = useState([]);
  const [locations, setLocations] = useState([]);
  const [lecturers, setLecturers] = useState([]);

  // Form Data State - matches Timetable Schema
  const [formData, setFormData] = useState({
    module: '',
    day: '',
    startTime: '',
    endTime: '',
    location: '',
    lecturer: '',
    group: '',
    year: '', // Derived from group
    semester: '', // Derived from group
    batch: '',
    faculty: '',
    type: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch dropdown data on component mount
  useEffect(() => {
    const fetchDropdowns = async () => {
      // Indicate loading state if needed
      try {
        const [facRes, batchRes, modRes, groupRes, locRes, lecRes] = await Promise.all([
          fetch('http://localhost:5000/api/admin/getFaculties'),
          fetch('http://localhost:5000/api/admin/getBatches'),
          fetch('http://localhost:5000/api/admin/modules'),
          fetch('http://localhost:5000/api/admin/groups'),
          fetch('http://localhost:5000/api/admin/locations'),
          fetch('http://localhost:5000/api/admin/lecturers'),
        ]);
        setFaculties(facRes.ok ? await facRes.json() : []);
        setBatches(batchRes.ok ? await batchRes.json() : []);
        setModules(modRes.ok ? await modRes.json() : []);
        setGroups(groupRes.ok ? await groupRes.json() : []);
        setLocations(locRes.ok ? await locRes.json() : []);
        setLecturers(lecRes.ok ? await lecRes.json() : []);
      } catch (err) {
        console.error("Error fetching dropdowns for AddTimetable:", err);
        Swal.fire({ // Notify user about dropdown fetch error
          icon: 'error',
          title: 'Error',
          text: 'Could not load necessary data. Please try closing and reopening the form.',
          confirmButtonColor: '#ef4444',
        });
      }
      // Indicate loading finished if needed
    };
    fetchDropdowns();
  }, []);

  // Validation rules - Mirroring UpdateTimetable validation
  const validateField = (name, value, currentFormData) => {
    let error = '';
    switch (name) {
      case 'faculty': if (!value) error = 'Please select a faculty'; break;
      case 'batch': if (!value) error = 'Please select a batch'; break;
      // Year and semester are derived, but check if they *become* empty after group change
      case 'year': if (!value) error = 'Year could not be determined from group'; break;
      case 'semester': if (!value) error = 'Semester could not be determined from group'; break;
      case 'group': if (!value) error = 'Please select a group'; break;
      case 'module': if (!value) error = 'Please select a module'; break;
      case 'lecturer': if (!value) error = 'Please select a lecturer'; break;
      case 'location': if (!value) error = 'Please select a location'; break;
      case 'day': if (!value) error = 'Please select a day'; break;
      case 'startTime': if (!value) error = 'Start time is required'; break;
      case 'endTime':
        if (!value) error = 'End time is required';
        else if (currentFormData.startTime && value <= currentFormData.startTime) {
          error = 'End time must be after start time';
        }
        break;
      case 'type': if (!value) error = 'Please select a session type'; break;
      default: break;
    }
    return error;
  };

  // Handle input changes - Including deriving year/semester from group
  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedFormData = { ...formData, [name]: value };
    let currentErrors = { ...errors };

    if (name === 'group') {
      const selectedGroup = groups.find(g => g._id === value);
      if (selectedGroup) {
        updatedFormData = {
          ...updatedFormData,
          year: selectedGroup.year || '',
          semester: selectedGroup.semester || '',
        };
        // Clear potential errors for derived fields when group is selected
        currentErrors.year = '';
        currentErrors.semester = '';
      } else {
        updatedFormData = { ...updatedFormData, year: '', semester: '' };
        // Set errors if group is deselected and derived fields are now empty
        currentErrors.year = validateField('year', '', updatedFormData);
        currentErrors.semester = validateField('semester', '', updatedFormData);
      }
      // Also validate the group field itself
      currentErrors.group = validateField('group', value, updatedFormData);
    } else {
      // Validate the currently changing field
      currentErrors[name] = validateField(name, value, updatedFormData);
    }

    // Special validation for endTime related to startTime
    if (name === 'startTime' || name === 'endTime'){
      currentErrors.endTime = validateField('endTime', updatedFormData.endTime, updatedFormData);
    }

    setFormData(updatedFormData);
    setErrors(currentErrors);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    let formIsValid = true;
    const newErrors = {};

    // Validate all fields before submitting
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key], formData);
      if (error) {
        newErrors[key] = error;
        formIsValid = false;
      }
    });

    setErrors(newErrors);

    if (formIsValid) {
      try {
        // Payload matches the backend controller
        const payload = {
          faculty: formData.faculty,
          batch: formData.batch,
          year: formData.year,
          semester: formData.semester,
          group: formData.group,
          module: formData.module,
          lecturer: formData.lecturer,
          location: formData.location,
          day: formData.day,
          startTime: formData.startTime,
          endTime: formData.endTime,
          type: formData.type,
        };

        const res = await fetch('http://localhost:5000/api/admin/addTimetables', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: 'Creation failed with status: ' + res.status }));
          throw new Error(errorData.message || 'Failed to create timetable entry');
        }

        // Call the callback to refresh data in the parent component
        if (onTimetableAdded) {
          onTimetableAdded();
        }

        onClose(); // Close the modal

        await Swal.fire({
          icon: 'success',
          title: 'Timetable Created',
          text: 'New timetable entry added successfully.',
          timer: 1500,
          showConfirmButton: false,
        });

      } catch (error) {
        console.error('Error creating timetable:', error);
        await Swal.fire({
          icon: 'error',
          title: 'Creation Failed',
          text: error.message || 'Could not create the timetable entry. Please check the details and try again.',
          confirmButtonColor: '#ef4444',
        });
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
                {faculties.map(f => <option key={f._id} value={f._id}>{f.facultyName}</option>)}
              </select>
              {errors.faculty && <span className="admin-error-message">{errors.faculty}</span>}
            </div>
            <div>
              <label className="admin-label">Batch</label>
              <select
                name="batch"
                value={formData.batch}
                onChange={handleChange}
                className={errors.batch ? 'admin-select admin-error' : 'admin-select'}
                required
              >
                <option value="">Select Batch</option>
                {batches.map(b => <option key={b._id} value={b._id}>{b.batchType}</option>)}
              </select>
              {errors.batch && <span className="admin-error-message">{errors.batch}</span>}
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
                {groups.map(g => (
                  <option key={g._id} value={g._id}>
                    {`${g.groupNum} (Y${g.year || '?'}, S${g.semester || '?'})`}
                  </option>
                ))}
              </select>
              {errors.group && <span className="admin-error-message">{errors.group}</span>}
            </div>
            <div>
              <label className="admin-label">Year</label>
              <input
                type="number"
                name="year"
                value={formData.year} // Display derived value
                className={`${errors.year ? 'admin-error' : ''} admin-input admin-input-readonly`} // Style as readonly
                readOnly // Make it non-editable
                placeholder="(from Group)"
              />
              {errors.year && <span className="admin-error-message">{errors.year}</span>}
            </div>
            <div>
              <label className="admin-label">Semester</label>
              <input
                type="number"
                name="semester"
                value={formData.semester} // Display derived value
                className={`${errors.semester ? 'admin-error' : ''} admin-input admin-input-readonly`}
                readOnly // Make it non-editable
                placeholder="(from Group)"
              />
              {errors.semester && <span className="admin-error-message">{errors.semester}</span>}
            </div>
            <div>
              <label className="admin-label">Module</label>
              <select
                name="module"
                value={formData.module}
                onChange={handleChange}
                className={errors.module ? 'admin-select admin-error' : 'admin-select'}
                required
              >
                <option value="">Select Module</option>
                {modules.map(m => <option key={m._id} value={m._id}>{m.moduleName} ({m.moduleCode})</option>)}
              </select>
              {errors.module && <span className="admin-error-message">{errors.module}</span>}
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
                {lecturers.map(l => <option key={l._id} value={l._id}>{l.lecturerName}</option>)}
              </select>
              {errors.lecturer && <span className="admin-error-message">{errors.lecturer}</span>}
            </div>
            <div>
              <label className="admin-label">Location</label>
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={errors.location ? 'admin-select admin-error' : 'admin-select'}
                required
              >
                <option value="">Select Location</option>
                {locations.map(loc => <option key={loc._id} value={loc._id}>{loc.locationName} ({loc.locationCode})</option>)}
              </select>
              {errors.location && <span className="admin-error-message">{errors.location}</span>}
            </div>
            <div>
              <label className="admin-label">Day of Week</label>
              <select
                name="day"
                value={formData.day}
                onChange={handleChange}
                className={errors.day ? 'admin-select admin-error' : 'admin-select'}
                required
              >
                <option value="">Select Day</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
              {errors.day && <span className="admin-error-message">{errors.day}</span>}
            </div>
            <div>
              <label className="admin-label">Start Time</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className={errors.startTime ? 'admin-input admin-error' : 'admin-input'}
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
              <label className="admin-label">Session Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={errors.type ? 'admin-select admin-error' : 'admin-select'}
                required
              >
                <option value="">Select Session Type</option>
                <option value="Lecture">Lecture</option>
                <option value="Practical">Practical</option>
                <option value="Tutorial">Tutorial</option>
                <option value="Presentation">Presentation</option>
                <option value="Viva">Viva</option>
              </select>
              {errors.type && <span className="admin-error-message">{errors.type}</span>}
            </div>
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

