import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  // Add other fields as needed
}, { collection: 'students' });

const Student = mongoose.model('Student', studentSchema);
export default Student; 