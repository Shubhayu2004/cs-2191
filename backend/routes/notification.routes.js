const express = require('express');
const router = express.Router();
const Notification = require('../models/notification.model');
const { authUser } = require('../middlewares/auth.middleware');

router.use(authUser);

// Get all notifications for the logged-in user
router.get('/', async (req, res) => {
    try {
        console.log('Fetching notifications for user:', req.user?._id, req.user?.email);
        const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
        console.log('Found notifications:', notifications.length);
        res.status(200).json(notifications);
    } catch (error) {
        console.error('Notification fetch error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Mark a notification as read
router.put('/:id/read', async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { isRead: true },
            { new: true }
        );
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.status(200).json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
