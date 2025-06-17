const Committee = require('../models/committee.model');
const mongoose = require('mongoose');
const { sendNotification } = require('../controllers/minutes.controller');
const { getUserIdsByEmails } = require('./user.controller');

exports.createCommittee = async (req, res) => {
    try {
        console.log('createCommittee: called with body:', req.body);
        const { committeeName, committeePurpose, chairman, convener, members } = req.body;
        
        // Validate required fields
        if (!committeeName || !committeePurpose || !chairman || !convener) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                required: ['committeeName', 'committeePurpose', 'chairman', 'convener']
            });
        }

        const committee = new Committee({
            committeeName, 
            committeePurpose, 
            chairman: {
                name: chairman.name,
                email: chairman.email
            }, 
            convener: {
                name: convener.name,
                email: convener.email
            }, 
            members: members.map(member => ({
                name: member.name,
                email: member.email,
                role: member.role || 'member'
            }))
        });

        await committee.save();

        // Try notification delivery, but do not fail committee creation if notification fails
        try {
            console.log('createCommittee: preparing to notify members');
            const allMemberEmails = [chairman.email, convener.email, ...members.map(m => m.email)];
            console.log('createCommittee: allMemberEmails:', allMemberEmails);
            const userIds = await getUserIdsByEmails(allMemberEmails);
            console.log('createCommittee: userIds from emails:', userIds);
            const message = `You have been added to the committee: ${committee.committeeName}`;
            const link = `/committeeDashboard/${committee._id}`;
            console.log('createCommittee: calling sendNotification');
            await sendNotification(userIds, message, link);
            console.log('createCommittee: sendNotification completed');
        } catch (notifyErr) {
            console.error('Notification delivery failed:', notifyErr);
            // Optionally, you could log this to a DB or monitoring service
        }
        res.status(201).json(committee);
    } catch (error) {
        console.error('Committee creation error:', error);
        res.status(400).json({ 
            message: 'Error creating committee',
            error: error.message 
        });
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

exports.getCommitteeById = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                message: 'Invalid committee ID format',
                receivedId: id 
            });
        }

        const committee = await Committee.findById(id);
        
        if (!committee) {
            return res.status(404).json({ 
                message: 'Committee not found',
                receivedId: id 
            });
        }
        
        res.status(200).json(committee);
    } catch (error) {
        console.error('Committee fetch error:', error);
        res.status(500).json({ 
            message: 'Server error while fetching committee',
            error: error.message 
        });
    }
};

exports.updateCommittee = async (req, res) => {
    try {
        const committee = await Committee.findByIdAndUpdate(
            req.params.id, 
            req.body,
            { new: true }
        );
        if (!committee) {
            return res.status(404).json({ message: 'Committee not found' });
        }
        res.status(200).json(committee);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteCommittee = async (req, res) => {
    try {
        const committee = await Committee.findByIdAndDelete(req.params.id);
        if (!committee) {
            return res.status(404).json({ message: 'Committee not found' });
        }
        res.status(200).json({ message: 'Committee deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};