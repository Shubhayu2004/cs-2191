const Notification = require('../models/notification.model');

// Get notifications for the logged-in user
exports.getNotificationsForUser = async (req, res) => {
    try {
        // Assuming your auth middleware adds user to req object (e.g., req.user._id)
        // If your user ID is stored differently (e.g., req.userId), adjust accordingly.
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const userId = req.user._id;

        const notifications = await Notification.find({ userId: userId })
            .sort({ timestamp: -1 }); // Sort by newest first

        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Error fetching notifications', error: error.message });
    }
};

// Mark notifications as read
exports.markNotificationsAsRead = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const userId = req.user._id;
        const { notificationIds } = req.body; // Expecting an array of notification IDs

        if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
            return res.status(400).json({ message: 'Notification IDs are required as an array.' });
        }

        await Notification.updateMany(
            { _id: { $in: notificationIds }, userId: userId }, // Ensure user owns the notifications
            { $set: { isRead: true } }
        );

        res.status(200).json({ message: 'Notifications marked as read' });
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        res.status(500).json({ message: 'Error marking notifications as read', error: error.message });
    }
}; 