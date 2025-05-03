import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const reminderApi = {
  // Get all reminders
  getAllReminders: async () => {
    try {
      const response = await axios.get(`${API_URL}/reminders`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching reminders:', error);
      throw error;
    }
  },

  // Get a single reminder by ID
  getReminderById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/reminders/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching reminder:', error);
      throw error;
    }
  },

  // Create a new reminder
  createReminder: async (reminderData) => {
    try {
      const response = await axios.post(`${API_URL}/reminders`, reminderData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating reminder:', error);
      throw error;
    }
  },

  // Update a reminder
  updateReminder: async (id, reminderData) => {
    try {
      const response = await axios.put(`${API_URL}/reminders/${id}`, reminderData);
      return response.data.data;
    } catch (error) {
      console.error('Error updating reminder:', error);
      throw error;
    }
  },

  // Delete a reminder
  deleteReminder: async (id) => {
    try {
      await axios.delete(`${API_URL}/reminders/${id}`);
    } catch (error) {
      console.error('Error deleting reminder:', error);
      throw error;
    }
  },

  // Update reminder status
  updateReminderStatus: async (id, status) => {
    try {
      const response = await axios.patch(`${API_URL}/reminders/${id}/status`, { status });
      return response.data.data;
    } catch (error) {
      console.error('Error updating reminder status:', error);
      throw error;
    }
  }
};

export { reminderApi }; 