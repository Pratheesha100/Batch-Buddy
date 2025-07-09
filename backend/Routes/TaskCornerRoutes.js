import express from 'express';
import {
  getTasks,
  getTaskStats,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  getFilteredTasks
} from '../Controllers/TaskCornerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected and require authentication
router.use(protect);

// Task routes
router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/stats')
  .get(getTaskStats);

router.route('/filter')
  .get(getFilteredTasks);

router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

router.route('/:id/status')
  .patch(updateTaskStatus);

export default router;

