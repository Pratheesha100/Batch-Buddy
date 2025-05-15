import { useState } from 'react';
import { Bell, Calendar, Clock, Check, Trash2, Volume2, X, Edit, Plus } from 'lucide-react';
import ReminderForm from './ReminderForm';
import { reminderService } from '../../services/reminderService';

// Helper function to format date and time
const formatDateTime = (date, time) => {
  try {
    if (!date || !time) {
      throw new Error('Missing date or time');
    }
    
    // Handle different date formats (YYYY-MM-DD or MM/DD/YYYY)
    let dateObj;
    if (date.includes('-')) {
      // Handle YYYY-MM-DD format
      const [year, month, day] = date.split('-').map(Number);
      dateObj = new Date(year, month - 1, day);
    } else if (date.includes('/')) {
      // Handle MM/DD/YYYY format
      const [month, day, year] = date.split('/').map(Number);
      dateObj = new Date(year, month - 1, day);
    } else {
      throw new Error('Invalid date format');
    }
    
    // Handle time (HH:MM or HH:MM:SS)
    const timeParts = time.split(':');
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1] || '0', 10);
    
    dateObj.setHours(hours, minutes, 0, 0);
    
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date');
    }
    
    return {
      date: dateObj.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: dateObj.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      }),
      // Add raw values for debugging
      rawDate: date,
      rawTime: time
    };
  } catch (error) {
    console.error('Error formatting date/time:', { date, time }, error);
    return {
      date: date || 'No date',
      time: time || 'No time',
      rawDate: date,
      rawTime: time
    };
  }
};

const ReminderList = ({ reminders, onReminderUpdate, onReminderDelete, onSpeak }) => {
  const [editingReminder, setEditingReminder] = useState(null);
  const [viewingReminder, setViewingReminder] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReminders = reminders.filter(reminder =>
    reminder.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reminder.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleComplete = async (id, completed) => {
    try {
      await reminderService.toggleReminder(id);
      onReminderUpdate();
    } catch (error) {
      console.error('Error toggling reminder:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      try {
        await reminderService.deleteReminder(id);
        onReminderDelete(id);
      } catch (error) {
        console.error('Error deleting reminder:', error);
      }
    }
  };

  const handleEdit = (reminder) => {
    setEditingReminder(reminder);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingReminder?._id) {
        // Handle update
        await reminderService.updateReminder(editingReminder._id, formData);
      } else {
        // Handle create
        await reminderService.createReminder(formData);
      }
      setShowForm(false);
      setEditingReminder(null);
      onReminderUpdate();
    } catch (error) {
      console.error('Error saving reminder:', error);
    }
  };

  const readReminderAloud = (reminder) => {
    const { date: dateStr, time: timeStr } = formatDateTime(reminder.date, reminder.time);
    const message = `Reminder: ${reminder.title}. ${reminder.description ? `Details: ${reminder.description}. ` : ''}Scheduled for ${dateStr} at ${timeStr}. Priority: ${reminder.priority}.`;
    onSpeak(message);
  };

  const handleViewReminder = (reminder) => {
    setViewingReminder(reminder);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewingReminder(null);
  };

  const handleSnooze = async (id) => {
    try {
      const snoozeTime = new Date();
      snoozeTime.setMinutes(snoozeTime.getMinutes() + 10); // Snooze for 10 minutes

      await reminderService.updateReminder(id, { date: snoozeTime.toISOString().split('T')[0], time: snoozeTime.toTimeString().substring(0, 5) });
      onReminderUpdate();
    } catch (error) {
      console.error('Error snoozing reminder:', error);
    }
  };

  const handleRemoveCompleted = async () => {
    try {
      const completedReminders = reminders.filter(reminder => reminder.completed);
      for (const reminder of completedReminders) {
        await reminderService.deleteReminder(reminder._id);
      }
      onReminderUpdate();
    } catch (error) {
      console.error('Error removing completed reminders:', error);
    }
  };

  if (reminders.length === 0) {
    return (
      <div className="bg-gray-50 rounded-2xl p-8 text-center border-2 border-dashed border-gray-200">
        <Bell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700">No reminders yet</h3>
        <p className="text-gray-500 mt-2">Get started by creating your first reminder</p>
        <button
          onClick={() => setShowForm(true)}
          className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition-all hover:-translate-y-0.5 hover:shadow-xl"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Reminder
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search reminders..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-5 py-3 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
        />
      </div>
      
      {filteredReminders
        .sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.time}`);
          const dateB = new Date(`${b.date}T${b.time}`);
          return dateA - dateB;
        })
        .map(reminder => (
          <div 
            key={reminder._id} 
            className="group bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 border border-gray-200 hover:border-blue-200 cursor-pointer"
            onClick={() => handleViewReminder(reminder)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <div className={`w-4 h-4 rounded-full flex-shrink-0 mt-1 ${
                    reminder.priority === 'high' ? 'bg-red-500' :
                    reminder.priority === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 text-lg">{reminder.title}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                          reminder.priority === 'high' ? 'bg-red-100 text-red-800' :
                          reminder.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {reminder.priority}
                        </span>
                        {reminder.completed && (
                          <span className="inline-flex items-center text-sm font-medium text-green-800 bg-green-100 px-3 py-1 rounded-full">
                            <Check className="w-4 h-4 mr-1" /> Done
                          </span>
                        )}
                      </div>
                    </div>

                    {reminder.description && (
                      <p className="mt-3 text-base text-gray-600 line-clamp-3">{reminder.description}</p>
                    )}
                    
                    <div className="mt-4 flex items-center text-base text-gray-500 space-x-6">
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                        <span>{
                          (() => {
                            try {
                              if (!reminder.date) return 'No date';
                              
                              let date;
                              
                              // Check if it's an ISO 8601 date string (e.g., 2025-05-14T00:00:00.000Z)
                              if (typeof reminder.date === 'string' && reminder.date.includes('T')) {
                                date = new Date(reminder.date);
                              } 
                              // Handle YYYY-MM-DD format
                              else if (reminder.date.includes('-')) {
                                const [year, month, day] = reminder.date.split('-').map(Number);
                                date = new Date(year, month - 1, day);
                              } 
                              // Handle MM/DD/YYYY format
                              else if (reminder.date.includes('/')) {
                                const [month, day, year] = reminder.date.split('/').map(Number);
                                date = new Date(year, month - 1, day);
                              } 
                              // Fallback to native parsing
                              else {
                                date = new Date(reminder.date);
                              }
                              
                              // Check if date is valid
                              if (isNaN(date.getTime())) {
                                console.error('Invalid date format:', reminder.date);
                                return 'Invalid date';
                              }
                              
                              return date.toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              });
                            } catch (e) {
                              console.error('Error formatting date:', e, 'Date value:', reminder.date);
                              return 'Date error';
                            }
                          })()
                        }</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-gray-400" />
                        <span>{
                          (() => {
                            try {
                              if (!reminder.time) return 'Time not set';
                              
                              let hours, minutes;
                              // Handle HH:MM format
                              if (reminder.time.includes(':')) {
                                [hours, minutes] = reminder.time.split(':').map(Number);
                              } 
                              // Handle HHMM format (e.g., 1430 for 2:30 PM)
                              else if (reminder.time.length === 4) {
                                hours = parseInt(reminder.time.substring(0, 2), 10);
                                minutes = parseInt(reminder.time.substring(2), 10);
                              } 
                              // Handle any other format
                              else {
                                hours = parseInt(reminder.time, 10);
                                minutes = 0;
                              }
                              
                              if (isNaN(hours) || isNaN(minutes)) {
                                console.error('Invalid time format:', reminder.time);
                                return 'Time error';
                              }
                              
                              // Create a date object with a fixed date (2000-01-01) and set the time
                              const date = new Date(2000, 0, 1, hours, minutes);
                              
                              return date.toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit',
                                hour12: true
                              });
                            } catch (e) {
                              console.error('Error formatting time:', e);
                              return 'Time error';
                            }
                          })()
                        }</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    readReminderAloud(reminder);
                  }}
                  className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Read aloud"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(reminder);
                  }}
                  className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(reminder._id);
                  }}
                  className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-6 mt-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSnooze(reminder._id);
                }}
                className="text-base text-blue-600 hover:underline"
              >
                Snooze
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleComplete(reminder._id, reminder.completed);
                }}
                className={`text-base ${reminder.completed ? 'text-green-600' : 'text-gray-600'} hover:underline`}
              >
                {reminder.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
              </button>
            </div>

            <div className="flex items-center space-x-3 mt-3">
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${reminder.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{reminder.completed ? 'Completed' : 'Pending'}</span>
              {reminder.labels && reminder.labels.map(label => (
                <span key={label} className="text-sm font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-800">{label}</span>
              ))}
            </div>
          </div>
        ))}
      
      {showForm && (
        <ReminderForm
          onSave={handleFormSubmit}
          onClose={() => {
            setShowForm(false);
            setEditingReminder(null);
          }}
          initialData={editingReminder || {}}
        />
      )}

      {/* View Reminder Modal */}
      {showViewModal && viewingReminder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-blue-700 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white">Reminder Details</h3>
              <button
                onClick={handleCloseViewModal}
                className="text-white hover:bg-white/20 p-1.5 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h4 className="text-2xl font-bold text-gray-900">{viewingReminder.title}</h4>
                {viewingReminder.description && (
                  <p className="mt-3 text-gray-600 leading-relaxed">{viewingReminder.description}</p>
                )}
              </div>
              
              <div className="bg-gray-50 rounded-xl p-5 space-y-5">
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2.5 rounded-lg text-blue-600 mr-4">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date & Time</p>
                    <div className="space-y-1">
                      <p className="text-gray-900 font-medium">
                        {(() => {
                          try {
                            const date = new Date(viewingReminder.date);
                            if (isNaN(date.getTime())) throw new Error('Invalid date');
                            
                            return date.toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            });
                          } catch (e) {
                            console.error('Error formatting date:', e);
                            return 'Date not available';
                          }
                        })()}
                        {' at '}
                        {(() => {
                          try {
                            if (!viewingReminder.time) return 'No time set';
                            
                            let hours, minutes;
                            if (viewingReminder.time.includes(':')) {
                              [hours, minutes] = viewingReminder.time.split(':').map(Number);
                            } else if (viewingReminder.time.length === 4) {
                              hours = parseInt(viewingReminder.time.substring(0, 2), 10);
                              minutes = parseInt(viewingReminder.time.substring(2), 10);
                            } else {
                              hours = parseInt(viewingReminder.time, 10) || 0;
                              minutes = 0;
                            }
                            
                            const timeDate = new Date(2000, 0, 1, hours, minutes);
                            return timeDate.toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            });
                          } catch (e) {
                            console.error('Error formatting time:', e);
                            return 'Time not available';
                          }
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-gray-100 p-2.5 rounded-lg text-gray-600 mr-4">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Priority</p>
                    <div className="flex items-center mt-1">
                      <span className={`inline-block w-2.5 h-2.5 rounded-full mr-2 ${
                        viewingReminder.priority === 'high' ? 'bg-red-500' :
                        viewingReminder.priority === 'medium' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}></span>
                      <span className="font-medium capitalize text-gray-900">
                        {viewingReminder.priority} Priority
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-gray-100 p-2.5 rounded-lg text-gray-600 mr-4">
                    {viewingReminder.completed ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className={`font-medium ${
                      viewingReminder.completed ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {viewingReminder.completed ? 'Completed' : 'Pending'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => {
                    handleDelete(viewingReminder._id);
                    handleCloseViewModal();
                  }}
                  className="px-5 py-2.5 border border-red-100 text-red-600 rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
                <button
                  onClick={() => {
                    setEditingReminder(viewingReminder);
                    setShowForm(true);
                    handleCloseViewModal();
                  }}
                  className="px-5 py-2.5 border border-blue-200 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Reminder
                </button>
                <button
                  onClick={() => handleToggleComplete(viewingReminder._id, viewingReminder.completed)}
                  className={`px-5 py-2.5 rounded-xl text-white font-medium ${
                    viewingReminder.completed 
                      ? 'bg-yellow-500 hover:bg-yellow-600' 
                      : 'bg-green-500 hover:bg-green-600'
                  } transition-colors flex items-center justify-center`}
                >
                  {viewingReminder.completed ? (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Mark Incomplete
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Mark Complete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      
    </div>
  );
};

export default ReminderList;
