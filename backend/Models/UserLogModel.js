import mongoose from 'mongoose';

const userLogSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const UserLog = mongoose.model('UserLog', userLogSchema);

export { UserLog };


