import React, { useState, useEffect } from 'react';
import "./shared.css";

function UpdateEvent({ event, onClose, onUpdate }) {
    const [formData, setFormData] = useState({
        eventName: '',
        faculty: '',
        date: '',
        time: '',
        location: '',
        notes: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (event) {
            setFormData({
                eventName: event.title,
                faculty: event.faculty || '',
                date: event.date,
                time: event.time,
                location: event.location,
                notes: event.description
            });
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

            case 'date':
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

            case 'notes':
                if (!value.trim()) {
                    error = 'Description is required';
                } else if (value.length < 10) {
                    error = 'Description must be at least 10 characters';
                } else if (value.length > 500) {
                    error = 'Description must not exceed 500 characters';
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
                const updatedEvent = {
                    id: event.id,
                    title: formData.eventName,
                    faculty: formData.faculty,
                    date: formData.date,
                    time: formData.time,
                    location: formData.location,
                    description: formData.notes
                };
                onUpdate(event.id, updatedEvent);
                onClose();
            } catch (error) {
                console.error('Error updating event:', error);
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
                                <option value="computing">Computing</option>
                                <option value="engineering">Engineering</option>
                                <option value="business">Business</option>
                                <option value="humanities">Humanities</option>
                            </select>
                            {errors.faculty && <span className="admin-error-message">{errors.faculty}</span>}
                        </div>
                        <div>
                            <label className="admin-label">Date</label>
                            <input 
                                type="date" 
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                min={today}
                                className={errors.date ? 'admin-input admin-error' : 'admin-input'}
                                required
                            />
                            {errors.date && <span className="admin-error-message">{errors.date}</span>}
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
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Enter a description (minimum 10 characters)"
                            className={errors.notes ? 'admin-textarea admin-error' : 'admin-textarea'}
                            required
                        ></textarea>
                        {errors.notes && <span className="error-message">{errors.notes}</span>}
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