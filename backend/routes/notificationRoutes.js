const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Remove test-email route
// router.post('/test-email', notificationController.testEmail);

// Test push notification
router.post('/test-push', notificationController.testPush);

module.exports = router; 