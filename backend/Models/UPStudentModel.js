import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  studentName: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String
  },
  address: {
    type: String
  },
  birthday: {
    type: Date
  },
  email: {
    type: String
  },
  degree: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Degree'
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty'
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch'
  }
}, {
  timestamps: true
});

const Student = mongoose.model('students', studentSchema);

export default Student; 