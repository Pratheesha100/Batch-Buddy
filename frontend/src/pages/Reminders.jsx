import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Check, Calendar } from 'lucide-react';
import ReminderList from '../components/NotificationManagement/ReminderList';
import ReminderForm from '../components/NotificationManagement/ReminderForm';
import VoiceControl from '../components/NotificationManagement/VoiceControl';
import Navbar from '../components/nav_and_Footer/Navbar';
import Footer from '../components/nav_and_Footer/Footer';
import { reminderService } from '../services/reminderService';
import { socketService } from '../services/socketService';
import { requestNotificationPermission, showNotification, speakText, isReminderDue } from '../utils/notificationUtils';

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const speakRef = useRef(null);
  
  // Define speak function first
  const speak = useCallback((text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  }, []);
  
  // Store speak in ref so it can be used in callbacks
  useEffect(() => {
    speakRef.current = speak;
  }, [speak]);
  
  // Define readUpcomingReminders function
  const readUpcomingReminders = useCallback(() => {
    const upcoming = reminders.filter(reminder => !reminder.completed);
    
    if (upcoming.length === 0) {
      speak('You have no upcoming reminders.');
      return;
    }
    
    let message = `You have ${upcoming.length} upcoming reminder${upcoming.length > 1 ? 's' : ''}. `;
    
    upcoming.forEach((reminder, index) => {
      const date = new Date(`${reminder.date}T${reminder.time}`);
      const dateStr = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      });
      message += `${index + 1}. ${reminder.title} on ${dateStr}. `;
    });
    
    speak(message);
  }, [reminders, speak]);
  
  // Parse natural language date/time
  const parseDateTime = (text) => {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    // Tomorrow
    if (text.includes('tomorrow')) {
      const date = new Date(today);
      date.setDate(date.getDate() + 1);
      return { date: date.toISOString().split('T')[0], time: '09:00' };
    }
    
    // Next week
    if (text.includes('next week')) {
      const date = new Date(today);
      date.setDate(date.getDate() + 7);
      return { date: date.toISOString().split('T')[0], time: '09:00' };
    }
    
    // Time patterns like "at 3 PM" or "at 14:30"
    const timeMatch = text.match(/at\s+(\d{1,2})(?::(\d{2}))?\s*(?:AM|PM|am|pm)?/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      
      // Convert to 24-hour format
      if (text.toLowerCase().includes('pm') && hours < 12) hours += 12;
      if (text.toLowerCase().includes('am') && hours === 12) hours = 0;
      
      const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      return { date: today.toISOString().split('T')[0], time: timeStr };
    }
    
    // Default to today at 9 AM
    return { date: today.toISOString().split('T')[0], time: '09:00' };
  };
  
  // Extract priority from text
  const getPriorityFromText = (text) => {
    if (text.includes('high') || text.includes('important') || text.includes('urgent')) return 'high';
    if (text.includes('low') || text.includes('not important')) return 'low';
    return 'medium';
  };

  // Parse reminder details from natural language
  const parseReminderDetails = (text) => {
    // Remove trigger phrases
    text = text
      .replace(/^(create|set|add|make)\s+(a\s+)?(reminder\s+)?(to\s+)?/i, '')
      .trim();
    
    // Extract date/time info
    const dateTimeInfo = parseDateTime(text);
    
    // Extract priority
    const priority = getPriorityFromText(text);
    
    // Remove time/date words to get the title
    const title = text
      .replace(/\b(tomorrow|next week|at\s+\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)?)\b/gi, '')
      .replace(/\b(high|medium|low|important|urgent)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    return {
      title: title || 'New Reminder',
      description: '',
      date: dateTimeInfo.date,
      time: dateTimeInfo.time,
      priority: priority
    };
  };

  // Handle voice commands
  const handleVoiceCommand = useCallback((command) => {
    console.log('Voice command:', command);
    
    if (command.includes('create') || command.includes('set') || command.includes('add') || command.includes('make')) {
      if (command.includes('reminder') || command.includes('remind me')) {
        try {
          const reminderData = parseReminderDetails(command);
          setEditingReminder(reminderData);
          setShowForm(true);
          speakRef.current(`Creating reminder: ${reminderData.title} for ${new Date(reminderData.date).toLocaleDateString()} at ${reminderData.time}`);
          return;
        } catch (error) {
          console.error('Error parsing reminder:', error);
          speakRef.current("I couldn't understand that. Please try again or use the form.");
          return;
        }
      }
    }
    
    if (command.includes('read') && (command.includes('reminder') || command.includes('reminders'))) {
      readUpcomingReminders();
      return;
    }
    
    if (command.includes('delete') && command.includes('reminder')) {
      // This is a placeholder - you would need to implement deletion logic
      speakRef.current("Please select a reminder to delete from the list.");
      return;
    }
    
    // If no command was recognized
    speakRef.current("I didn't understand that command. Try saying 'Create a reminder' or 'Read my reminders'.");
  }, [readUpcomingReminders]);
  
  // Initialize voice control
  const { 
    startListening, 
    speak: speakFromVoiceControl,
    MicButton, 
    VolumeButton,
    isListening: isVoiceActive
  } = VoiceControl({ 
    onCommand: handleVoiceCommand, 
    onSpeak: speak,
    isListening, 
    setIsListening 
  });

  // Track when the user is speaking
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Update speaking state when voice commands are processed
  useEffect(() => {
    if (isVoiceActive) {
      setIsSpeaking(true);
      const timer = setTimeout(() => setIsSpeaking(false), 2000); // Hide after 2 seconds
      return () => clearTimeout(timer);
    }
  }, [isVoiceActive]);

  // Fetch reminders from the server
  const fetchReminders = useCallback(async () => {
    try {
      const data = await reminderService.getReminders();
      setReminders(data);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    }
  }, []);

  // Handle reminder notifications coming from WebSocket
  const handleReminderNotification = useCallback((reminderData) => {
    console.log('Received WebSocket reminder notification:', reminderData);
    
    // Show browser notification with action buttons
    if ('Notification' in window && Notification.permission === 'granted') {
      // Create notification options
      const options = {
        body: reminderData.description || `Priority: ${reminderData.priority}`,
        tag: `reminder-${reminderData.id}`,
        data: { reminderId: reminderData.id },
        requireInteraction: true, // Notification persists until user interacts with it
        actions: [
          { action: 'complete', title: 'Complete' },
          { action: 'snooze', title: 'Snooze' }
        ]
      };
      
      // Create and show the notification
      const notification = new Notification(`Reminder: ${reminderData.title}`, options);
      
      // Handle notification click
      notification.onclick = async (event) => {
        // Focus the window
        window.focus();
        
        // Check if an action button was clicked
        if (event.action === 'complete') {
          // Mark as complete
          try {
            await reminderService.toggleReminder(reminderData.id);
            speak('Reminder marked as complete');
          } catch (error) {
            console.error('Error completing reminder:', error);
          }
        } else if (event.action === 'snooze') {
          // Snooze the reminder
          try {
            await reminderService.snoozeReminder(reminderData.id, 15);
            speak('Reminder snoozed for 15 minutes');
          } catch (error) {
            console.error('Error snoozing reminder:', error);
          }
        }
        
        notification.close();
        fetchReminders();
      };
    } else {
      // Fallback for browsers without Notification API
      console.log('Browser notifications not available or permission denied');
    }

    // Speak the reminder
    speakText(`Reminder: ${reminderData.title}. ${reminderData.description || ''} Scheduled for ${reminderData.date} at ${reminderData.time}.`);
    
    // Refresh reminders to update the UI
    fetchReminders();
  }, [fetchReminders, speak]);

  // Handle reminder snooze events
  const handleReminderSnooze = useCallback((snoozeData) => {
    console.log('Received reminder snooze event:', snoozeData);
    speak(`Reminder ${snoozeData.title} snoozed for ${snoozeData.minutes} minutes`);
    fetchReminders();
  }, [fetchReminders, speak]);
  
  // Set up WebSocket connection and notification permission on component mount
  useEffect(() => {
    // Request notification permission when component mounts
    requestNotificationPermission();
    
    // Initial fetch of reminders
    fetchReminders();
    
    // Connect to WebSocket server
    socketService.connect();
    
    // Get user ID from localStorage (should be set during login)
    const userId = localStorage.getItem('userId') || localStorage.getItem('userData')?._id;
    if (userId) {
      socketService.joinUserRoom(userId);
      console.log('Joined user room with ID:', userId);
    } else {
      console.warn('No user ID found for WebSocket room');
      // Try to get user ID from other sources
      try {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        if (userData && userData._id) {
          socketService.joinUserRoom(userData._id);
          console.log('Joined user room with ID from userData:', userData._id);
        } else if (userData && userData.user && userData.user._id) {
          socketService.joinUserRoom(userData.user._id);
          console.log('Joined user room with ID from userData.user:', userData.user._id);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    // Register for various notification events through WebSocket
    socketService.registerListener('reminder-due', handleReminderNotification);
    socketService.registerListener('reminder-snoozed', handleReminderSnooze);
    
    // Listen for custom events from the socket service for UI updates
    const handleReminderCompleted = (event) => {
      console.log('Received reminder-completed event:', event.detail);
      fetchReminders(); // Refresh the UI
      speak('Reminder completed');
    };
    
    const handleReminderSnoozed = (event) => {
      console.log('Received reminder-snoozed event:', event.detail);
      fetchReminders(); // Refresh the UI
      speak('Reminder snoozed for 15 minutes');
    };
    
    // Add event listeners for custom events
    window.addEventListener('reminder-completed', handleReminderCompleted);
    window.addEventListener('reminder-snoozed', handleReminderSnoozed);
    
    // Set up notification click handler for service worker notifications
    if ('serviceWorker' in navigator && 'Notification' in window) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'notificationclick') {
          const { action, reminderId } = event.data;
          
          if (action === 'complete') {
            reminderService.toggleReminder(reminderId);
          } else if (action === 'snooze') {
            reminderService.snoozeReminder(reminderId);
          }
          
          fetchReminders();
        }
      });
    }
    
    // Clean up on component unmount
    return () => {
      socketService.unregisterListener('reminder-due', handleReminderNotification);
      socketService.unregisterListener('reminder-snoozed', handleReminderSnooze);
      window.removeEventListener('reminder-completed', handleReminderCompleted);
      window.removeEventListener('reminder-snoozed', handleReminderSnoozed);
    };
  }, [fetchReminders, handleReminderNotification, handleReminderSnooze, speak]);

  // Handle reminder creation/update
  const handleSaveReminder = async (reminderData) => {
    try {
      if (editingReminder?._id) {
        await reminderService.updateReminder(editingReminder._id, reminderData);
        speak(`Updated reminder: ${reminderData.title}`);
      } else {
        await reminderService.createReminder(reminderData);
        speak(`Created reminder: ${reminderData.title}`);
      }
      await fetchReminders();
      setShowForm(false);
      setEditingReminder(null);
      return true;
    } catch (error) {
      console.error('Error saving reminder:', error);
      speak('Sorry, there was an error saving your reminder.');
      return false;
    }
  };

  // Handle reminder deletion
  const handleDeleteReminder = async (id) => {
    try {
      const result = await reminderService.deleteReminder(id);
      if (result.acknowledged && result.deletedCount > 0) {
        setReminders(prev => prev.filter(r => r._id !== id));
        speak('Reminder deleted');
      } else {
        console.warn('Reminder not found or already deleted.');
        setReminders(prev => prev.filter(r => r._id !== id)); // Remove from UI anyway
      }
    } catch (error) {
      console.error('Error deleting reminder:', error);
      speak('Sorry, there was an error deleting your reminder.');
    }
  };

  // Handle toggle complete
  const handleToggleComplete = async (id, completed) => {
    try {
      await reminderService.toggleReminder(id);
      setReminders(prev => 
        prev.map(r => 
          r._id === id ? { ...r, completed: !completed } : r
        )
      );
      speak(completed ? 'Marked as incomplete' : 'Marked as complete');
    } catch (error) {
      console.error('Error toggling reminder:', error);
      speak('Sorry, there was an error updating your reminder.');
    }
  };

  const handleEditReminder = (reminder) => {
    setEditingReminder(reminder);
    setShowForm(true);
  };

  const upcomingReminders = reminders.filter(reminder => !reminder.completed);
  const completedReminders = reminders.filter(reminder => reminder.completed);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar isListening={isListening} startListening={startListening} />
      
      {/* Small voice indicator in bottom right */}
      <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ease-in-out ${isSpeaking ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="bg-white rounded-full shadow-lg p-3 flex items-center space-x-2 border border-gray-200">
          <div className="relative">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-ping absolute"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <span className="text-xs font-medium text-gray-700">Listening...</span>
        </div>
      </div>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 py-12 md:py-20">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBoMXYxaC0xeiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMSIvPjwvZz48L3N2Zz4=')] opacity-20"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/10 to-transparent"></div>
          <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        </div>

        {/* Floating Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/30 rounded-full blur-3xl animate-pulse-slow mix-blend-screen"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-400/30 rounded-full blur-3xl animate-pulse-slow delay-1000 mix-blend-screen"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl animate-pulse-slow delay-2000 mix-blend-screen"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Reminders</h1>
              <p className="text-blue-100">Manage your tasks and never miss an important event</p>
            </div>
            <div className="mt-6 md:mt-0 flex space-x-4">
              <MicButton />
              
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">New Reminder</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Reminders */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Upcoming Reminders</h2>
                <div className="p-2">
                  <VolumeButton onClick={readUpcomingReminders} />
                </div>
              </div>

              <ReminderList 
                reminders={upcomingReminders} 
                onReminderUpdate={fetchReminders}
                onReminderDelete={handleDeleteReminder}
                onReminderToggle={handleToggleComplete}
                onReminderEdit={handleEditReminder}
                onSpeak={speak}
              />
            </div>
          </div>

          {/* Completed Reminders */}
          <div>
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Completed</h2>
              {completedReminders.length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <Check className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No completed reminders yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {completedReminders
                    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                    .slice(0, 5)
                    .map(reminder => (
                      <div key={reminder._id} className="bg-gray-50 rounded-xl p-4 border-l-4 border-green-500">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-800 line-through">{reminder.title}</h3>
                            <div className="mt-1 flex items-center text-sm text-gray-500">
                              <Calendar className="w-4 h-4 mr-1.5 text-gray-400" />
                              <span>{new Date(reminder.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </div>
                          </div>
                          <button
                            onClick={async () => {
                              try {
                                await reminderService.deleteReminder(reminder._id);
                                fetchReminders();
                              } catch (error) {
                                console.error('Error removing reminder:', error);
                              }
                            }}
                            className="px-1 py-1 bg-red-400 text-white rounded-lg shadow-md hover:bg-red-400 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
            
            
            
          </div>
        </div>
      </div>

      {/* Reminder Form Modal */}
      {showForm && (
        <ReminderForm
          onSave={handleSaveReminder}
          onClose={() => {
            setShowForm(false);
            setEditingReminder(null);
          }}
          initialData={editingReminder || {}}
        />
      )}
      <Footer />
    </div>
  );
};

export default Reminders;
