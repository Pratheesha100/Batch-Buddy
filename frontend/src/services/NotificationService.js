class NotificationService {
  constructor() {
    this.permission = null;
    this.checkPermission();
  }

  async checkPermission() {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    this.permission = Notification.permission;
    if (this.permission === 'default') {
      this.permission = await Notification.requestPermission();
    }
  }

  async requestPermission() {
    if (!('Notification' in window)) {
      return false;
    }

    this.permission = await Notification.requestPermission();
    return this.permission === 'granted';
  }

  showNotification(title, options = {}) {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    if (this.permission !== 'granted') {
      console.log('Notification permission not granted');
      return;
    }

    const defaultOptions = {
      icon: '/notification-icon.png',
      badge: '/notification-badge.png',
      vibrate: [200, 100, 200],
      tag: 'reminder-notification',
      ...options
    };

    new Notification(title, defaultOptions);
  }

  scheduleNotification(reminder) {
    const reminderTime = new Date(`${reminder.date}T${reminder.time}`);
    const now = new Date();
    const timeUntilReminder = reminderTime.getTime() - now.getTime();

    if (timeUntilReminder > 0) {
      setTimeout(() => {
        this.showNotification(reminder.title, {
          body: reminder.description || 'Reminder is due!',
          data: reminder
        });
      }, timeUntilReminder);
    }
  }

  cancelAllNotifications() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.getNotifications().then(notifications => {
          notifications.forEach(notification => notification.close());
        });
      });
    }
  }
}

export const notificationService = new NotificationService(); 