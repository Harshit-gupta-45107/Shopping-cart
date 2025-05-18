const Notification = require('../models/notification');

const notificationController = {
    // Get user's notifications
    getNotifications: async (req, res) => {
        try {
            const userId = req.user.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const offset = (page - 1) * limit;

            const notifications = await Notification.getUserNotifications(userId, limit, offset);
            const unreadCount = await Notification.getUnreadCount(userId);

            res.json({
                notifications,
                unreadCount,
                page,
                limit
            });
        } catch (error) {
            console.error('Get notifications error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Mark notification as read
    markAsRead: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const notification = await Notification.markAsRead(id, userId);
            if (!notification) {
                return res.status(404).json({ error: 'Notification not found' });
            }

            res.json(notification);
        } catch (error) {
            console.error('Mark notification as read error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = notificationController;
