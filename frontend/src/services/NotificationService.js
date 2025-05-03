import axios from 'axios';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

const SOCKET_URL = 'http://localhost:5000';

// Initialize socket connection
export const socket = io(SOCKET_URL, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity,
  transports: ['websocket', 'polling']
});

let hasUserInteracted = false;
let cachedAudio = null;

// Function to play sound with better error handling
const playSound = async (volume = 1.0) => {
  if (!hasUserInteracted) return;
  
  try {
    // Create and cache audio instance if not exists
    if (!cachedAudio) {
      cachedAudio = new Audio('/notification-sound.mp3');
      cachedAudio.preload = 'auto';
    }

    cachedAudio.volume = volume;
    
    // Reset audio to start if it's already playing
    if (!cachedAudio.paused) {
      cachedAudio.currentTime = 0;
    }
    
    await cachedAudio.play();
  } catch (error) {
    console.error('Sound playback failed:', error.message);
  }
};

// Enhance toast notifications with sound
const enhancedToast = {
  success: (message, options = {}) => {
    playSound(0.3);
    return toast.success(message, options);
  },
  error: (message, options = {}) => {
    playSound(0.3);
    return toast.error(message, options);
  },
  info: (message, options = {}) => {
    playSound(0.3);
    return toast.info(message, options);
  },
  warning: (message, options = {}) => {
    playSound(0.3);
    return toast.warning(message, options);
  }
};

// Socket event listeners for connection status
socket.on('connect', () => {
  console.log('Connected to socket server:', socket.id);
  enhancedToast.success('Connected to notification server');
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
  enhancedToast.error('Connection to notification server failed');
});

socket.on('disconnect', () => {
  console.log('Disconnected from notification server');
});

socket.on('error', (error) => {
  console.error('Socket error:', error);
});

socket.on('reminderDue', (reminder) => {
  console.log('Reminder due notification received:', reminder);
});

// Request notification permission on service initialization
const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    try {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  }
};

// Initialize notification permission
requestNotificationPermission();

const notificationService = {
  // Enable sound notifications
  enableSoundNotifications: () => {
    hasUserInteracted = true;
    // Preload the audio file
    if (!cachedAudio) {
      cachedAudio = new Audio('/notification-sound.mp3');
      cachedAudio.preload = 'auto';
      // Load the audio file
      cachedAudio.load();
    }
    enhancedToast.success('Sound notifications enabled');
  },

  // Test sound notification
  testSound: () => {
    if (!hasUserInteracted) {
      console.warn('Sound notifications disabled. User interaction required.');
      return;
    }
    playSound(1.0);
  },

  // Play sound for actual reminder
  playSound: () => {
    if (hasUserInteracted) {
      playSound(1.0);
    }
  },

  // Test push notification
  testPush: async () => {
    if (!('Notification' in window)) {
      return 'Push notifications not supported';
    }

    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return 'Push notifications not enabled';
      }
    }

    new Notification('Test Notification', {
      body: 'This is a test notification',
      icon: '/favicon.ico'
    });
    return 'Push notification working';
  },

  // Test all notifications
  testAll: async () => {
    return {
      sound: hasUserInteracted ? 'Sound notification working' : 'Sound requires interaction',
      push: await notificationService.testPush()
    };
  },

  // Check notification permission state
  checkPermissionState: async () => {
    if (!('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  },

  // Request notification permission
  requestPermission: async () => {
    if (!('Notification' in window)) {
      throw new Error('Notifications are not supported in this browser');
    }
    return await Notification.requestPermission();
  },

  // Get all notifications
  getAllNotifications: async () => {
    try {
      const response = await axios.get(`${API_URL}/notifications`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  // Create a new notification
  createNotification: async (notificationData) => {
    try {
      const response = await axios.post(`${API_URL}/notifications`, notificationData);
      return response.data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  // Update a notification
  updateNotification: async (id, notificationData) => {
    try {
      const response = await axios.put(`${API_URL}/notifications/${id}`, notificationData);
      return response.data;
    } catch (error) {
      console.error('Error updating notification:', error);
      throw error;
    }
  },

  // Delete a notification
  deleteNotification: async (id) => {
    try {
      await axios.delete(`${API_URL}/notifications/${id}`);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  // Get notifications for a specific reminder
  getReminderNotifications: async (reminderId) => {
    try {
      const response = await axios.get(`${API_URL}/reminders/${reminderId}/notifications`);
      return response.data;
    } catch (error) {
      console.error('Error fetching reminder notifications:', error);
      throw error;
    }
  },

  // Show notification
  showNotification: (title, options = {}) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, options);
      } catch (error) {
        console.error('Error showing notification:', error);
        // Fallback to toast notification
        toast.info(title);
      }
    } else {
      // Fallback to toast notification
      toast.info(title);
    }
  },

  // Play notification sound
  playNotificationSound: () => {
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.play();
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }
};

export default notificationService;