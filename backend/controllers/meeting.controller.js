const Meeting = require('../models/Meeting');
const Committee = require('../models/committee.model');

// Schedule a new meeting (no MoM yet)
const scheduleMeeting = async (req, res) => {
    try {
        const { committeeId, topic, date, time } = req.body;
        if (!committeeId || !topic || !date || !time) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        const meeting = new Meeting({
            committeeId,
            topic,
            date,
            time,
            scheduledBy: req.user._id,
            attendees: [req.user._id],
            status: 'scheduled'
        });
        await meeting.save();
        res.status(201).json(meeting);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all upcoming meetings for a committee
const getUpcomingMeetingsByCommittee = async (req, res) => {
    try {
        const { committeeId } = req.params;
        const now = new Date();
        const meetings = await Meeting.find({
            committeeId,
            date: { $gte: now },
            status: 'scheduled'
        }).sort({ date: 1 });
        res.status(200).json(meetings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    scheduleMeeting,
    getUpcomingMeetingsByCommittee
};
