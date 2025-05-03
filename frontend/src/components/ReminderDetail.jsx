import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { reminderApi } from '../services/api';
import reminderService from '../services/reminderService';
import { socket } from '../services/notificationService';

function ReminderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reminder, setReminder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    fetchReminder();

    // Socket event listeners
    socket.on('reminderUpdated', (updatedReminder) => {
      if (updatedReminder._id === id) {
        setReminder(updatedReminder);
      }
    });

    socket.on('reminderDeleted', (deletedId) => {
      if (deletedId === id) {
        toast.info('This reminder has been deleted');
        navigate('/');
      }
    });

    // Cleanup
    return () => {
      socket.off('reminderUpdated');
      socket.off('reminderDeleted');
    };
  }, [id, navigate]);

  const fetchReminder = async () => {
    try {
      setLoading(true);
      const data = await reminderApi.getReminderById(id);
      setReminder(data);
      setError(null);
    } catch (err) {
      setError('Failed to load reminder details');
      console.error('Error fetching reminder:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async () => {
    try {
      await reminderService.dismissReminder(id);
      setReminder(prev => ({ ...prev, status: 'completed' }));
      setShowNotification(false);
    } catch (err) {
      console.error('Error dismissing reminder:', err);
    }
  };

  const handleEdit = () => {
    navigate(`/edit/${id}`);
  };

  // Check if reminder is due
  useEffect(() => {
    if (reminder && reminder.status === 'pending') {
      const reminderDateTime = new Date(`${reminder.date}T${reminder.time}`);
      const now = new Date();
      
      if (reminderDateTime <= now) {
        setShowNotification(true);
        reminderService.triggerReminderNotifications(reminder);
      }
    }
  }, [reminder]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      try {
        await reminderApi.deleteReminder(id);
        navigate('/');
      } catch (err) {
        setError('Failed to delete reminder. Please try again later.');
        console.error('Error deleting reminder:', err);
      }
    }
  };

  const handleStatusChange = async () => {
    try {
      const newStatus = reminder.status === 'completed' ? 'pending' : 'completed';
      console.log('Updating status to:', newStatus);
      const updatedReminder = await reminderApi.updateReminderStatus(id, newStatus);
      console.log('Updated reminder:', updatedReminder);
      setReminder(updatedReminder);
      setError(null);
    } catch (err) {
      console.error('Error updating reminder status:', err);
      setError('Failed to update reminder status. Please try again later.');
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

  if (!reminder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 text-center">
          <div className="text-6xl mb-4">
            <i className="fas fa-exclamation-circle text-gray-300"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Reminder Not Found</h2>
          <p className="text-gray-600 mb-6">The reminder you're looking for doesn't exist or has been deleted.</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {showNotification && (
          <div className="mb-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <i className="fas fa-bell text-yellow-400 text-xl"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">This reminder is due now!</p>
              </div>
              <div className="ml-auto">
                <button
                  onClick={handleDismiss}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  <i className="fas fa-check mr-2"></i>
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 sm:px-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => navigate('/')}
                  className="mr-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200"
                >
                  <i className="fas fa-arrow-left text-white"></i>
                </button>
                <h1 className="text-2xl font-bold text-white">{reminder.title}</h1>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center px-4 py-2 border border-white rounded-md text-sm font-medium text-white bg-transparent hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors duration-200"
                >
                  <i className="fas fa-edit mr-2"></i>
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                >
                  <i className="fas fa-trash mr-2"></i>
                  Delete
                </button>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 sm:p-10 space-y-8">
            {/* Description Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <i className="fas fa-align-left text-gray-400 text-xl mr-3"></i>
                <h2 className="text-lg font-medium text-gray-900">Description</h2>
              </div>
              <p className="text-gray-600 ml-8">{reminder.description || 'No description provided'}</p>
            </div>

            {/* Date & Time Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <i className="far fa-calendar text-gray-400 text-xl mr-3"></i>
                  <h2 className="text-lg font-medium text-gray-900">Date & Time</h2>
                </div>
                <div className="ml-8 space-y-2">
                  <p className="flex items-center text-gray-600">
                    <i className="far fa-calendar mr-2 text-gray-400"></i>
                    {new Date(reminder.date).toLocaleDateString()}
                  </p>
                  <p className="flex items-center text-gray-600">
                    <i className="far fa-clock mr-2 text-gray-400"></i>
                    {reminder.time}
                  </p>
                </div>
              </div>

              {/* Priority & Category Section */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <i className="fas fa-tags text-gray-400 text-xl mr-3"></i>
                  <h2 className="text-lg font-medium text-gray-900">Details</h2>
                </div>
                <div className="ml-8 space-y-4">
                  <div>
                    <span className="text-sm text-gray-500">Priority</span>
                    <span className={`block mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                      reminder.priority === 'high' ? 'bg-red-100 text-red-800' :
                      reminder.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {reminder.priority.charAt(0).toUpperCase() + reminder.priority.slice(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Category</span>
                    <span className="block mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {reminder.category || 'No Category'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Types Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <i className="fas fa-bell text-gray-400 text-xl mr-3"></i>
                <h2 className="text-lg font-medium text-gray-900">Notification Settings</h2>
              </div>
              <div className="ml-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {reminder.notificationTypes.email && (
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center">
                        <i className="fas fa-envelope text-blue-500 mr-3"></i>
                        <span className="text-sm font-medium text-gray-900">Email</span>
                      </div>
                    </div>
                  )}
                  {reminder.notificationTypes.sound && (
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center">
                        <i className="fas fa-volume-up text-green-500 mr-3"></i>
                        <span className="text-sm font-medium text-gray-900">Sound</span>
                      </div>
                    </div>
                  )}
                  {reminder.notificationTypes.push && (
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center">
                        <i className="fas fa-bell text-purple-500 mr-3"></i>
                        <span className="text-sm font-medium text-gray-900">Push</span>
                      </div>
                    </div>
                  )}
                  {!reminder.notificationTypes.email && !reminder.notificationTypes.sound && !reminder.notificationTypes.push && (
                    <div className="col-span-3 text-center text-gray-500">
                      No notifications selected
                    </div>
                  )}
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Notify Before</span>
                    <p className="mt-1 text-gray-900">
                      {reminder.notifyBefore === 1440 ? '1 day' :
                       reminder.notifyBefore === 120 ? '2 hours' :
                       reminder.notifyBefore === 60 ? '1 hour' :
                       reminder.notifyBefore === 30 ? '30 minutes' :
                       reminder.notifyBefore === 15 ? '15 minutes' :
                       reminder.notifyBefore === 5 ? '5 minutes' :
                       `${reminder.notifyBefore} minutes`}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Repeat</span>
                    <p className="mt-1 text-gray-900">
                      {reminder.repeat.charAt(0).toUpperCase() + reminder.repeat.slice(1)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <i className="fas fa-check-circle text-gray-400 text-xl mr-3"></i>
                  <h2 className="text-lg font-medium text-gray-900">Status</h2>
                </div>
                <button
                  onClick={handleStatusChange}
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                    reminder.status === 'completed' 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                  } transition-colors duration-200`}
                >
                  {reminder.status.charAt(0).toUpperCase() + reminder.status.slice(1)}
                  <i className="fas fa-sync-alt ml-2"></i>
                </button>
              </div>
            </div>

            {/* Notes Section */}
            {reminder.notes && (
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <i className="fas fa-sticky-note text-gray-400 text-xl mr-3"></i>
                  <h2 className="text-lg font-medium text-gray-900">Notes</h2>
                </div>
                <p className="text-gray-600 ml-8">{reminder.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReminderDetail;
