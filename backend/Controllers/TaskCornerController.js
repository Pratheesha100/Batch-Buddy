import Task from '../models/TaskCornerModel.js';
import asyncHandler from 'express-async-handler';

// @desc    Get all tasks for a user
// @route   GET /api/tasks
// @access  Private
export const getTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ userId: req.user._id })
    .sort({ dueTime: 1 });
  res.status(200).json(tasks);
});

// @desc    Get task statistics
// @route   GET /api/tasks/stats
// @access  Private
export const getTaskStats = asyncHandler(async (req, res) => {
  const stats = await Task.aggregate([
    { $match: { userId: req.user._id } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const totalTasks = stats.reduce((acc, curr) => acc + curr.count, 0);
  const completedTasks = stats.find(stat => stat._id === 'Completed')?.count || 0;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  res.status(200).json({
    completed: completedTasks,
    inProgress: stats.find(stat => stat._id === 'In Progress')?.count || 0,
    pending: stats.find(stat => stat._id === 'Pending')?.count || 0,
    completionRate
  });
});

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
export const createTask = asyncHandler(async (req, res) => {
  const { title, description, priority, category, dueTime } = req.body;

  if (!title || !description || !category || !dueTime) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  const task = await Task.create({
    title,
    description,
    priority,
    category,
    dueTime,
    userId: req.user._id
  });

  res.status(201).json(task);
});

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Check if task belongs to user
  if (task.userId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const updatedTask = await Task.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json(updatedTask);
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Check if task belongs to user
  if (task.userId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  await task.deleteOne();
  res.status(200).json({ message: 'Task removed' });
});

// @desc    Update task status
// @route   PATCH /api/tasks/:id/status
// @access  Private
export const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Check if task belongs to user
  if (task.userId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  task.status = status;
  const updatedTask = await task.save();

  res.status(200).json(updatedTask);
});

// @desc    Get filtered tasks
// @route   GET /api/tasks/filter
// @access  Private
export const getFilteredTasks = asyncHandler(async (req, res) => {
  const { priority, category } = req.query;
  const filter = { userId: req.user._id };

  if (priority && priority !== 'all') {
    filter.priority = priority;
  }

  if (category && category !== 'all') {
    filter.category = category;
  }

  const tasks = await Task.find(filter).sort({ dueTime: 1 });
  res.status(200).json(tasks);
});
