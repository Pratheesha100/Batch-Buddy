import React, { useState, useEffect } from 'react';
import "./shared.css";

function UpdateEvent({ event, onClose, onUpdate }) {
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
    const [isLoading, setIsLoading] = useState(false);

    // Fetch faculties
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

    // Populate form data when event changes
    useEffect(() => {
        if (event) {
            setIsLoading(true);
            // Format the date for the date input (YYYY-MM-DD)
            const formattedDate = event.eventDate 
                ? new Date(event.eventDate).toISOString().split('T')[0] 
                : '';
                
            // Convert time to 24-hour format if needed
            let formattedTime = '';
            if (event.time) {
                // Check if time is in 12-hour format (contains AM/PM)
                if (event.time.includes('AM') || event.time.includes('PM')) {
                    const timeParts = event.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
                    if (timeParts) {
                        let hours = parseInt(timeParts[1]);
                        const minutes = timeParts[2];
                        const period = timeParts[3].toUpperCase();
                        
                        // Convert to 24-hour format
                        if (period === 'PM' && hours < 12) hours += 12;
                        if (period === 'AM' && hours === 12) hours = 0;
                        
                        // Format as HH:MM
                        formattedTime = `${hours.toString().padStart(2, '0')}:${minutes}`;
                    }
                } else {
                    // Already in correct format or another format
                    formattedTime = event.time;
                }
            }
                
            setFormData({
                eventName: event.eventName || '',
                eventDescription: event.eventDescription || '',
                eventDate: formattedDate,
                time: formattedTime,
                location: event.location || '',
                faculty: event.faculty?._id || event.faculty || ''
            });
            setIsLoading(false);
        }
    }, [event]);

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
                }
                break;

            case 'eventDescription':
                if (!value.trim()) {
                    error = 'Description is required';
                } else if (value.length < 10) {
                    error = 'Description must be at least 10 characters';
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
                const updatedEventData = {
                    eventName: formData.eventName,
                    eventDescription: formData.eventDescription,
                    eventDate: formData.eventDate,
                    time: formData.time,
                    location: formData.location,
                    faculty: formData.faculty
                };
                
                await onUpdate(event._id, updatedEventData);
                onClose();
            } catch (error) {
                console.error('Error updating event:', error);
            }
        }

        setIsSubmitting(false);
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="admin-modal-overlay">
            <div className="admin-modal-content-container">
                <div className="admin-form-name-container">
                    <h2>Update Event Details</h2>
                    <p>Modify the details of the selected event</p>
                </div>
                <form className="admin-form" onSubmit={handleSubmit}>
                    <div className="admin-form-grid">
                        <div>
                            <label className="admin-label">Event Name</label>
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
                                    <option key={faculty._id} value={faculty._id}>
                                        {faculty.facultyName}
                                    </option>
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
                                className={errors.eventDate ? 'admin-input admin-error' : 'admin-input'}
                                required
                            />
                            {errors.eventDate && <span className="admin-error-message">{errors.eventDate}</span>}
                        </div>
                        <div>
                            <label className="admin-label">Time</label>
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
                            <label className="admin-label">Location</label>
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
                        <label className="admin-label">Description</label>
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
                            {isSubmitting ? 'Saving...' : 'Update Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UpdateEvent;