const Meeting = require('../models/Meeting');
const Committee = require('../models/committee.model');
const Notification = require('../models/notification.model');
const { getUserIdsByEmails } = require('./user.controller');

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

        // Notify all committee members (except the scheduler) about the new meeting
        const committee = await Committee.findById(committeeId);
        if (committee) {
            // Collect all member emails (chairman, convener, members)
            const allMemberEmails = [committee.chairman.email, committee.convener.email, ...committee.members.map(m => m.email)]
                .filter(email => email !== req.user.email); // Exclude scheduler
            const userIds = await getUserIdsByEmails(allMemberEmails);
            const message = `A new meeting has been scheduled for committee: ${committee.committeeName}`;
            // Link to the calendar for this committee
            const link = `/scheduleCalendar?committeeId=${committeeId}`;
            if (userIds.length > 0) {
                await Notification.insertMany(userIds.map(userId => ({ userId, message, link })));
            }
        }

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
