import mongoose from 'mongoose';

const userLogSchema = mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  year: {
    type: String,
    required: true,
    enum: ['Year 1', 'Year 2', 'Year 3', 'Year 4']
  },
  semester: {
    type: String,
    required: true,
    enum: ['Semester 1', 'Semester 2']
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export const UserLog = mongoose.model('UserLog', userLogSchema);


