// schema.js

const mongoose = require('mongoose');

// Define the schema for Chairman and Convener
const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    contactNumber: { type: String, required: true }
});

// Define the schema for members
const memberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    contactNumber: { type: String, required: true }
});

// Define the main committee schema
const committeeSchema = new mongoose.Schema({
    committeeName: { type: String, required: true },
    committeePurpose: { type: String, required: true },
    chairman: { type: contactSchema, required: true },
    convener: { type: contactSchema, required: true },
    members: [memberSchema]
});

// Create and export the Committee model
module.exports = mongoose.model('Committee', committeeSchema);
