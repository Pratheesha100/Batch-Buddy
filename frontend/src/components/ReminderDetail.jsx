import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reminderApi } from '../services/api';

function ReminderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reminder, setReminder] = useState(null);
  const [loading, setLoading] = useState(true); // For loading state
  const [error, setError] = useState(null); // For error state

  useEffect(() => {
    const fetchReminder = async () => {
      try {
        const data = await reminderApi.getReminderById(id);
        setReminder(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching reminder:', err);
        setError('Failed to fetch reminder. Please try again later.');
        setLoading(false);
      }
    };

    fetchReminder();
  }, [id]);

  const handleDelete = async () => {
    try {
      await reminderApi.deleteReminder(id);
      navigate('/');
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="text-center text-gray-600">Loading...</div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600">{error}</div>
    );
  }

  if (!reminder) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center">
            <button
              onClick={() => navigate('/')}
              className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            >
              <i className="fas fa-arrow-left text-gray-600"></i>
            </button>
            <h2 className="text-xl font-semibold text-gray-900">Reminder Not Found</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/')}
              className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            >
              <i className="fas fa-arrow-left text-gray-600"></i>
            </button>
            <h2 className="text-xl font-semibold text-gray-900">{reminder.title}</h2>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => navigate(`/edit/${id}`)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <i className="fas fa-edit mr-2"></i>
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <i className="fas fa-trash mr-2"></i>
              Delete
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Description Section */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">Description</h3>
            <p className="text-gray-600">{reminder.description || 'No description provided'}</p>
          </div>

          {/* Date & Time Section */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">Date & Time</h3>
            <div className="space-y-1">
              <p className="flex items-center text-gray-600">
                <i className="far fa-calendar mr-2 text-gray-400"></i>
                {reminder.date}
              </p>
              <p className="flex items-center text-gray-600">
                <i className="far fa-clock mr-2 text-gray-400"></i>
                {reminder.time}
              </p>
            </div>
          </div>

          {/* Priority & Category Section */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900">Priority</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getPriorityColor(reminder.priority)}`}>
                {reminder.priority}
              </span>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900">Category</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {reminder.category}
              </span>
            </div>
          </div>

          {/* Notification Settings Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center text-gray-600">
                <i className="fas fa-bell mr-3 text-gray-400"></i>
                <span>Reminder Type: {reminder.reminderType}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <i className="fas fa-clock mr-3 text-gray-400"></i>
                <span>Notify Before: {reminder.notifyBefore} minutes</span>
              </div>
              <div className="flex items-center text-gray-600">
                <i className="fas fa-redo mr-3 text-gray-400"></i>
                <span>Repeat: {reminder.repeat}</span>
              </div>
            </div>
          </div>

          {/* Attachments Section */}
          {reminder.attachments && reminder.attachments.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-900">Attachments</h3>
              <div className="space-y-2">
                {reminder.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <i className="fas fa-paperclip text-gray-400 mr-3"></i>
                      <span className="text-gray-600">{attachment.name}</span>
                    </div>
                    <a
                      href={attachment.url}
                      download
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <i className="fas fa-download"></i>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes Section */}
          {reminder.notes && (
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900">Notes</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600">{reminder.notes}</p>
              </div>
            </div>
          )}

          {/* Tags Section */}
          {reminder.tags && reminder.tags.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-900">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {reminder.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReminderDetail;
