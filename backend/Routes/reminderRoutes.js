import { Router } from 'express';
const router = Router();
import { 
  createReminder, 
  getReminders, 
  getReminder, 
  updateReminder, 
  deleteReminder, 
  toggleReminder, 
  getUpcomingReminders,
  getDueReminders,
  markAsNotified 
} from '../Controllers/reminderController.js';
import { protect } from '../middleware/authMiddleware.js';

// All routes are protected and require authentication
router.use(protect);

// Routes for reminders
router
  .route('/')
  .post(createReminder)
  .get(getReminders);

router
  .route('/upcoming')
  .get(getUpcomingReminders);

router
  .route('/due')
  .get(getDueReminders);

router
  .route('/:id')
  .get(getReminder)
  .put(updateReminder)
  .delete(deleteReminder);

router
  .route('/:id/toggle')
  .patch(toggleReminder);

router
  .route('/:id/notified')
  .patch(markAsNotified);

export default router;
