const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', // Corrected to lowercase 'user'
        required: true
    },
    message: {
        type: String,
        required: true
    },
    committeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Committee', // Assuming your committee model is named 'Committee'
        required: false // Optional, but useful for linking
    },
    isRead: {
        type: Boolean,
        default: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Notification', notificationSchema); 