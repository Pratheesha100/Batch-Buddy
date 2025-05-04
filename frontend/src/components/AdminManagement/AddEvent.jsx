import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import "./shared.css";

function AddEvent({ onClose, onEventAdded }) {
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

    const [formData, setFormData] = useState({
        eventName: '',
        eventDescription: '',
        eventDate: '',
        time: '',
        location: '',
        faculty: ''
    });

    const [faculties, setFaculties] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch faculties for dropdown
    useEffect(() => {
        const fetchFaculties = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/admin/getFaculties');
                if (response.ok) {
                    const data = await response.json();
                    setFaculties(data);
                }
            } catch (error) {
                console.error('Error fetching faculties:', error);
            }
        };
        fetchFaculties();
    }, []);

    // Validation rules
    const validateField = (name, value) => {
        let error = '';
        switch (name) {
            case 'eventName':
                if (!value.trim()) {
                    error = 'Event name is required';
                } else if (value.length < 3) {
                    error = 'Event name must be at least 3 characters';
                } else if (value.length > 100) {
                    error = 'Event name must not exceed 100 characters';
                }
                break;
            case 'faculty':
                if (!value) {
                    error = 'Please select a faculty';
                }
                break;
            case 'eventDate':
                if (!value) {
                    error = 'Date is required';
                } else {
                    const selectedDate = new Date(value);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (selectedDate < today) {
                        error = 'Date cannot be in the past';
                    }
                }
                break;
            case 'time':
                if (!value) {
                    error = 'Time is required';
                }
                break;
            case 'location':
                if (!value.trim()) {
                    error = 'Location is required';
                } else if (value.length < 5) {
                    error = 'Location must be at least 5 characters';
                }
                break;
            case 'eventDescription':
                if (!value.trim()) {
                    error = 'Description is required';
                } else if (value.length < 10) {
                    error = 'Description must be at least 10 characters';
                } else if (value.length > 500) {
                    error = 'Description must not exceed 500 characters';
                }
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
        if (Object.keys(newErrors).length === 0) {
            try {
                const eventData = {
                    eventName: formData.eventName,
                    eventDescription: formData.eventDescription,
                    eventDate: formData.eventDate,
                    time: formData.time,
                    location: formData.location,
                    faculty: formData.faculty
                };
                const res = await fetch('http://localhost:5000/api/admin/addEvents', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(eventData)
                });
                if (!res.ok) throw new Error('Failed to create event');
                if (onEventAdded) onEventAdded();
                onClose();
                await Swal.fire({
                    icon: 'success',
                    title: 'Event Created',
                    text: 'The event was created successfully.',
                    confirmButtonColor: '#2563eb',
                    width: 400,
                });
            } catch (error) {
                console.error('Error submitting form:', error);
                await Swal.fire({
                    icon: 'error',
                    title: 'Create Failed',
                    text: 'Failed to create event. Please try again.',
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
                    <h2>Add Event Details</h2>
                    <p>Fill in the details to create a new event entry</p>
                </div>
                <form className="admin-event-form" onSubmit={handleSubmit}>
                    <div className="admin-form-grid">
                        <div>
                            <label className="admin-label">Event Name </label>
                            <input 
                                type="text" 
                                name="eventName"
                                value={formData.eventName}
                                onChange={handleChange}
                                className={errors.eventName ? 'admin-input admin-error' : 'admin-input'}
                                placeholder="Enter event name"
                                required
                            />
                            {errors.eventName && <span className="admin-error-message">{errors.eventName}</span>}
                        </div>
                        <div>
                            <label className="admin-label">Faculty </label>
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
                            <label className="admin-label">Date</label>
                            <input 
                                type="date" 
                                name="eventDate"
                                value={formData.eventDate}
                                onChange={handleChange}
                                min={today}
                                className={errors.eventDate ? 'admin-input admin-error' : 'admin-input'}
                                required
                            />
                            {errors.eventDate && <span className="admin-error-message">{errors.eventDate}</span>}
                        </div>
                        <div>
                            <label className="admin-label">Time </label>
                            <input 
                                type="time" 
                                name="time"
                                value={formData.time}
                                onChange={handleChange}
                                className={errors.time ? 'admin-input admin-error' : 'admin-input'}
                                required
                            />
                            {errors.time && <span className="admin-error-message">{errors.time}</span>}
                        </div>
                        <div>
                            <label className="admin-label">Location </label>
                            <input 
                                type="text" 
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className={errors.location ? 'admin-input admin-error' : 'admin-input'}
                                placeholder="Enter location"
                                required
                            />
                            {errors.location && <span className="admin-error-message">{errors.location}</span>}
                        </div>
                    </div>
                    <div className="admin-note-container">
                        <label className="admin-label">Description </label>
                        <textarea 
                            name="eventDescription"
                            value={formData.eventDescription}
                            onChange={handleChange}
                            placeholder="Enter a description (minimum 10 characters)"
                            className={errors.eventDescription ? 'admin-textarea admin-error' : 'admin-textarea'}
                            required
                        ></textarea>
                        {errors.eventDescription && <span className="admin-error-message">{errors.eventDescription}</span>}
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
                            {isSubmitting ? 'Saving...' : 'Save Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddEvent;