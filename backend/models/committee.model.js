const mongoose = require('mongoose');

// Define the schema for members
const memberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    contactNumber: { type: String, default : '' },
    role: { type: String, required: true }
});

// Define the schema for past meetings
const pastMeetingSchema = new mongoose.Schema({
    minutes: { type: String },
    summary: { type: String },
    date: { type: Date },
    time: { type: String },
    suggestions: [{
        user: { type: String }, // email or userId
        suggestion: { type: String },
        date: { type: Date, default: Date.now }
    }]
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
    chairman: { type: memberSchema, required: true },
    convener: { type: memberSchema, required: true },
    members: [memberSchema],
    pastMeetings: [pastMeetingSchema], // Optional array of past meetings
    upcomingMeetings: [upcomingMeetingSchema] // Optional array of upcoming meetings
});


// Create and export the Committee model
module.exports = mongoose.model('Committee', committeeSchema);