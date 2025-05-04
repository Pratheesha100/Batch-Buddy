import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  checkStudent,
  checkUserLogin,
  getStudentDetails,
  getAllStudents
} from '../Controllers/UserLogController.js';
import { protect } from '../Middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/check-student/:studentId', checkStudent);
router.get('/check-login/:studentId', checkUserLogin);
router.get('/student/:studentId', getStudentDetails);

// Protected routes
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Admin route to get all students
router.get('/students', protect, getAllStudents);

export default router;


