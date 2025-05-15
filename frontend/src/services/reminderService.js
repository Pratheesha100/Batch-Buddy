import axios from 'axios';

const API_URL = 'http://localhost:5000/api/reminders';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const reminderService = {
  // Fetch all reminders
  getReminders: async () => {
    try {
      const response = await axios.get(API_URL, getAuthHeader());
      return Array.isArray(response.data) ? response.data : response.data.data || [];
    } catch (error) {
      console.error('Error fetching reminders:', error);
      throw error;
    }
  },

  // Create a new reminder
  createReminder: async (reminderData) => {
    try {
      const response = await axios.post(API_URL, reminderData, getAuthHeader());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error creating reminder:', error);
      throw error;
    }
  },

  // Delete a reminder
  deleteReminder: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
      return response.data; // Return the response data to the caller
    } catch (error) {
      console.error('Error deleting reminder:', error);
      throw error;
    }
  },

  // Toggle reminder completion status
  toggleReminder: async (id) => {
    try {
      await axios.patch(`${API_URL}/${id}/toggle`, {}, getAuthHeader());
    } catch (error) {
      console.error('Error toggling reminder:', error);
      throw error;
    }
  },

  // Update an existing reminder
  updateReminder: async (id, reminderData) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, reminderData, getAuthHeader());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error updating reminder:', error);
      throw error;
    }
  },

  // Mark reminder as notified
  markAsNotified: async (id) => {
    try {
      const response = await axios.patch(
        `${API_URL}/${id}/notified`,
        { notified: true },
        getAuthHeader()
      );
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error marking reminder as notified:', error);
      throw error;
    }
  },
  
  // Snooze a reminder for a specified duration
  snoozeReminder: async (id, minutes = 15) => {
    try {
      const response = await axios.patch(
        `${API_URL}/${id}/snooze`,
        { minutes },
        getAuthHeader()
      );
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error snoozing reminder:', error);
      throw error;
    }
  },

  // Get due reminders
  getDueReminders: async () => {
    try {
      const response = await axios.get(`${API_URL}/due`, getAuthHeader());
      return Array.isArray(response.data) ? response.data : response.data.data || [];
    } catch (error) {
      console.error('Error fetching due reminders:', error);
      throw error;
    }
  }
};

export default reminderService;
