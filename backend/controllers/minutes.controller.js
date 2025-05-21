require('../models/user.model'); // Ensure User model is registered before any population
const MinutesOfMeeting = require('../models/MinutesOfMeeting');
const Suggestion = require('../models/suggestion.model');

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
            attendees: [req.user._id], // Optionally add convener as attendee
            createdBy: req.user._id,
            status: 'published'
        });
        await minutes.save();
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
        res.status(201).json(newSuggestion);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
  createMinutes,
  getMinutesByCommittee,
  updateMinutes,
  deleteMinutes,
  addSuggestion
};