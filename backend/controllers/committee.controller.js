const Committee = require('../models/committee.model');

exports.createCommittee = async (req, res) => {
    try {
        const { committeeName, committeePurpose, chairman, convener, members, pastMeetings, upcomingMeetings } = req.body;
        const committee = new Committee({ committeeName, committeePurpose, chairman, convener, members, pastMeetings, upcomingMeetings });
        await committee.save();
        res.status(201).json(committee);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getCommittees = async (req, res) => {
    try {
        const committees = await Committee.find();
        res.status(200).json(committees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};