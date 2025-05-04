import express from 'express';
import {
  getOngoingTasks,
  getOngoingTaskStats,
  createOngoingTask,
  updateOngoingTask,
  deleteOngoingTask,
  updateOngoingTaskStatus,
  getFilteredOngoingTasks
} from '../Controllers/OngoingTaskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected and require authentication
router.use(protect);

// Task routes
router.route('/')
  .get(getOngoingTasks)
  .post(createOngoingTask);

router.route('/stats')
  .get(getOngoingTaskStats);

router.route('/filter')
  .get(getFilteredOngoingTasks);

router.route('/:id')
  .put(updateOngoingTask)
  .delete(deleteOngoingTask);

router.route('/:id/status')
  .patch(updateOngoingTaskStatus);

export default router;
