import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema({
  batchType: {
    type: String,
    required: true
  },
  studentCount: {
    type: Number,
    required: true
  },
  __v: {
    type: Number,
    default: 0
  }
});

const Batch = mongoose.model('Batch', batchSchema);

export default Batch; 