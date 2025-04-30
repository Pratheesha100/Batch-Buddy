const API_URL = 'http://localhost:5000/api';

export const reminderApi = {
  // Get all reminders
  getAllReminders: async () => {
    try {
      const response = await fetch(`${API_URL}/reminders`);
      if (!response.ok) {
        throw new Error('Failed to fetch reminders');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching reminders:', error);
      throw error;
    }
  },

  // Get a single reminder
  getReminderById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/reminders/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reminder');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching reminder:', error);
      throw error;
    }
  },

  // Create a new reminder
  createReminder: async (reminderData) => {
    try {
      const response = await fetch(`${API_URL}/reminders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reminderData),
      });
      if (!response.ok) {
        throw new Error('Failed to create reminder');
      }
      return response.json();
    } catch (error) {
      console.error('Error creating reminder:', error);
      throw error;
    }
  },

  // Update reminder
  updateReminder: async (id, reminderData) => {
    try {
      const response = await fetch(`${API_URL}/reminders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reminderData),
      });
      if (!response.ok) {
        throw new Error('Failed to update reminder');
      }
      return response.json();
    } catch (error) {
      console.error('Error updating reminder:', error);
      throw error;
    }
  },

  // Update reminder status
  updateReminderStatus: async (id, status) => {
    try {
      const response = await fetch(`${API_URL}/reminders/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error('Failed to update reminder status');
      }
      return response.json();
    } catch (error) {
      console.error('Error updating reminder status:', error);
      throw error;
    }
  },

  // Delete a reminder
  deleteReminder: async (id) => {
    try {
      const response = await fetch(`${API_URL}/reminders/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete reminder');
      }
      return response.json();
    } catch (error) {
      console.error('Error deleting reminder:', error);
      throw error;
    }
  },
}; 