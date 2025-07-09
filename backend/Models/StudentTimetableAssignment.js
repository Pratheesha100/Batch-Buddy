import mongoose from 'mongoose';

const studentTimetableAssignmentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserLog',
    required: true
  },
  timetableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Timetable',
    required: true
  },
  assignedAt: {
    type: Date,
    default: Date.now
  }
});

// Create a compound index to ensure one timetable per student
studentTimetableAssignmentSchema.index({ studentId: 1 }, { unique: true });

const StudentTimetableAssignment = mongoose.model('StudentTimetableAssignment', studentTimetableAssignmentSchema);

export default StudentTimetableAssignment; 