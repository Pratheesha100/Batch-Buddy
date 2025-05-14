import { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import ReminderForm from './ReminderForm';
import { reminderService } from '../../services/reminderService';
import { MicButton } from './VoiceControl';

const Reminders = () => {
  const [showForm, setShowForm] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [editingReminder, setEditingReminder] = useState(null);
  const recognitionRef = useRef(null);
  
  // Initialize speech synthesis ref
  const speakRef = useRef((text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  });

  // Fetch reminders from the API
  const fetchReminders = async () => {
    try {
      const data = await reminderService.getReminders();
      setReminders(data);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchReminders();
  }, []);

  // Handle saving a reminder (create or update)
  const handleSaveReminder = async (reminderData) => {
    try {
      if (editingReminder) {
        await reminderService.updateReminder(editingReminder._id, reminderData);
      } else {
        await reminderService.createReminder(reminderData);
      }
      setShowForm(false);
      setEditingReminder(null);
      fetchReminders();
    } catch (error) {
      console.error('Error saving reminder:', error);
    }
  };

  // Handle deleting a reminder
  const handleDeleteReminder = async (id) => {
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      try {
        await reminderService.deleteReminder(id);
        fetchReminders();
      } catch (error) {
        console.error('Error deleting reminder:', error);
      }
    }
  };

  // Handle toggling reminder completion status
  const handleToggleComplete = async (id, completed) => {
    try {
      await reminderService.toggleReminder(id, !completed);
      fetchReminders();
    } catch (error) {
      console.error('Error toggling reminder status:', error);
    }
  };

  // Initialize speech recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event) => {
        const command = event.results[0][0].transcript.toLowerCase();
        console.log('Voice command:', command);
        
        if (command.includes('create reminder') || command.includes('set reminder')) {
          setShowForm(true);
          speakRef.current?.('What would you like to be reminded about?');
          return;
        }
        
        if (command.includes('read reminders') || command.includes('what are my reminders')) {
          const upcoming = reminders.filter(r => !r.completed);
          if (upcoming.length === 0) {
            speakRef.current?.('You have no upcoming reminders.');
          } else {
            const message = `You have ${upcoming.length} upcoming reminder${upcoming.length > 1 ? 's' : ''}. ` +
              upcoming.map((r, i) => `${i + 1}. ${r.title} on ${new Date(r.date).toLocaleDateString()}`).join('. ');
            speakRef.current?.(message);
          }
          return;
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
      
      return () => {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      };
    } else {
      console.warn('Speech recognition not supported in this browser');
    }
  }, [reminders]);

  // Handle speaking a reminder
  const handleSpeakReminder = (reminder) => {
    const { date: dateStr, time: timeStr } = formatDateTime(reminder.date, reminder.time);
    const message = `Reminder: ${reminder.title}. ${reminder.description ? `Details: ${reminder.description}. ` : ''}Scheduled for ${dateStr} at ${timeStr}. Priority: ${reminder.priority}.`;
    speakRef.current?.(message);
  };

  // Handle start listening
  const handleStartListening = () => {
    if (recognitionRef.current) {
      try {
        setIsListening(true);
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setIsListening(false);
      }
    } else {
      console.warn('Speech recognition not available');
      speakRef.current?.('Speech recognition is not supported in your browser.');
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reminders</h1>
            <p className="mt-1 text-sm text-gray-500">
              {reminders.length} {reminders.length === 1 ? 'reminder' : 'reminders'}
            </p>
          </div>
          <div className="flex space-x-3">
            <MicButton
              isListening={isListening}
              onClick={handleStartListening}
            />
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Reminder
            </button>
          </div>
        </div>

        <ReminderList
          reminders={reminders}
          onReminderUpdate={fetchReminders}
          onReminderDelete={async (id) => {
            try {
              await reminderService.deleteReminder(id);
              fetchReminders();
              // Optional: Show success message
              console.log('Reminder deleted successfully');
            } catch (error) {
              console.error('Failed to delete reminder:', error);
              // Optional: Show error message to user
              alert('Failed to delete reminder. Please try again.');
            }
          }}
          onSpeak={handleSpeakReminder}
        />
      </div>

      {showForm && (
        <ReminderForm
          reminder={editingReminder}
          onSave={handleSaveReminder}
          onCancel={() => {
            setShowForm(false);
            setEditingReminder(null);
          }}
        />
      )}
    </div>
  );
};

export default Reminders;
