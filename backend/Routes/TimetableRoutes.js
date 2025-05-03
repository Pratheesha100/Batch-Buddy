import express from 'express';
import { getTimetable, saveTimetable } from '../Controllers/TimetableController.js';
import { protect } from '../Middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getTimetable);      // GET /api/timetable?year=1&semester=1st
router.post('/', protect, saveTimetable);    // POST /api/timetable

export default router; 