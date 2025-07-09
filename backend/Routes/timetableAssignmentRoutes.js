import express from 'express';
import { protect } from '../Middleware/authMiddleware.js';
import TimetableAssignmentController from '../Controllers/TimetableAssignmentController.js';

const router = express.Router();

// Get all available timetables
router.get('/timetables', protect, TimetableAssignmentController.getAllTimetables);

// Assign timetable to student
router.post('/assign', protect, TimetableAssignmentController.assignTimetable);

// Get all timetable assignments
router.get('/assignments', protect, TimetableAssignmentController.getAllAssignments);

// Get assignment for a specific student (by MongoDB _id or studentId string)
router.get('/student/:studentId', protect, TimetableAssignmentController.getStudentAssignment);

export default router; 