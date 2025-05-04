import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getStudentDetails,
  getAllStudents,
  checkStudent,
  checkUserLogin
} from '../Controllers/UserLogController.js';
import { protect, admin } from '../Middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/check-student/:studentId', checkStudent);
router.get('/check-login/:studentId', checkUserLogin);
router.get('/student/:studentId', getStudentDetails);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// Admin routes
router.get('/students', protect, admin, getAllStudents);

export default router; 