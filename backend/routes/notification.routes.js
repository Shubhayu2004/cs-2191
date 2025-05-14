const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authUser } = require('../middlewares/auth.middleware'); // Import the actual authUser middleware

// GET /api/notifications - Get all notifications for the logged-in user
router.get('/', authUser, notificationController.getNotificationsForUser);

// PUT /api/notifications/read - Mark specified notifications as read
router.put('/read', authUser, notificationController.markNotificationsAsRead);

module.exports = router; 