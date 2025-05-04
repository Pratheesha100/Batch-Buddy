import mongoose from 'mongoose';

const degreeSchema = new mongoose.Schema({
  degreeName: {
    type: String,
    required: true
  },
  degreeCode: {
    type: String,
    required: true
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  __v: {
    type: Number,
    default: 0
  }
});

const Degree = mongoose.model('Degree', degreeSchema);

export default Degree; 