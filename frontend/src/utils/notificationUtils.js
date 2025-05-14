// Check if browser notifications are supported and request permission
const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

// Show a notification
const showNotification = (title, options = {}) => {
  if (!('Notification' in window)) return;

  const notificationOptions = {
    icon: '/favicon.ico', // Path to your app's icon
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    ...options
  };

  // Show notification
  const notification = new Notification(title, notificationOptions);

  // Handle notification click
  notification.onclick = (event) => {
    event.preventDefault();
    window.focus();
    notification.close();
  };

  return notification;
};

// Speak text using speech synthesis
const speakText = (text) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = 1;
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }
};

// Check if a reminder is due
const isReminderDue = (reminder) => {
  try {
    const now = new Date();
    let reminderDate;

    // Handle different date formats
    if (reminder.date instanceof Date) {
      reminderDate = new Date(reminder.date);
    } else if (typeof reminder.date === 'string') {
      // Handle ISO string or date string
      reminderDate = new Date(reminder.date);
      
      // If time is separate, combine it with the date
      if (reminder.time) {
        const [hours, minutes] = reminder.time.split(':').map(Number);
        if (!isNaN(hours) && !isNaN(minutes)) {
          reminderDate.setHours(hours, minutes, 0, 0);
        }
      }
    } else {
      return false;
    }

    // Check if the reminder is due now (within the same minute)
    return (
      !reminder.notified &&
      reminderDate.getTime() <= now.getTime() &&
      reminderDate.getTime() > now.getTime() - 60000 // Within the last minute
    );
  } catch (error) {
    console.error('Error checking reminder due status:', error);
    return false;
  }
};

export {
  requestNotificationPermission,
  showNotification,
  speakText,
  isReminderDue
};
