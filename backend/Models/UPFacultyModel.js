import mongoose from 'mongoose';

const facultySchema = new mongoose.Schema({
  facultyName: {
    type: String,
    required: true
  },
  facultyCode: {
    type: String,
    required: true
  },
  __v: {
    type: Number,
    default: 0
  }
});

const Faculty = mongoose.model('Faculty', facultySchema);

export default Faculty; 