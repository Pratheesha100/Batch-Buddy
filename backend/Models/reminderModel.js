import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a title for the reminder'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  date: {
    type: Date,
    required: [true, 'Please provide a date for the reminder']
  },
  time: {
    type: String,
    required: [true, 'Please provide a time for the reminder'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide a valid time in HH:MM format']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  completed: {
    type: Boolean,
    default: false
  },
  notified: {
    type: Boolean,
    default: false
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
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
reminderSchema.index({ user: 1, date: 1, completed: 1 });
reminderSchema.index({ user: 1, completed: 1 });

// Virtual for getting the full datetime
reminderSchema.virtual('datetime').get(function() {
  const [hours, minutes] = this.time.split(':');
  const date = new Date(this.date);
  date.setHours(hours, minutes, 0, 0);
  return date;
});

// Pre-save hook to update the updatedAt field
reminderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to get upcoming reminders
reminderSchema.statics.getUpcomingReminders = function(userId, days = 7) {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + days);
  
  return this.find({
    user: userId,
    completed: false,
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: 1, time: 1 });
};

const Reminder = mongoose.model('Reminder', reminderSchema);

export default Reminder;
