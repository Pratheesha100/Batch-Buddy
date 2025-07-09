import mongoose from 'mongoose';

const timeSlotSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  location: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
});

const daySchema = new mongoose.Schema({
  day: { type: String, required: true },
  slots: [timeSlotSchema]
});

const timetableSchema = new mongoose.Schema({
  year: { type: String, required: true },
  semester: { type: String, required: true },
  days: [daySchema]
});

const Timetable = mongoose.model('Timetable', timetableSchema, 'newtimetable');
export default Timetable; 