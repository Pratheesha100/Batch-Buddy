const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/reminderController');

// Get all reminders
router.get('/', reminderController.getAllReminders);

// Get a single reminder
router.get('/:id', reminderController.getReminderById);

// Create a new reminder
router.post('/', reminderController.createReminder);

// Update a reminder
router.put('/:id', reminderController.updateReminder);

// Delete a reminder
router.delete('/:id', reminderController.deleteReminder);

// Update reminder status
router.patch('/:id/status', reminderController.updateReminderStatus);

module.exports = router;
