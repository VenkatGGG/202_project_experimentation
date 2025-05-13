const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { auth } = require('../middleware/auth'); // Corrected import and function name

// Get all notifications for the current user (and unread count)
router.get('/', auth, notificationController.getUserNotifications);

// Mark a specific notification as read
router.patch('/:id/read', auth, notificationController.markNotificationAsRead);

// Mark all notifications for the current user as read
router.patch('/read-all', auth, notificationController.markAllNotificationsAsRead);

module.exports = router;
