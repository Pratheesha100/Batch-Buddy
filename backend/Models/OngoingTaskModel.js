import mongoose from 'mongoose';

const ongoingTaskSchema = new mongoose.Schema({
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
  category: {
    type: String,
    enum: ['Study', 'Project', 'Personal'],
    required: [true, 'Category is required']
  },
  dueTime: {
    type: Date,
    required: [true, 'Due time is required']
  },
  status: {
    type: String,
    enum: ['In Progress', 'Completed'],
    default: 'In Progress'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
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
ongoingTaskSchema.index({ userId: 1, status: 1 });
ongoingTaskSchema.index({ userId: 1, dueTime: 1 });

const OngoingTask = mongoose.model('OngoingTask', ongoingTaskSchema);

export default OngoingTask;
