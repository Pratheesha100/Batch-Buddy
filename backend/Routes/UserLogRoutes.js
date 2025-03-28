import express from 'express';
import { login, googleAuth, googleCallback } from '../Controllers/UserLogController.js';

const router = express.Router();

// Regular login route
router.post('/login', login);

// Google OAuth routes
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

export default router;
