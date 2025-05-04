import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import "./shared.css";

function AddReschedule({ onClose, onRescheduleAdded }) {
    // Lock body scroll and compensate for scrollbar width when modal is open
    useEffect(() => {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        };
    }, []);

    // Dropdown data
    const [faculties, setFaculties] = useState([]);
    const [batches, setBatches] = useState([]);
    const [modules, setModules] = useState([]);
    const [groups, setGroups] = useState([]);
    const [locations, setLocations] = useState([]);
    const [lecturers, setLecturers] = useState([]);

    useEffect(() => {
        // Fetch all dropdown data in parallel
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
                const fetchedGroups = groupRes.ok ? await groupRes.json() : [];
                setFaculties(facRes.ok ? await facRes.json() : []);
                setBatches(batchRes.ok ? await batchRes.json() : []);
                setModules(modRes.ok ? await modRes.json() : []);
                setGroups(fetchedGroups);
                console.log('Fetched groups for dropdown:', fetchedGroups);
                setLocations(locRes.ok ? await locRes.json() : []);
                setLecturers(lecRes.ok ? await lecRes.json() : []);
            } catch (err) {
                console.error("Error fetching dropdowns:", err);
            }
        };
        fetchDropdowns();
    }, []);

    const [formData, setFormData] = useState({
        module: '',
        oldDate: '',
        newDate: '',
        startTime: '',
        endTime: '',
        location: '',
        lecturer: '',
        year: '',
        group: '',
        batch: '',
        faculty: '',
        type: '',
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Validation rules
    const validateField = (name, value) => {
        let error = '';
        switch (name) {
            case 'module':
                if (!value) error = 'Please select a module';
                break;
            case 'oldDate':
                if (!value) error = 'Please select the original date';
                break;
            case 'newDate':
                if (!value) error = 'Please select the new date';
                break;
            case 'startTime':
                if (!value) error = 'Please select the start time';
                break;
            case 'endTime':
                if (!value) error = 'Please select the end time';
                break;
            case 'location':
                if (!value) error = 'Please select a location';
                break;
            case 'lecturer':
                if (!value) error = 'Please select a lecturer';
                break;
            case 'year':
                if (!value) error = 'Please select a year';
                break;
            case 'group':
                if (!value) error = 'Please select a group';
                break;
            case 'batch':
                if (!value) error = 'Please select a batch';
                break;
            case 'faculty':
                if (!value) error = 'Please select a faculty';
                break;
            case 'type':
                if (!value) error = 'Please select a session type';
                break;
            default:
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
        let error = validateField(name, value);
        // Additional validation for endTime
        if (name === 'endTime' || (name === 'startTime' && formData.endTime)) {
            const start = name === 'startTime' ? value : formData.startTime;
            const end = name === 'endTime' ? value : formData.endTime;
            if (start && end && end <= start) {
                error = 'End time must be after start time';
            }
        }
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    // Get the selected group's year
    const selectedGroup = groups.find(g => g._id === formData.group);
    const groupYear = selectedGroup ? selectedGroup.year : '';

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Validate all fields
        const newErrors = {};
        Object.keys(formData).forEach(key => {
            let error = validateField(key, formData[key]);
            // Additional validation for endTime
            if (key === 'endTime') {
                const start = formData.startTime;
                const end = formData.endTime;
                if (start && end && end <= start) {
                    error = 'End time must be after start time';
                }
            }
            if (error) newErrors[key] = error;
        });
        setErrors(newErrors);
        if (Object.keys(newErrors).length === 0) {
            try {
                const payload = {
                    ...formData,
                    year: groupYear,
                };
                const res = await fetch('http://localhost:5000/api/admin/addReschedules', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) throw new Error('Failed to create reschedule');
                if (onRescheduleAdded) onRescheduleAdded();
                onClose();
                await Swal.fire({
                    icon: 'success',
                    title: 'Reschedule Created',
                    text: 'The reschedule was created successfully.',
                    confirmButtonColor: '#2563eb',
                    width: 400,
                });
            } catch (error) {
                await Swal.fire({
                    icon: 'error',
                    title: 'Create Failed',
                    text: 'Failed to create reschedule. Please try again.',
                    confirmButtonColor: '#ef4444',
                    width: 400,
                });
            }
        }
        setIsSubmitting(false);
    };

    // Get today's date in YYYY-MM-DD format for date input min attribute
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="admin-modal-overlay">
            <div className="admin-modal-content-container">
                <div className="admin-form-name-container">
                    <h2>Add Reschedule Details</h2>
                    <p>Fill in the details to create a new reschedule entry</p>
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
                                {faculties.map(faculty => (
                                    <option key={faculty._id} value={faculty._id}>{faculty.facultyName}</option>
                                ))}
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
                                {batches.map(batch => (
                                    <option key={batch._id} value={batch._id}>{batch.batchType}</option>
                                ))}
                            </select>
                            {errors.batch && <span className="admin-error-message">{errors.batch}</span>}
                        </div>
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
                        <div>
                            <label className="admin-label">Old Date</label>
                            <input
                                type="date"
                                name="oldDate"
                                value={formData.oldDate}
                                onChange={handleChange}
                                className={errors.oldDate ? 'admin-input admin-error' : 'admin-input'}
                                max={formData.newDate || undefined}
                                required
                            />
                            {errors.oldDate && <span className="admin-error-message">{errors.oldDate}</span>}
                        </div>
                        <div>
                            <label className="admin-label">New Date</label>
                            <input
                                type="date"
                                name="newDate"
                                value={formData.newDate}
                                onChange={handleChange}
                                className={errors.newDate ? 'admin-input admin-error' : 'admin-input'}
                                min={formData.oldDate || today}
                                required
                            />
                            {errors.newDate && <span className="admin-error-message">{errors.newDate}</span>}
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
                            {isSubmitting ? 'Saving...' : 'Save Reschedule'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddReschedule;