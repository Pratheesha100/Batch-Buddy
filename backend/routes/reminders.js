const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');

// GET all reminders
router.get('/', async (req, res) => {
  try {
    const reminders = await Reminder.find().sort({ date: 1 });
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

// POST a new reminder
router.post('/', async (req, res) => {
  try {
    // Get current date and set time to midnight for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Convert the reminder date to a Date object
    const reminderDate = new Date(req.body.date);
    reminderDate.setHours(0, 0, 0, 0);

    // Check if the reminder date is in the past
    if (reminderDate < today) {
      return res.status(400).json({ 
        message: 'Cannot create reminders for past dates' 
      });
    }

    const reminder = new Reminder({
      title: req.body.title,
      date: req.body.date,
      time: req.body.time,
      type: req.body.type,
      description: req.body.description
    });

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

// DELETE a reminder
router.delete('/:id', async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }
    await reminder.deleteOne(); // Updated to use deleteOne() instead of remove()
    res.json({ message: 'Reminder deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
