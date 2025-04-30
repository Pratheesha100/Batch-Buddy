const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');

// Get all reminders
router.get('/', async (req, res) => {
  try {
    const reminders = await Reminder.find().sort({ createdAt: -1 });
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET a single reminder
router.get('/:id', async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }
    res.json(reminder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new reminder
router.post('/', async (req, res) => {
  const reminder = new Reminder(req.body);
  try {
    const newReminder = await reminder.save();
    res.status(201).json(newReminder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT to update a reminder
router.put('/:id', async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    // If date is being updated, validate it
    if (req.body.date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const newDate = new Date(req.body.date);
      newDate.setHours(0, 0, 0, 0);

      if (newDate < today) {
        return res.status(400).json({ 
          message: 'Cannot set reminders for past dates' 
        });
      }
    }

    if (req.body.title) reminder.title = req.body.title;
    if (req.body.date) reminder.date = req.body.date;
    if (req.body.time) reminder.time = req.body.time;
    if (req.body.type) reminder.type = req.body.type;
    if (req.body.description) reminder.description = req.body.description;
    if (req.body.status !== undefined) reminder.status = req.body.status;

    const updatedReminder = await reminder.save();
    res.json(updatedReminder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update reminder status
router.patch('/:id', async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }
    
    reminder.status = req.body.status;
    const updatedReminder = await reminder.save();
    res.json(updatedReminder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a reminder
// Delete a reminder
router.delete('/:id', async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }
    await reminder.deleteOne();
    res.json({ message: 'Reminder deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
