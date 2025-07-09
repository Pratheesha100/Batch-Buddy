import OngoingTask from '../Models/OngoingTaskModel.js';
import asyncHandler from 'express-async-handler';

// @desc    Get all ongoing tasks for a user
// @route   GET /api/ongoing-tasks
// @access  Private
export const getOngoingTasks = asyncHandler(async (req, res) => {
  const tasks = await OngoingTask.find({ userId: req.user._id })
    .sort({ dueTime: 1 });
  res.status(200).json(tasks);
});

// @desc    Get ongoing task statistics
// @route   GET /api/ongoing-tasks/stats
// @access  Private
export const getOngoingTaskStats = asyncHandler(async (req, res) => {
  const stats = await OngoingTask.aggregate([
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
    completionRate
  });
});

// @desc    Create a new ongoing task
// @route   POST /api/ongoing-tasks
// @access  Private
export const createOngoingTask = asyncHandler(async (req, res) => {
  const { title, description, priority, category, dueTime } = req.body;

  if (!title || !description || !category || !dueTime) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  const task = await OngoingTask.create({
    title,
    description,
    priority,
    category,
    dueTime,
    userId: req.user._id,
    status: 'In Progress',
    startTime: Date.now()
  });

  res.status(201).json(task);
});

// @desc    Update an ongoing task
// @route   PUT /api/ongoing-tasks/:id
// @access  Private
export const updateOngoingTask = asyncHandler(async (req, res) => {
  const task = await OngoingTask.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Check if task belongs to user
  if (task.userId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const updatedTask = await OngoingTask.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json(updatedTask);
});

// @desc    Delete an ongoing task
// @route   DELETE /api/ongoing-tasks/:id
// @access  Private
export const deleteOngoingTask = asyncHandler(async (req, res) => {
  const task = await OngoingTask.findById(req.params.id);

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

// @desc    Update ongoing task status
// @route   PATCH /api/ongoing-tasks/:id/status
// @access  Private
export const updateOngoingTaskStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const task = await OngoingTask.findById(req.params.id);

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
  if (status === 'Completed') {
    task.completedAt = Date.now();
  }
  const updatedTask = await task.save();

  res.status(200).json(updatedTask);
});

// @desc    Get filtered ongoing tasks
// @route   GET /api/ongoing-tasks/filter
// @access  Private
export const getFilteredOngoingTasks = asyncHandler(async (req, res) => {
  const { priority, category } = req.query;
  const filter = { userId: req.user._id };

  if (priority && priority !== 'all') {
    filter.priority = priority;
  }

  if (category && category !== 'all') {
    filter.category = category;
  }

  const tasks = await OngoingTask.find(filter).sort({ dueTime: 1 });
  res.status(200).json(tasks);
});
