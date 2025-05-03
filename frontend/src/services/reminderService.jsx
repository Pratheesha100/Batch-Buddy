import axios from 'axios';
import { toast } from 'react-toastify';
import { socket } from './notificationService';
import ReactDOM from 'react-dom';
import React from 'react';
import ReminderAlert from '../components/ReminderAlert';

const API_URL = 'http://localhost:5000/api';

const reminderService = {
  // Check for due reminders
  checkDueReminders: async () => {
    try {
      const response = await axios.get(`${API_URL}/reminders`);
      const reminders = response.data.data;

      const now = new Date();
      for (const reminder of reminders) {
        if (reminder.status === 'pending') {
          const reminderDate = new Date(reminder.date);
          const [hours, minutes] = reminder.time.split(':');
          reminderDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

          // Compare time in milliseconds for more precise matching
          const timeDiff = Math.abs(reminderDate.getTime() - now.getTime());
          if (timeDiff <= 10000) { // 10 seconds tolerance
            console.log('Due reminder found:', reminder);
            // Show reminder alert and handle notifications
            reminderService.showReminderAlert(reminder);
          }
        }
      }
    } catch (error) {
      console.error('Error checking reminders:', error);
    }
  },

  // Show reminder alert modal
  showReminderAlert: (reminder) => {
    // Create a div for the modal
    const modalDiv = document.createElement('div');
    modalDiv.id = `reminder-alert-${reminder._id}`;
    document.body.appendChild(modalDiv);

    // Function to remove the modal
    const removeModal = () => {
      ReactDOM.unmountComponentAtNode(modalDiv);
      modalDiv.remove();
    };

    // Handle reminder dismissal
    const handleDismiss = async () => {
      try {
        await reminderService.dismissReminder(reminder._id);
        removeModal();
      } catch (error) {
        console.error('Error dismissing reminder:', error);
        toast.error('Failed to dismiss reminder');
      }
    };

    // Render the ReminderAlert component
    ReactDOM.render(
      <ReminderAlert 
        reminder={reminder} 
        onDismiss={handleDismiss}
      />,
      modalDiv
    );

    // Trigger other notifications
    reminderService.triggerReminderNotifications(reminder);
  },

  // Dismiss a reminder
  dismissReminder: async (reminderId) => {
    try {
      const response = await axios.patch(`${API_URL}/reminders/${reminderId}/status`, {
        status: 'completed'
      });
      return response.data.data;
    } catch (error) {
      console.error('Error dismissing reminder:', error);
      throw error;
    }
  },

  // Handle trigger notifications
  triggerReminderNotifications: (reminder) => {
    // Show different types of notifications based on the reminder settings
    if (reminder.notificationTypes?.sound) {
      const audio = new Audio('/notification-sound.mp3');
      audio.play().catch(err => console.error('Error playing sound:', err));
    }

    if (reminder.notificationTypes?.push && Notification.permission === 'granted') {
      new Notification(reminder.title, {
        body: reminder.description || 'Reminder is due now!',
        icon: '/favicon.ico'
      });
    }

    // Emit the active reminder event through the socket
    socket.emit('activeReminder', reminder);

    toast.info(`Reminder: ${reminder.title}${reminder.description ? ` - ${reminder.description}` : ''}`, {
      position: "top-right",
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }
};

// Start checking reminders every 5 seconds to match server
console.log('Starting reminder check interval...');
setInterval(() => {
  reminderService.checkDueReminders();
}, 5000); // Check every 5 seconds to match server

// Initial check
reminderService.checkDueReminders();

export default reminderService;