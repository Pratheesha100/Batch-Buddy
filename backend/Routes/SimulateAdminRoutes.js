import express from 'express';
import { getAllStudents } from '../Controllers/UserLogController.js';
import { protect } from '../Middleware/authMiddleware.js';

const router = express.Router();

// Protected admin routes
router.get('/students', protect, getAllStudents);

export default router; 