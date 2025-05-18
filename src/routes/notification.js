const express = require('express');
const { authenticate } = require('../middlewares/auth');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

// Protected routes - require authentication
router.use(authenticate);

// Get user's notifications
router.get('/', notificationController.getNotifications);

// Mark notification as read
router.put('/:id/read', notificationController.markAsRead);

module.exports = router;
