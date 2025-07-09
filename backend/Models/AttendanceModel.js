import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserLog',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  records: [{
    subject: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['present', 'absent'],
      required: true
    },
    time: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['Lecture', 'Lab', 'Tutorial'],
      required: true
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index for student and date
attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

const NewAttendance = mongoose.model('NewAttendance', attendanceSchema);

export default NewAttendance; 