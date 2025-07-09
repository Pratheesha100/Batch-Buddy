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
      let { studentId } = req.params;
      console.log('[TimetableAssignmentController] Lookup for studentId:', studentId);
      // If studentId is not a valid ObjectId, treat it as a studentId string
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(studentId);
      if (!isObjectId) {
        // Lookup UserLog by studentId string
        const user = await UserLog.findOne({ studentId });
        if (!user) {
          console.log('[TimetableAssignmentController] User not found for studentId string:', studentId);
          return res.status(404).json({ message: 'User not found' });
        }
        studentId = user._id;
      }
      console.log('[TimetableAssignmentController] Final lookup with ObjectId:', studentId);
      const assignment = await StudentTimetableAssignment.findOne({ studentId })
        .populate({
          path: 'timetableId',
          model: 'Timetable'
        });
      
      if (!assignment) {
        // Log all existing assignment studentIds for debug
        const allAssignments = await StudentTimetableAssignment.find({});
        console.log('[TimetableAssignmentController] No assignment found. Existing assignment studentIds:', allAssignments.map(a => a.studentId.toString()));
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