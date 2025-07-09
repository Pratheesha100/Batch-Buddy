import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending'
  },
  category: {
    type: String,
    enum: ['Study', 'Project', 'Personal'],
    required: [true, 'Category is required']
  },
  dueTime: {
    type: Date,
    required: [true, 'Due time is required']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, dueTime: 1 });

const Task = mongoose.model('Task', taskSchema);

export default Task; 