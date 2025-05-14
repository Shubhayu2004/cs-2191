const MinutesOfMeeting = require('../models/MinutesOfMeeting');

exports.createMinutes = async (req, res) => {
    try {
        const { committeeId, topic, date, time, minutesText, attendees } = req.body;
        
        const minutes = new MinutesOfMeeting({
            committeeId,
            topic,
            date,
            time,
            minutesText,
            attendees,
            createdBy: req.user._id,
            status: 'draft'
        });

        await minutes.save();
        res.status(201).json(minutes);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getMinutesByCommittee = async (req, res) => {
    try {
        const { committeeId } = req.params;
        const minutes = await MinutesOfMeeting.find({ committeeId })
            .populate('createdBy', 'name')
            .populate('lastEditedBy', 'name')
            .sort({ date: -1 });
        res.status(200).json(minutes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateMinutes = async (req, res) => {
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

exports.deleteMinutes = async (req, res) => {
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