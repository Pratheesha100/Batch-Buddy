import Timetable from '../Models/TimetableModel.js';
import StudentTimetableAssignment from '../Models/StudentTimetableAssignment.js';
import { UserLog } from '../Models/UserLogModel.js';

const TimetableAssignmentController = {
  // Get all available timetables
  getAllTimetables: async (req, res) => {
    try {
      const timetables = await Timetable.find({}, 'year semester');
      res.json(timetables);
    } catch (error) {
      console.error('Error in getAllTimetables:', error);
      res.status(500).json({ message: 'Error fetching timetables', error: error.message });
    }
  },

  // Assign timetable to student
  assignTimetable: async (req, res) => {
    try {
      const { studentId, timetableId } = req.body;

      // Check if student exists
      const student = await UserLog.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      // Check if timetable exists
      const timetable = await Timetable.findById(timetableId);
      if (!timetable) {
        return res.status(404).json({ message: 'Timetable not found' });
      }

      // Create or update assignment
      const assignment = await StudentTimetableAssignment.findOneAndUpdate(
        { studentId },
        { timetableId },
        { upsert: true, new: true }
      );

      res.json({ message: 'Timetable assigned successfully', assignment });
    } catch (error) {
      console.error('Error in assignTimetable:', error);
      res.status(500).json({ message: 'Error assigning timetable', error: error.message });
    }
  },

  // Get all timetable assignments
  getAllAssignments: async (req, res) => {
    try {
      const assignments = await StudentTimetableAssignment.find()
        .populate({
          path: 'studentId',
          select: 'studentId',
          model: 'UserLog'
        })
        .populate({
          path: 'timetableId',
          select: 'year semester',
          model: 'Timetable'
        });
      
      res.json(assignments);
    } catch (error) {
      console.error('Error in getAllAssignments:', error);
      res.status(500).json({ message: 'Error fetching assignments', error: error.message });
    }
  },

  // Get assignment for a specific student
  getStudentAssignment: async (req, res) => {
    try {
      const { studentId } = req.params;
      const assignment = await StudentTimetableAssignment.findOne({ studentId })
        .populate({
          path: 'timetableId',
          select: 'year semester',
          model: 'Timetable'
        });
      
      if (!assignment) {
        return res.status(404).json({ message: 'No timetable assigned' });
      }

      res.json(assignment);
    } catch (error) {
      console.error('Error in getStudentAssignment:', error);
      res.status(500).json({ message: 'Error fetching student assignment', error: error.message });
    }
  }
};

export default TimetableAssignmentController; 