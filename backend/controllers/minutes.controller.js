require('../models/user.model'); // Ensure User model is registered before any population
const MinutesOfMeeting = require('../models/MinutesOfMeeting');
const Suggestion = require('../models/suggestion.model');
const Notification = require('../models/notification.model');
const { getUserIdsByEmails } = require('./user.controller');

const createMinutes = async (req, res) => {
    try {
        const { committeeId, topic, date, time, minutesText } = req.body;
        if (!committeeId || !topic || !date || !time || !minutesText) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        const minutes = new MinutesOfMeeting({
            committeeId,
            topic,
            date,
            time,
            minutesText,
            attendees: [req.user._id],
            createdBy: req.user._id,
            status: 'published'
        });
        await minutes.save();
        // Notify all committee members (except the convener) about the new MoM
        const committee = await require('../models/committee.model').findById(committeeId);
        if (committee) {
            // Exclude the convener (req.user.email) from notification recipients
            const allMemberEmails = [committee.chairman.email, ...committee.members.map(m => m.email)]
                .filter(email => email !== req.user.email);
            const userIds = await getUserIdsByEmails(allMemberEmails);
            const message = `A new MoM has been created for committee: ${committee.committeeName}`;
            // Link to the committee dashboard for this committee
            const link = `/committeeDashboard/${committeeId}`;
            await sendNotification(userIds, message, link);
        }
        res.status(201).json(minutes);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getMinutesByCommittee = async (req, res) => {
    try {
        const { committeeId } = req.params;
        const minutes = await MinutesOfMeeting.find({ committeeId })
            .populate('createdBy', 'fullname')
            .populate('lastEditedBy', 'fullname')
            .sort({ date: -1 });
        res.status(200).json(minutes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateMinutes = async (req, res) => {
    try {
        const { id } = req.params;
        const update = {
            ...req.body,
            lastEditedBy: req.user._id,
            lastEditedAt: new Date()
        };

        const minutes = await MinutesOfMeeting.findByIdAndUpdate(
            id,
            update,
            { new: true }
        );

        if (!minutes) {
            return res.status(404).json({ message: 'Minutes not found' });
        }

        res.status(200).json(minutes);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteMinutes = async (req, res) => {
    try {
        const minutes = await MinutesOfMeeting.findByIdAndDelete(req.params.id);
        if (!minutes) {
            return res.status(404).json({ message: 'Minutes not found' });
        }
        res.status(200).json({ message: 'Minutes deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addSuggestion = async (req, res) => {
    try {
        const { meetingId } = req.params;
        const { userId, suggestion } = req.body;
        if (!suggestion || !userId) {
            return res.status(400).json({ message: 'Suggestion and userId are required.' });
        }
        const newSuggestion = new Suggestion({
            meetingId,
            userId,
            suggestion
        });
        await newSuggestion.save();
        // Notify the convener of the committee for this meeting
        const mom = await MinutesOfMeeting.findById(meetingId);
        if (mom) {
            const committee = await require('../models/committee.model').findById(mom.committeeId);
            if (committee) {
                const convenerEmail = committee.convener.email;
                const convenerIdArr = await getUserIdsByEmails([convenerEmail]);
                const message = `A new suggestion was submitted: "${suggestion}"`;
                const link = `/committeeDashboard/${committee._id}`;
                await sendNotification(convenerIdArr, message, link);
            }
        }
        res.status(201).json(newSuggestion);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getSuggestionsByMeeting = async (req, res) => {
    try {
        const { meetingId } = req.params;
        const suggestions = await Suggestion.find({ meetingId })
            .populate('userId', 'fullname email')
            .sort({ createdAt: -1 });
        res.status(200).json(suggestions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteSuggestion = async (req, res) => {
    try {
        const suggestion = await Suggestion.findByIdAndDelete(req.params.id);
        if (!suggestion) {
            return res.status(404).json({ message: 'Suggestion not found' });
        }
        res.status(200).json({ message: 'Suggestion deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add this function to send notifications to users
async function sendNotification(userIds, message, link = null) {
    console.log('sendNotification: function called');
    if (!Array.isArray(userIds)) userIds = [userIds];
    console.log('sendNotification: userIds:', userIds, 'message:', message, 'link:', link);
    if (!userIds.length) {
        console.warn('sendNotification called with empty userIds');
        return;
    }
    const notifications = userIds.map(userId => ({ userId, message, link }));
    const result = await Notification.insertMany(notifications);
    console.log('sendNotification: notifications inserted:', result.length);
}

module.exports = {
    createMinutes,
    getMinutesByCommittee,
    updateMinutes,
    deleteMinutes,
    addSuggestion,
    getSuggestionsByMeeting,
    deleteSuggestion,
    sendNotification
};