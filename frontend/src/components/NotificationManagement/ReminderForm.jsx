import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ReminderForm = ({ onSave, onClose, initialData = {} }) => {
  // Format date for the form input (YYYY-MM-DD)
  const formatDateForInput = (dateValue) => {
    if (!dateValue) return '';
    
    try {
      // Handle different date formats
      let dateObj;
      if (typeof dateValue === 'string') {
        if (dateValue.includes('T')) {
          // Handle ISO string
          dateObj = new Date(dateValue);
        } else if (dateValue.includes('-')) {
          // Handle YYYY-MM-DD
          const [year, month, day] = dateValue.split('-').map(Number);
          dateObj = new Date(year, month - 1, day);
        } else if (dateValue.includes('/')) {
          // Handle MM/DD/YYYY
          const [month, day, year] = dateValue.split('/').map(Number);
          dateObj = new Date(year, month - 1, day);
        } else {
          dateObj = new Date(dateValue);
        }
      } else {
        dateObj = new Date(dateValue);
      }
      
      // Check if valid date
      if (isNaN(dateObj.getTime())) return '';
      
      // Format as YYYY-MM-DD
      return dateObj.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };
  
  // Process initial form data with proper date formatting
  const processedInitialData = {
    ...initialData,
    date: formatDateForInput(initialData.date)
  };
  
  console.log('Initial data:', initialData);
  console.log('Processed initial data:', processedInitialData);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    priority: 'medium',
    ...processedInitialData
  });
  const [errors, setErrors] = useState({});
  const [repeat, setRepeat] = useState('none');
  const [labels, setLabels] = useState([]);

  useEffect(() => {
    // Set default time to 30 minutes from now if no initial data
    if (!initialData.time) {
      const now = new Date();
      now.setMinutes(now.getMinutes() + 30);
      const timeString = now.toTimeString().substring(0, 5);
      
      setFormData(prev => ({
        ...prev,
        date: prev.date || new Date().toISOString().split('T')[0],
        time: prev.time || timeString
      }));
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};
    const now = new Date();
    
    // Validate title (not empty and not just whitespace)
    if (!formData.title || formData.title.trim() === '') {
      newErrors.title = 'Title is required';
    }
    
    // Validate description (not empty and not just whitespace)
    if (!formData.description || formData.description.trim() === '') {
      newErrors.description = 'Description is required';
    }
    
    // Validate date and time
    if (formData.date && formData.time) {
      const selectedDateTime = new Date(`${formData.date}T${formData.time}`);
      
      if (selectedDateTime < now) {
        newErrors.dateTime = 'Date and time must be in the future';
      }
    } else {
      if (!formData.date) newErrors.date = 'Date is required';
      if (!formData.time) newErrors.time = 'Time is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      onSave({ ...formData, repeat, labels });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Close"
        >
          <X size={24} />
        </button>
        
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            {initialData._id ? 'Edit Reminder' : 'Add New Reminder'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                required
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                required
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-3 py-2 border ${
                    errors.date || errors.dateTime ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                  required
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.date}</p>
                )}
              </div>
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Time *
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.time || errors.dateTime ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                  required
                />
                {(errors.time || (errors.dateTime && !errors.date && !errors.time)) && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.time || errors.dateTime}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="repeat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Repeat
              </label>
              <select
                id="repeat"
                name="repeat"
                value={repeat}
                onChange={(e) => setRepeat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="none">None</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label htmlFor="labels" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Labels/Categories
              </label>
              <input
                type="text"
                id="labels"
                name="labels"
                value={labels.join(', ')}
                onChange={(e) => setLabels(e.target.value.split(',').map(label => label.trim()))}
                placeholder="Enter labels separated by commas"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {initialData._id ? 'Update Reminder' : 'Create Reminder'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReminderForm;
