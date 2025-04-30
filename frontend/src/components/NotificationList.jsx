import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reminderApi } from '../services/api';

function NotificationList() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const data = await reminderApi.getAllReminders();
      setReminders(data);
      setError(null);
    } catch (err) {
      setError('Failed to load reminders. Please try again later.');
      console.error('Error fetching reminders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (e, reminderId) => {
    e.stopPropagation(); // Prevent navigation when clicking the status button
    try {
      const reminder = reminders.find(r => r._id === reminderId);
      const newStatus = reminder.status === 'completed' ? 'pending' : 'completed';
      
      const updatedReminder = await reminderApi.updateReminderStatus(reminderId, newStatus);
      
      setReminders(reminders.map(reminder => 
        reminder._id === reminderId ? updatedReminder : reminder
      ));
    } catch (err) {
      console.error('Error updating reminder status:', err);
    }
  };

  const handleReminderClick = (reminderId) => {
    navigate(`/reminder/${reminderId}`);
  };

  const filterReminders = () => {
    return reminders
      .filter(reminder => {
        if (filter === 'all') return true;
        return reminder.status === filter;
      })
      .filter(reminder => {
        if (!searchQuery) return true;
        return reminder.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
               reminder.description?.toLowerCase().includes(searchQuery.toLowerCase());
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'date':
            return new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time);
          case 'priority':
            const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          case 'title':
            return a.title.localeCompare(b.title);
          default:
            return 0;
        }
      });
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'work':
        return 'bg-blue-100 text-blue-800';
      case 'health':
        return 'bg-green-100 text-green-800';
      case 'personal':
        return 'bg-purple-100 text-purple-800';
      case 'shopping':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {error && (
        <div className="mb-8 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-exclamation-circle text-red-400"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">My Reminders</h2>
        <button
          onClick={() => navigate('/add')}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          <i className="fas fa-plus mr-2"></i>
          Add Reminder
        </button>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fas fa-search text-gray-400"></i>
            </div>
            <input
              type="text"
              placeholder="Search reminders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200"
            />
          </div>

          <div className="flex gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="date">Sort by Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="title">Sort by Title</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filterReminders().map(reminder => (
          <div
            key={reminder._id}
            onClick={() => handleReminderClick(reminder._id)}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden cursor-pointer border border-gray-200"
          >
            <div className={`h-2 ${getPriorityColor(reminder.priority)}`} />
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{reminder.title}</h3>
                <button
                  onClick={(e) => handleStatusChange(e, reminder._id)}
                  className={`ml-2 p-1 rounded-full ${
                    reminder.status === 'completed'
                      ? 'text-green-600 hover:bg-green-50'
                      : 'text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <i className={`fas fa-check-circle ${
                    reminder.status === 'completed' ? 'text-green-600' : 'text-gray-300'
                  }`}></i>
                </button>
              </div>
              
              <p className="text-gray-600 mb-4">{reminder.description}</p>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center">
                  <i className="far fa-calendar mr-2"></i>
                  {reminder.date}
                </span>
                <span className="flex items-center">
                  <i className="far fa-clock mr-2"></i>
                  {reminder.time}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(reminder.category)}`}>
                  {reminder.category || 'No Category'}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  reminder.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {reminder.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filterReminders().length === 0 && (
        <div className="text-center py-12">
          <div className="rounded-full bg-gray-100 p-4 mx-auto w-16 h-16 flex items-center justify-center mb-4">
            <i className="fas fa-bell-slash text-gray-400 text-xl"></i>
          </div>
          <p className="text-gray-500 text-lg">No reminders found</p>
        </div>
      )}
    </div>
  );
}

export default NotificationList; 