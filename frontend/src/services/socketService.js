import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = new Map();
    this.userId = null;
  }

  connect() {
    if (this.socket) return;

    console.log('Attempting to connect to WebSocket server...');
    
    // Get user ID from both localStorage and sessionStorage to ensure we find it
    this.userId = localStorage.getItem('userId') || sessionStorage.getItem('userId') || sessionStorage.getItem('user')?._id;
    console.log('User ID for WebSocket connection:', this.userId);

    this.socket = io('http://localhost:5000', {
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      transports: ['websocket', 'polling'], // Ensure both transport methods are available
      query: this.userId ? { userId: this.userId } : {} // Add userId to query for server-side tracking
    });

    this.socket.on('connect', () => {
      console.log('🟢 Connected to WebSocket server, socket ID:', this.socket.id);
      this.connected = true;
      
      // Join user-specific room when authenticated
      if (this.userId) {
        this.joinUserRoom(this.userId);
      } else {
        console.warn('⚠️ No user ID found for WebSocket room join');
        // Try to find user ID in different storage options
        const userFromStorage = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
        if (userFromStorage && userFromStorage._id) {
          this.userId = userFromStorage._id;
          console.log('Found user ID in user object:', this.userId);
          this.joinUserRoom(this.userId);
        }
      }
      
      // Also check for any user data in session/localStorage
      const possibleUserKeys = ['user', 'userData', 'authUser', 'currentUser'];
      for (const key of possibleUserKeys) {
        try {
          const storedData = localStorage.getItem(key) || sessionStorage.getItem(key);
          if (storedData) {
            const parsedData = JSON.parse(storedData);
            if (parsedData && parsedData._id) {
              console.log(`Found user ID in ${key}:`, parsedData._id);
              this.userId = parsedData._id;
              this.joinUserRoom(parsedData._id);
              break;
            }
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
    });

    this.socket.on('disconnect', () => {
      console.log('🔴 Disconnected from WebSocket server');
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('⚠️ WebSocket connection error:', error);
      this.connected = false;
    });

    // Setup reminder-due event listener
    this.socket.on('reminder-due', (reminderData) => {
      console.log('📢 Received reminder-due event:', reminderData);
      
      // Also trigger browser notification directly here as a fallback
      this.showDirectNotification(reminderData);
      
      // Trigger any registered callbacks for reminder-due events
      if (this.listeners.has('reminder-due')) {
        console.log(`Notifying ${this.listeners.get('reminder-due').length} 'reminder-due' listeners`);
        this.listeners.get('reminder-due').forEach(callback => callback(reminderData));
      } else {
        console.warn('No listeners registered for reminder-due events');
      }
    });
    
    // Setup reminder-snoozed event listener
    this.socket.on('reminder-snoozed', (snoozeData) => {
      console.log('⏰ Received reminder-snoozed event:', snoozeData);
      
      // Trigger any registered callbacks for reminder-snoozed events
      if (this.listeners.has('reminder-snoozed')) {
        this.listeners.get('reminder-snoozed').forEach(callback => callback(snoozeData));
      }
    });
  }
  
  // Show full screen alert for reminder
  showDirectNotification(reminderData) {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        // Create a notification that requires user interaction
        const notification = new Notification(`Reminder: ${reminderData.title}`, {
          body: reminderData.description || `Priority: ${reminderData.priority}`,
          requireInteraction: true,
          silent: true // No sound
        });
        
        // Handle notification click
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
        
        // Use speech synthesis for voice alert
        this.speakReminder(reminderData);
        
        // Create a full screen alert element
        this.showFullScreenAlert(reminderData);
        
        // Auto-update the reminder status immediately
        this.autoCompleteReminder(reminderData.id);
      } catch (e) {
        console.error('Error showing direct notification:', e);
      }
    }
  }
  
  // Speak the reminder aloud
  speakReminder(reminderData) {
    if ('speechSynthesis' in window) {
      // Clear any existing speech queue
      window.speechSynthesis.cancel();
      
      // Create and speak the notification
      const utterance = new SpeechSynthesisUtterance(`You have a reminder: ${reminderData.title}`);
      utterance.rate = 0.9; // Slightly slower than normal speech
      utterance.pitch = 1.1; // Slightly higher pitch for attention
      window.speechSynthesis.speak(utterance);
    }
  }
  
  // Show a full screen alert for the reminder
  showFullScreenAlert(reminderData) {
    // Create a container for the full screen alert
    const alertContainer = document.createElement('div');
    alertContainer.style.position = 'fixed';
    alertContainer.style.top = '0';
    alertContainer.style.left = '0';
    alertContainer.style.width = '100%';
    alertContainer.style.height = '100%';
    alertContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    alertContainer.style.display = 'flex';
    alertContainer.style.justifyContent = 'center';
    alertContainer.style.alignItems = 'center';
    alertContainer.style.zIndex = '9999';
    
    // Create the alert content
    const alertContent = document.createElement('div');
    alertContent.style.backgroundColor = 'white';
    alertContent.style.borderRadius = '10px';
    alertContent.style.padding = '20px';
    alertContent.style.maxWidth = '80%';
    alertContent.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
    
    // Create title
    const title = document.createElement('h3');
    title.textContent = `Reminder: ${reminderData.title}`;
    title.style.fontSize = '24px';
    title.style.marginBottom = '10px';
    title.style.color = '#333';
    
    // Create description
    const description = document.createElement('p');
    description.textContent = reminderData.description || '';
    description.style.fontSize = '16px';
    description.style.marginBottom = '20px';
    description.style.color = '#666';
    
    // Create date/time
    const dateTime = document.createElement('p');
    dateTime.textContent = `${reminderData.date} at ${reminderData.time}`;
    dateTime.style.fontSize = '14px';
    dateTime.style.marginBottom = '20px';
    dateTime.style.color = '#999';
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Complete & Close';
    closeButton.style.backgroundColor = '#4CAF50';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.padding = '10px 20px';
    closeButton.style.borderRadius = '5px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.marginRight = '10px';
    
    // Create snooze button
    const snoozeButton = document.createElement('button');
    snoozeButton.textContent = 'Snooze 15 minutes';
    snoozeButton.style.backgroundColor = '#2196F3';
    snoozeButton.style.color = 'white';
    snoozeButton.style.border = 'none';
    snoozeButton.style.padding = '10px 20px';
    snoozeButton.style.borderRadius = '5px';
    snoozeButton.style.cursor = 'pointer';
    
    // Button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'center';
    
    // Add event listeners
    closeButton.addEventListener('click', () => {
      document.body.removeChild(alertContainer);
      this.autoCompleteReminder(reminderData.id);
    });
    
    snoozeButton.addEventListener('click', () => {
      document.body.removeChild(alertContainer);
      this.snoozeReminder(reminderData.id);
    });
    
    // Assemble the alert
    buttonContainer.appendChild(closeButton);
    buttonContainer.appendChild(snoozeButton);
    
    alertContent.appendChild(title);
    alertContent.appendChild(description);
    alertContent.appendChild(dateTime);
    alertContent.appendChild(buttonContainer);
    
    alertContainer.appendChild(alertContent);
    
    // Add to the document body
    document.body.appendChild(alertContainer);
    
    // Auto-close after 15 seconds
    setTimeout(() => {
      if (document.body.contains(alertContainer)) {
        document.body.removeChild(alertContainer);
      }
    }, 15000); // 15 seconds
  }
  
  // Auto-complete a reminder
  autoCompleteReminder(reminderId) {
    try {
      // Import the reminder service dynamically to avoid circular dependencies
      import('./reminderService.js').then(module => {
        const reminderService = module.default || module.reminderService;
        if (reminderService && reminderService.toggleReminder) {
          console.log('Auto-completing reminder:', reminderId);
          reminderService.toggleReminder(reminderId)
            .then(() => {
              console.log('Successfully completed reminder:', reminderId);
              // Refresh any open reminder lists
              window.dispatchEvent(new CustomEvent('reminder-completed', { detail: { id: reminderId } }));
            })
            .catch(err => console.error('Error auto-completing reminder:', err));
        }
      });
    } catch (error) {
      console.error('Error auto-completing reminder:', error);
    }
  }
  
  // Snooze a reminder
  snoozeReminder(reminderId) {
    try {
      // Import the reminder service dynamically to avoid circular dependencies
      import('./reminderService.js').then(module => {
        const reminderService = module.default || module.reminderService;
        if (reminderService && reminderService.snoozeReminder) {
          console.log('Snoozing reminder:', reminderId);
          reminderService.snoozeReminder(reminderId, 15)
            .then(() => {
              console.log('Successfully snoozed reminder:', reminderId);
              // Refresh any open reminder lists
              window.dispatchEvent(new CustomEvent('reminder-snoozed', { detail: { id: reminderId } }));
            })
            .catch(err => console.error('Error snoozing reminder:', err));
        }
      });
    } catch (error) {
      console.error('Error snoozing reminder:', error);
    }
  }


  joinUserRoom(userId) {
    if (this.socket && userId) {
      this.socket.emit('join-user-room', userId);
      console.log(`Joined user room: user-${userId}`);
    }
  }

  registerListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  unregisterListener(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }
}

export const socketService = new SocketService();
export default socketService;
