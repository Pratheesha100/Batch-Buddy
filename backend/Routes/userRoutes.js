import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  checkStudent,
  checkUserLogin
} from '../Controllers/UserLogController.js';
import { protect } from '../Middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/check-student/:studentId', checkStudent);
router.get('/check-login/:studentId', checkUserLogin);

// Protected routes
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

export default router; 