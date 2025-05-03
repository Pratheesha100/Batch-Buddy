import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reminderApi } from '../services/api';

function EditReminder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reminder, setReminder] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    priority: 'medium',
    category: '',
    notificationTypes: {
      sound: false,
      push: false
    },
    notifyBefore: 15,
    repeat: 'never',
    status: 'pending',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReminder = async () => {
      try {
        const data = await reminderApi.getReminderById(id);
        setReminder({
          ...data,
          date: new Date(data.date).toISOString().split('T')[0]
        });
        setError(null);
      } catch (err) {
        setError('Failed to load reminder details. Please try again later.');
        console.error('Error fetching reminder:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReminder();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await reminderApi.updateReminder(id, reminder);
      navigate(`/reminders/${id}`);
    } catch (err) {
      setError('Failed to update reminder. Please try again later.');
      console.error('Error updating reminder:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('notificationTypes.')) {
      const notificationType = name.split('.')[1];
      setReminder(prev => ({
        ...prev,
        notificationTypes: {
          ...prev.notificationTypes,
          [notificationType]: checked
        }
      }));
    } else {
      setReminder(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <i className="fas fa-exclamation-circle text-red-400 text-xl"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Edit Reminder
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Update your reminder details
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-8 sm:p-10">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-heading text-gray-400"></i>
                    </div>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={reminder.title}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter reminder title"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 pt-2 flex items-start pointer-events-none">
                      <i className="fas fa-align-left text-gray-400"></i>
                    </div>
                    <textarea
                      id="description"
                      name="description"
                      value={reminder.description}
                      onChange={handleChange}
                      rows={3}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter reminder description"
                    />
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                    Date
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="far fa-calendar text-gray-400"></i>
                    </div>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={reminder.date}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                    Time
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="far fa-clock text-gray-400"></i>
                    </div>
                    <input
                      type="time"
                      id="time"
                      name="time"
                      value={reminder.time}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Priority & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                    Priority
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-flag text-gray-400"></i>
                    </div>
                    <select
                      id="priority"
                      name="priority"
                      value={reminder.priority}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-tag text-gray-400"></i>
                    </div>
                    <input
                      type="text"
                      id="category"
                      name="category"
                      value={reminder.category}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter category"
                    />
                  </div>
                </div>
              </div>

              {/* Notification Types */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Types</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="relative flex items-center p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-blue-50 transition-colors duration-200">
                    <input
                      type="checkbox"
                      id="sound"
                      name="notificationTypes.sound"
                      checked={reminder.notificationTypes.sound}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="ml-3">
                      <span className="block text-sm font-medium text-gray-900">Sound</span>
                      <span className="block text-xs text-gray-500">Play sound alert</span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <i className="fas fa-volume-up text-gray-400"></i>
                    </div>
                  </label>

                  <label className="relative flex items-center p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-blue-50 transition-colors duration-200">
                    <input
                      type="checkbox"
                      id="push"
                      name="notificationTypes.push"
                      checked={reminder.notificationTypes.push}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="ml-3">
                      <span className="block text-sm font-medium text-gray-900">Push</span>
                      <span className="block text-xs text-gray-500">Browser notifications</span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <i className="fas fa-bell text-gray-400"></i>
                    </div>
                  </label>
                </div>
              </div>

              {/* Notify Before & Repeat */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="notifyBefore" className="block text-sm font-medium text-gray-700">
                    Notify Before
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-clock text-gray-400"></i>
                    </div>
                    <select
                      id="notifyBefore"
                      name="notifyBefore"
                      value={reminder.notifyBefore}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value={1440}>1 day</option>
                      <option value={120}>2 hours</option>
                      <option value={60}>1 hour</option>
                      <option value={30}>30 minutes</option>
                      <option value={15}>15 minutes</option>
                      <option value={5}>5 minutes</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="repeat" className="block text-sm font-medium text-gray-700">
                    Repeat
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-redo text-gray-400"></i>
                    </div>
                    <select
                      id="repeat"
                      name="repeat"
                      value={reminder.repeat}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="never">Never</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 pt-2 flex items-start pointer-events-none">
                    <i className="fas fa-sticky-note text-gray-400"></i>
                  </div>
                  <textarea
                    id="notes"
                    name="notes"
                    value={reminder.notes}
                    onChange={handleChange}
                    rows={3}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Add any additional notes"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-check-circle text-gray-400"></i>
                  </div>
                  <select
                    id="status"
                    name="status"
                    value={reminder.status}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate(`/reminders/${id}`)}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <i className="fas fa-times mr-2"></i>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <i className="fas fa-save mr-2"></i>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditReminder; 