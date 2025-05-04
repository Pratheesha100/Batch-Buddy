import React, { useState, useEffect } from "react";
import Swal from 'sweetalert2';
import "./shared.css";

// Helper function to format time for input type="time" (HH:mm)
const formatTimeForInput = (timeString) => {
    if (!timeString) return '';
    // Assuming timeString might be like "09:00 AM" or "14:30"
    const parts = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (!parts) return timeString; // Return as is if format is unexpected

    let hours = parseInt(parts[1], 10);
    const minutes = parts[2];
    const period = parts[3] ? parts[3].toUpperCase() : null;

    if (period === 'PM' && hours < 12) {
        hours += 12;
    } else if (period === 'AM' && hours === 12) {
        hours = 0; // Midnight case
    }

    return `${String(hours).padStart(2, '0')}:${minutes}`;
};

function UpdateTimetable({ timetable, onClose, onUpdate }) {
    // State for dropdown data
    const [faculties, setFaculties] = useState([]);
    const [batches, setBatches] = useState([]);
    const [modules, setModules] = useState([]);
    const [groups, setGroups] = useState([]);
    const [locations, setLocations] = useState([]);
    const [lecturers, setLecturers] = useState([]);

    const [formData, setFormData] = useState({
        module: '',
        day: '',
        startTime: '',
        endTime: '',
        location: '',
        lecturer: '',
        group: '',
        year: '', // Now derived from group, but kept for potential direct setting? Check schema.
        semester: '', // Add semester
        batch: '',
        faculty: '',
        type: '',
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch dropdown data on component mount
    useEffect(() => {
        const fetchDropdowns = async () => {
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
                console.error("Error fetching dropdowns:", err);
                // Optionally show an error message to the user
            }
        };
        fetchDropdowns();
    }, []);


    // Initialize form data when timetable prop changes
    useEffect(() => {
        if (timetable) {
            // Find the group object to extract year and semester if needed
            const groupData = groups.find(g => g._id === (timetable.group?._id || timetable.group));

            setFormData({
                faculty: timetable.faculty?._id || timetable.faculty || '',
                batch: timetable.batch?._id || timetable.batch || '',
                year: timetable.year || groupData?.year || '', // Use timetable.year first
                semester: timetable.semester || groupData?.semester || '', // Use timetable.semester first
                group: timetable.group?._id || timetable.group || '',
                module: timetable.module?._id || timetable.module || '',
                lecturer: timetable.lecturer?._id || timetable.lecturer || '',
                location: timetable.location?._id || timetable.location || '',
                day: timetable.day || '',
                startTime: formatTimeForInput(timetable.startTime) || '',
                endTime: formatTimeForInput(timetable.endTime) || '',
                type: timetable.type || '',
            });
        }
    }, [timetable, groups]); // Add groups dependency


    // Validation rules based on Timetables.js model
    const validateField = (name, value) => {
        let error = '';
        switch (name) {
            case 'faculty': if (!value) error = 'Please select a faculty'; break;
            case 'batch': if (!value) error = 'Please select a batch'; break;
            case 'year': if (!value || isNaN(value)) error = 'Year is required and must be a number'; break; // Validate year
            case 'semester': if (!value || isNaN(value)) error = 'Semester is required and must be a number'; break; // Validate semester
            case 'group': if (!value) error = 'Please select a group'; break;
            case 'module': if (!value) error = 'Please select a module'; break;
            case 'lecturer': if (!value) error = 'Please select a lecturer'; break;
            case 'location': if (!value) error = 'Please select a location'; break;
            case 'day': if (!value) error = 'Please select a day'; break;
            case 'startTime': if (!value) error = 'Start time is required'; break;
            case 'endTime':
                if (!value) error = 'End time is required';
                else if (formData.startTime && value <= formData.startTime) {
                    error = 'End time must be after start time';
                }
                break;
            case 'type': if (!value) error = 'Please select a session type'; break;
            default: break;
        }
        return error;
    };


    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        let updatedFormData = { ...formData, [name]: value };

        // If group changes, try to update year and semester automatically
        if (name === 'group') {
            const selectedGroup = groups.find(g => g._id === value);
            if (selectedGroup) {
                updatedFormData = {
                    ...updatedFormData,
                    year: selectedGroup.year || '', // Update year based on selected group
                    semester: selectedGroup.semester || '', // Update semester based on selected group
                };
                // Clear potential errors for year/semester as they are auto-filled
                 setErrors(prev => ({ ...prev, year: '', semester: '' }));
            } else {
                 updatedFormData = { ...updatedFormData, year: '', semester: ''}; // Clear if group is invalid/unselected
            }
        }

        setFormData(updatedFormData);

        // Validate the changed field
        const error = validateField(name, value);
        let errorsUpdate = { ...errors, [name]: error };

        // Special validation for endTime related to startTime
        if (name === 'startTime' && updatedFormData.endTime) {
            const endTimeError = validateField('endTime', updatedFormData.endTime);
            errorsUpdate = { ...errorsUpdate, endTime: endTimeError };
        }
        if (name === 'endTime') {
             const endTimeError = validateField('endTime', value);
             errorsUpdate = { ...errorsUpdate, endTime: endTimeError };
        }
        // Also validate auto-filled year/semester if group changed
         if (name === 'group') {
            const yearError = validateField('year', updatedFormData.year);
            const semesterError = validateField('semester', updatedFormData.semester);
            errorsUpdate = { ...errorsUpdate, year: yearError, semester: semesterError };
        }

        setErrors(errorsUpdate);
    };


    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const newErrors = {};
        // Validate all fields in formData
        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) newErrors[key] = error;
        });

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            try {
                 // Construct payload matching the backend schema
                 const payload = {
                    faculty: formData.faculty,
                    batch: formData.batch,
                    year: formData.year, // Send year
                    semester: formData.semester, // Send semester
                    group: formData.group,
                    module: formData.module,
                    lecturer: formData.lecturer,
                    location: formData.location,
                    day: formData.day,
                    startTime: formData.startTime, // Send in HH:mm format
                    endTime: formData.endTime, // Send in HH:mm format
                    type: formData.type,
                };
                await onUpdate(timetable._id, payload); // Pass the timetable._id and updated payload
                onClose(); // Close modal on success
                 // No need for success Swal here, handled in Timetable.jsx
            } catch (error) {
                console.error('Error updating timetable:', error);
                 // Show error Swal here maybe, although it's also handled in Timetable.jsx
                 await Swal.fire({
                    icon: 'error',
                    title: 'Update Failed',
                    text: error.message || 'Failed to update timetable. Please try again.', // Use error message if available
                    confirmButtonColor: '#ef4444',
                    width: 400,
                });
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
                <form className="admin-form" onSubmit={handleSubmit}>
                    <div className="admin-form-grid">
                        {/* Faculty Dropdown */}
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
                                {faculties.map(faculty => (
                                    <option key={faculty._id} value={faculty._id}>{faculty.facultyName}</option>
                                ))}
                            </select>
                            {errors.faculty && <span className="admin-error-message">{errors.faculty}</span>}
                        </div>
                        {/* Batch Dropdown */}
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
                                {batches.map(batch => (
                                    <option key={batch._id} value={batch._id}>{batch.batchType}</option>
                                ))}
                            </select>
                            {errors.batch && <span className="admin-error-message">{errors.batch}</span>}
                        </div>
                         {/* Group Dropdown */}
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
                         {/* Year Input (Potentially ReadOnly or derived) */}
                         <div>
                            <label className="admin-label">Year</label>
                            <input
                                type="number" // Use number type
                                name="year"
                                value={formData.year}
                                onChange={handleChange}
                                className={errors.year ? 'admin-input admin-error' : 'admin-input'}
                                placeholder="Year (e.g., 1)"
                                required
                                readOnly // Make read-only if derived from group
                            />
                            {errors.year && <span className="admin-error-message">{errors.year}</span>}
                        </div>
                         {/* Semester Input (Potentially ReadOnly or derived) */}
                        <div>
                            <label className="admin-label">Semester</label>
                            <input
                                type="number" // Use number type
                                name="semester"
                                value={formData.semester}
                                onChange={handleChange}
                                className={errors.semester ? 'admin-input admin-error' : 'admin-input'}
                                placeholder="Semester (e.g., 1)"
                                required
                                readOnly // Make read-only if derived from group
                            />
                            {errors.semester && <span className="admin-error-message">{errors.semester}</span>}
                        </div>
                         {/* Module Dropdown */}
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
                                {modules.map(module => (
                                    <option key={module._id} value={module._id}>{module.moduleName} ({module.moduleCode})</option>
                                ))}
                            </select>
                            {errors.module && <span className="admin-error-message">{errors.module}</span>}
                        </div>
                        {/* Lecturer Dropdown */}
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
                                {lecturers.map(lecturer => (
                                    <option key={lecturer._id} value={lecturer._id}>{lecturer.lecturerName}</option>
                                ))}
                            </select>
                            {errors.lecturer && <span className="admin-error-message">{errors.lecturer}</span>}
                        </div>
                        {/* Location Dropdown */}
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
                                {locations.map(location => (
                                    <option key={location._id} value={location._id}>{location.locationName} ({location.locationCode})</option>
                                ))}
                            </select>
                            {errors.location && <span className="admin-error-message">{errors.location}</span>}
                        </div>
                        {/* Day of Week Dropdown */}
                        <div>
                            <label className="admin-label">Day of Week</label>
                            <select
                                name="day" // Changed name to 'day'
                                value={formData.day} // Changed value binding
                                onChange={handleChange}
                                className={errors.day ? 'admin-select admin-error' : 'admin-select'} // Changed error check
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
                        {/* Start Time Input */}
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
                        {/* End Time Input */}
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
                         {/* Session Type Dropdown */}
                        <div>
                            <label className="admin-label">Session Type</label>
                            <select
                                name="type" // Changed name to 'type'
                                value={formData.type} // Changed value binding
                                onChange={handleChange}
                                className={errors.type ? 'admin-select admin-error' : 'admin-select'} // Changed error check
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
                    {/* Removed Notes Section */}
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
