import Reminder from '../Models/reminderModel.js';
import asyncHandler from 'express-async-handler';

// @desc    Create a new reminder
// @route   POST /api/reminders
// @access  Private
export const createReminder = asyncHandler(async (req, res) => {
  const { title, description, date, time, priority = 'medium' } = req.body;

  // Basic validation
  if (!title || !date || !time) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Create the reminder
  const reminder = await Reminder.create({
    user: req.user.id,
    title,
    description,
    date: new Date(date),
    time,
    priority
  });

  res.status(201).json({
    success: true,
    data: reminder
  });
});

// @desc    Get all reminders for the logged-in user
// @route   GET /api/reminders
// @access  Private
export const getReminders = asyncHandler(async (req, res) => {
  const { completed, upcoming, limit = 10, page = 1 } = req.query;
  const query = { user: req.user.id };

  // Filter by completion status if provided
  if (completed === 'true') {
    query.completed = true;
  } else if (completed === 'false') {
    query.completed = false;
  }

  // Get upcoming reminders
  if (upcoming === 'true') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    query.date = { $gte: today };
    query.completed = false;
  }

  // Pagination
  const pageSize = parseInt(limit, 10) || 10;
  const currentPage = parseInt(page, 10) || 1;
  const skip = (currentPage - 1) * pageSize;

  const total = await Reminder.countDocuments(query);
  const reminders = await Reminder.find(query)
    .sort({ date: 1, time: 1 })
    .skip(skip)
    .limit(pageSize);

  res.status(200).json({
    success: true,
    count: reminders.length,
    total,
    totalPages: Math.ceil(total / pageSize),
    currentPage,
    data: reminders
  });
});

// @desc    Get a single reminder
// @route   GET /api/reminders/:id
// @access  Private
export const getReminder = asyncHandler(async (req, res) => {
  const reminder = await Reminder.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!reminder) {
    res.status(404);
    throw new Error('Reminder not found');
  }

  res.status(200).json({
    success: true,
    data: reminder
  });
});

// @desc    Update a reminder
// @route   PUT /api/reminders/:id
// @access  Private
export const updateReminder = asyncHandler(async (req, res) => {
  const { title, description, date, time, priority, completed } = req.body;
  
  let reminder = await Reminder.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!reminder) {
    res.status(404);
    throw new Error('Reminder not found');
  }

  // Update fields if they exist in the request
  if (title) reminder.title = title;
  if (description !== undefined) reminder.description = description;
  if (date) reminder.date = new Date(date);
  if (time) reminder.time = time;
  if (priority) reminder.priority = priority;
  if (completed !== undefined) {
    reminder.completed = completed;
    // If marking as complete, set notified to true
    if (completed) {
      reminder.notified = true;
    }
  }

  const updatedReminder = await reminder.save();

  res.status(200).json({
    success: true,
    data: updatedReminder
  });
});

// @desc    Delete a reminder
// @route   DELETE /api/reminders/:id
// @access  Private
export const deleteReminder = asyncHandler(async (req, res) => {
  try {
    console.log('Attempting to delete reminder with ID:', req.params.id);
    console.log('User ID:', req.user.id);
    
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    console.log('Found reminder:', reminder);

    if (!reminder) {
      console.log('Reminder not found');
      res.status(404);
      throw new Error('Reminder not found');
    }

    console.log('Attempting to delete reminder...');
    const result = await Reminder.deleteOne({ _id: req.params.id });
    console.log('Delete result:', result);

    if (result.deletedCount === 0) {
      console.log('No document was deleted');
      res.status(404);
      throw new Error('Failed to delete reminder');
    }

    console.log('Successfully deleted reminder');
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error in deleteReminder:', error);
    throw error;
  }
});

// @desc    Toggle reminder completion status
// @route   PATCH /api/reminders/:id/toggle
// @access  Private
export const toggleReminder = asyncHandler(async (req, res) => {
  const reminder = await Reminder.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!reminder) {
    res.status(404);
    throw new Error('Reminder not found');
  }

  reminder.completed = !reminder.completed;
  
  // If marking as complete, set notified to true
  if (reminder.completed) {
    reminder.notified = true;
  }

  const updatedReminder = await reminder.save();

  res.status(200).json({
    success: true,
    data: updatedReminder
  });
});

// @desc    Get upcoming reminders (for notifications)
// @route   GET /api/reminders/upcoming
// @access  Private
// @desc    Get due reminders for the logged-in user
// @route   GET /api/reminders/due
// @access  Private
export const getDueReminders = asyncHandler(async (req, res) => {
  try {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000); // 1 minute ago

    // Find reminders that are due (within the last minute) and not yet notified
    const dueReminders = await Reminder.find({
      user: req.user.id,
      date: { $lte: now },
      notified: false,
      $or: [
        { time: { $exists: false } }, // If no specific time
        { 
          time: { $exists: true },
          $expr: {
            $or: [
              // If time is in HH:MM format
              {
                $and: [
                  { $lte: [
                    { $dateFromString: { 
                      dateString: { $concat: [
                        { $substr: ['$date', 0, 10] },
                        'T',
                        '$time',
                        ':00.000Z'
                      ]}
                    }}, 
                    now
                  ]},
                  { $gt: [
                    { $dateFromString: { 
                      dateString: { $concat: [
                        { $substr: ['$date', 0, 10] },
                        'T',
                        '$time',
                        ':00.000Z'
                      ]}
                    }}, 
                    oneMinuteAgo
                  ]}
                ]
              },
              // If time is not in HH:MM format, just use the date
              {
                $and: [
                  { $lte: ['$date', now] },
                  { $gt: ['$date', oneMinuteAgo] }
                ]
              }
            ]
          }
        }
      ]
    });


    res.status(200).json({
      success: true,
      data: dueReminders
    });
  } catch (error) {
    console.error('Error getting due reminders:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting due reminders',
      error: error.message
    });
  }
});

// @desc    Mark a reminder as notified
// @route   PATCH /api/reminders/:id/notified
// @access  Private
export const markAsNotified = asyncHandler(async (req, res) => {
  const reminder = await Reminder.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!reminder) {
    res.status(404);
    throw new Error('Reminder not found');
  }

  // Update the notified status
  reminder.notified = true;
  await reminder.save();

  res.status(200).json({
    success: true,
    data: reminder
  });
});

// @desc    Get upcoming reminders
// @route   GET /api/reminders/upcoming
// @access  Private
export const getUpcomingReminders = asyncHandler(async (req, res) => {
  const { days = 7 } = req.query;
  const today = new Date();
  const endDate = new Date();
  endDate.setDate(today.getDate() + parseInt(days, 10));

  const reminders = await Reminder.find({
    user: req.user.id,
    completed: false,
    notified: false,
    date: { $gte: today, $lte: endDate }
  }).sort({ date: 1, time: 1 });

  res.status(200).json({
    success: true,
    count: reminders.length,
    data: reminders
  });
});

// All functions are already exported using named exports
