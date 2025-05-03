const Reminder = require('../models/Reminder');

// Get all reminders
exports.getAllReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find().sort({ date: 1, time: 1 });
    const now = new Date();
    let statusUpdated = false;

    // Auto-complete past reminders
    for (const reminder of reminders) {
      if (reminder.status !== 'completed') {
        // Combine date and time for accurate comparison
        const reminderDate = new Date(reminder.date);
        if (reminder.time) {
          const [hours, minutes] = reminder.time.split(':');
          reminderDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        }

        // Check if reminder is in the past
        if (reminderDate < now) {
          console.log(`Auto-completing past reminder: ${reminder.title}`);
          reminder.status = 'completed';
          await reminder.save();
          
          // Emit update event
          global.io.emit('reminderUpdated', reminder);
          statusUpdated = true;
        }
      }
    }

    // Fetch updated list if any statuses changed
    const updatedReminders = statusUpdated ? 
      await Reminder.find().sort({ date: 1, time: 1 }) : 
      reminders;

    res.status(200).json({
      success: true,
      data: updatedReminders
    });
  } catch (error) {
    console.error('Error in getAllReminders:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get a single reminder by ID
exports.getReminderById = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({
        success: false,
        error: 'Reminder not found'
      });
    }
    res.status(200).json({
      success: true,
      data: reminder
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Create a new reminder
exports.createReminder = async (req, res) => {
  try {
    const reminderData = {
      ...req.body,
      date: new Date(req.body.date)
    };
    const reminder = new Reminder(reminderData);
    await reminder.save();
    
    // Emit socket event for new reminder
    global.io.emit('reminderCreated', reminder);
    
    res.status(201).json({
      success: true,
      data: reminder
    });
  } catch (error) {
    console.error('Error creating reminder:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Update a reminder
exports.updateReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!reminder) {
      return res.status(404).json({
        success: false,
        error: 'Reminder not found'
      });
    }
    
    // Emit socket event for updated reminder
    global.io.emit('reminderUpdated', reminder);
    
    res.status(200).json({
      success: true,
      data: reminder
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Delete a reminder
exports.deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findByIdAndDelete(req.params.id);
    if (!reminder) {
      return res.status(404).json({
        success: false,
        error: 'Reminder not found'
      });
    }
    
    // Emit socket event for deleted reminder
    global.io.emit('reminderDeleted', reminder._id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Update reminder status
exports.updateReminderStatus = async (req, res) => {
  try {
    const reminder = await Reminder.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    if (!reminder) {
      return res.status(404).json({
        success: false,
        error: 'Reminder not found'
      });
    }
    
    // Emit socket event for status update
    global.io.emit('reminderUpdated', reminder);
    
    res.status(200).json({
      success: true,
      data: reminder
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};
