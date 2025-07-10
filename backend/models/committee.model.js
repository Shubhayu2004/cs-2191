const mongoose = require('mongoose');

// Define the schema for members
const memberSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, enum: ['member', 'convener', 'chairman'], required: true }
});

// Define the schema for past meetings
const pastMeetingSchema = new mongoose.Schema({
    minutes: { type: String },
    summary: { type: String },
    date: { type: Date }, // Date of the meeting
    time: { type: String } // Time of the meeting
});

// Define the schema for upcoming meetings
const upcomingMeetingSchema = new mongoose.Schema({
    date: { type: Date }, // Date of the meeting
    time: { type: String } // Time of the meeting
});

// Define the main committee schema
const committeeSchema = new mongoose.Schema({
    committeeName: { type: String, required: true },
    committeePurpose: { type: String, required: true },
    chairman: { 
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
        name: { type: String, required: true },
        email: { type: String, required: true }
    },
    convener: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }, // not required at creation
        name: { type: String },
        email: { type: String }
    },
    members: [memberSchema],
    pastMeetings: [pastMeetingSchema], // Optional array of past meetings
    upcomingMeetings: [upcomingMeetingSchema], // Optional array of upcoming meetings
    pendingProposal: {
        convener: {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
            name: String,
            email: String
        },
        members: [memberSchema],
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
        feedback: { type: String }
    }
});

// Create and export the Committee model
module.exports = mongoose.model('Committee', committeeSchema);