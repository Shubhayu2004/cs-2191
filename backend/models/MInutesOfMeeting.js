const mongoose = require('mongoose');

const minutesOfMeetingSchema = new mongoose.Schema({
    committeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Committee',
        required: true
    },
    topic: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    minutesText: {
        type: String,
        required: true
    },
    attendees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user' // lowercase to match model registration
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', // lowercase to match model registration
        required: true
    },
    lastEditedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user' // lowercase to match model registration
    },
    lastEditedAt: {
        type: Date
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft'
    }
}, {
    timestamps: true
});

const MinutesOfMeeting = mongoose.model('MinutesOfMeeting', minutesOfMeetingSchema);

module.exports = MinutesOfMeeting;