import Timetable from '../Models/TimetableModel.js';

// Get timetable for year/semester
export const getTimetable = async (req, res) => {
  const { year, semester } = req.query;
  try {
    const timetable = await Timetable.findOne({ year, semester });
    res.json(timetable || {});
  } catch (err) {
    res.status(500).json({ message: 'Error fetching timetable', error: err.message });
  }
};

// Add or update timetable for year/semester
export const saveTimetable = async (req, res) => {
  const { year, semester, days } = req.body;
  try {
    let timetable = await Timetable.findOneAndUpdate(
      { year, semester },
      { days },
      { new: true, upsert: true }
    );
    res.json(timetable);
  } catch (err) {
    res.status(500).json({ message: 'Error saving timetable', error: err.message });
  }
}; 