import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2'; // Import Swal if needed for feedback
import "./shared.css";

function UpdateReschedule({ schedule, onClose, onUpdate }) {
    // State for dropdown data
    const [faculties, setFaculties] = useState([]);
    const [batches, setBatches] = useState([]);
    const [modules, setModules] = useState([]); // Renamed 'course' to 'module' for consistency
    const [groups, setGroups] = useState([]);
    const [locations, setLocations] = useState([]);
    const [lecturers, setLecturers] = useState([]);

    const [formData, setFormData] = useState({
        faculty: '',
        batch: '',
        year: '',
        group: '',
        module: '', // Renamed from course
        lecturer: '',
        oldDate: '', // Added oldDate
        newDate: '', // Renamed from date
        startTime: '', // Renamed from oldTime
        endTime: '',   // Renamed from newTime
        location: '',
        type: '',     // Added type
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

    // Initialize form data when schedule prop changes
    useEffect(() => {
        if (schedule) {
            setFormData({
                faculty: schedule.faculty?._id || schedule.faculty || '',
                batch: schedule.batch?._id || schedule.batch || '',
                year: schedule.year || '',
                group: schedule.group?._id || schedule.group || '',
                module: schedule.module?._id || schedule.module || '', // Use module
                lecturer: schedule.lecturer?._id || schedule.lecturer || '',
                oldDate: schedule.oldDate ? new Date(schedule.oldDate).toISOString().split('T')[0] : '', // Add oldDate
                newDate: schedule.newDate ? new Date(schedule.newDate).toISOString().split('T')[0] : '', // Use newDate
                startTime: schedule.startTime || '', // Use startTime
                endTime: schedule.endTime || '',   // Use endTime
                location: schedule.location?._id || schedule.location || '',
                type: schedule.type || '',         // Add type
            });
        }
    }, [schedule]);

    // Validation rules (Update as needed based on new fields)
    const validateField = (name, value) => {
        let error = '';
        // Add/Update validation rules for module, oldDate, newDate, startTime, endTime, type
        switch (name) {
            case 'faculty': if (!value) error = 'Please select a faculty'; break;
            case 'batch': if (!value) error = 'Please select a batch'; break;
            case 'year': if (!value) error = 'Please select a year'; break;
            case 'group': if (!value) error = 'Please select a group'; break;
            case 'module': if (!value) error = 'Please select a module'; break;
            case 'lecturer': if (!value) error = 'Please select a lecturer'; break;
            case 'oldDate': if (!value) error = 'Please select the original date'; break;
            case 'newDate': if (!value) error = 'Please select the new date'; break;
            case 'startTime': if (!value) error = 'Please select the start time'; break;
            case 'endTime':
                if (!value) error = 'Please select the end time';
                else if (formData.startTime && value <= formData.startTime) {
                    error = 'End time must be after start time';
                }
                break;
            case 'location': if (!value) error = 'Please select a location'; break;
            case 'type': if (!value) error = 'Please select a session type'; break;
            default: break;
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

        let error = validateField(name, value);
        // Re-validate endTime if startTime changes
        if (name === 'startTime' && formData.endTime) {
             const endTimeError = validateField('endTime', formData.endTime);
             setErrors(prev => ({...prev, endTime: endTimeError}));
        }
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const newErrors = {};
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
                    year: formData.year,
                    group: formData.group,
                    module: formData.module,
                    lecturer: formData.lecturer,
                    oldDate: formData.oldDate,
                    newDate: formData.newDate,
                    startTime: formData.startTime,
                    endTime: formData.endTime,
                    location: formData.location,
                    type: formData.type,
                };
                await onUpdate(schedule._id, payload); // Pass the updated payload
                onClose();
            } catch (error) {
                console.error('Error updating schedule:', error);
                // Optionally show error Swal
                await Swal.fire({
                    icon: 'error',
                    title: 'Update Failed',
                    text: 'Failed to update reschedule. Please try again.',
                    confirmButtonColor: '#ef4444',
                    width: 400,
                });
            }
        }
        setIsSubmitting(false);
    };

    // Get today's date for min attribute
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="admin-modal-overlay">
            <div className="admin-modal-content-container">
                <div className="admin-form-name-container">
                    <h2>Update Reschedule Details</h2>
                    <p>Update the details for the rescheduled lecture</p>
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
                         {/* Year Dropdown */}
                        <div>
                            <label className="admin-label">Year</label>
                             <select
                                name="year"
                                value={formData.year}
                                onChange={handleChange}
                                className={errors.year ? 'admin-select admin-error' : 'admin-select'}
                                required
                             >
                                <option value="">Select Year</option>
                                <option value="Y1S1">Year 1 Semester 1</option>
                                <option value="Y1S2">Year 1 Semester 2</option>
                                <option value="Y2S1">Year 2 Semester 1</option>
                                <option value="Y2S2">Year 2 Semester 2</option>
                                <option value="Y3S1">Year 3 Semester 1</option>
                                <option value="Y3S2">Year 3 Semester 2</option>
                                <option value="Y4S1">Year 4 Semester 1</option>
                                <option value="Y4S2">Year 4 Semester 2</option>
                            </select>
                            {errors.year && <span className="admin-error-message">{errors.year}</span>}
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
                                {groups.map(group => (
                                    <option key={group._id} value={group._id}>{group.groupNum}</option>
                                ))}
                            </select>
                            {errors.group && <span className="admin-error-message">{errors.group}</span>}
                        </div>
                        {/* Module (Course) Dropdown */}
                        <div>
                            <label className="admin-label">Module</label> {/* Changed label */}
                            <select
                                name="module" // Changed name
                                value={formData.module} // Changed value binding
                                onChange={handleChange}
                                className={errors.module ? 'admin-select admin-error' : 'admin-select'} // Changed error check
                                required
                            >
                                <option value="">Select Module</option>
                                {modules.map(module => (
                                    <option key={module._id} value={module._id}>{module.moduleName} ({module.moduleCode})</option>
                                ))}
                            </select>
                            {errors.module && <span className="admin-error-message">{errors.module}</span>} {/* Changed error check */}
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
                         {/* Old Date Input */}
                        <div>
                            <label className="admin-label">Old Date</label>
                            <input
                                type="date"
                                name="oldDate"
                                value={formData.oldDate}
                                onChange={handleChange}
                                className={errors.oldDate ? 'admin-input admin-error' : 'admin-input'}
                                max={formData.newDate || undefined} // Old date can't be after new date
                                required
                            />
                            {errors.oldDate && <span className="admin-error-message">{errors.oldDate}</span>}
                        </div>
                        {/* New Date Input */}
                        <div>
                            <label className="admin-label">New Date</label>
                            <input
                                type="date"
                                name="newDate"
                                value={formData.newDate}
                                onChange={handleChange}
                                className={errors.newDate ? 'admin-input admin-error' : 'admin-input'}
                                min={formData.oldDate || today} // New date must be after old date or today
                                required
                            />
                            {errors.newDate && <span className="admin-error-message">{errors.newDate}</span>}
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
                         {/* Session Type Dropdown */}
                        <div>
                            <label className="admin-label">Session Type</label>
                             <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className={errors.type ? 'admin-select admin-error' : 'admin-select'}
                                required
                             >
                                <option value="">Select Type</option>
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
                            {isSubmitting ? 'Updating...' : 'Update Schedule'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UpdateReschedule; 