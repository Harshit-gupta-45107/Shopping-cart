// const db = require('../config/db');
import db from '../config/db.js';

class Notification {
    static async create(userId, type, title, message, relatedJournalId) {
        const result = await db.query(
            `INSERT INTO notifications (user_id, type, title, message, related_journal_id)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [userId, type, title, message, relatedJournalId]
        );
        return result.rows[0];
    }

    static async getUserNotifications(userId, limit = 20, offset = 0) {
        const result = await db.query(
            `SELECT n.*, j.title as journal_title
             FROM notifications n
             LEFT JOIN journals j ON n.related_journal_id = j.id
             WHERE n.user_id = $1
             ORDER BY n.created_at DESC
             LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );
        return result.rows;
    }

    static async markAsRead(notificationId, userId) {
        const result = await db.query(
            `UPDATE notifications 
             SET status = 'read', read_at = CURRENT_TIMESTAMP
             WHERE id = $1 AND user_id = $2
             RETURNING *`,
            [notificationId, userId]
        );
        return result.rows[0];
    }

    static async getUnreadCount(userId) {
        const result = await db.query(
            `SELECT COUNT(*) as count
             FROM notifications
             WHERE user_id = $1 AND status = 'unread'`,
            [userId]
        );
        return parseInt(result.rows[0].count);
    }
}

// module.exports = Notification;
export default Notification;
