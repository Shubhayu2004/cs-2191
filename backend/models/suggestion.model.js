const mongoose = require('mongoose');

const suggestionSchema = new mongoose.Schema({
    meetingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MinutesOfMeeting',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', // lowercase to match model registration
        required: true
    },
    suggestion: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Suggestion = mongoose.model('Suggestion', suggestionSchema);

module.exports = Suggestion;
