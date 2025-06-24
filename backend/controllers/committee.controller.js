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

// Get all users in a committee (including chairman and convener)
exports.getCommitteeUsers = async (req, res) => {
    try {
        const { id } = req.params;
        const committee = await Committee.findById(id);
        if (!committee) return res.status(404).json({ message: 'Committee not found' });
        // Compose all users: chairman, convener, and members
        const users = [
            { name: committee.chairman.name, email: committee.chairman.email, role: 'chairman', _id: 'chairman' },
            { name: committee.convener.name, email: committee.convener.email, role: 'convener', _id: 'convener' },
            ...committee.members.map(m => ({ ...m.toObject(), role: m.role || 'member' }))
        ];
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Add a user to a committee
exports.addUserToCommittee = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, name, role } = req.body;
        if (!email || !name || !role) return res.status(400).json({ message: 'Missing fields' });
        const committee = await Committee.findById(id);
        if (!committee) return res.status(404).json({ message: 'Committee not found' });
        // Prevent duplicate
        if (committee.members.some(m => m.email === email)) {
            return res.status(400).json({ message: 'User already in committee' });
        }
        const newMember = { name, email, role };
        committee.members.push(newMember);
        await committee.save();
        res.status(201).json(newMember);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Remove a user from a committee
exports.removeUserFromCommittee = async (req, res) => {
    try {
        const { id, userId } = req.params;
        const committee = await Committee.findById(id);
        if (!committee) return res.status(404).json({ message: 'Committee not found' });
        if (userId === 'chairman') {
            committee.chairman = { name: 'Removed', email: 'Removed' };
            await committee.save();
            return res.json({ message: 'Chairman removed from committee' });
        }
        if (userId === 'convener') {
            committee.convener = { name: 'Removed', email: 'Removed' };
            await committee.save();
            return res.json({ message: 'Convener removed from committee' });
        }
        const before = committee.members.length;
        committee.members = committee.members.filter(m => m._id.toString() !== userId);
        if (committee.members.length === before) {
            return res.status(404).json({ message: 'User not found in committee' });
        }
        await committee.save();
        res.json({ message: 'User removed from committee' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all committees for a user (by userId)
exports.getCommitteesForUser = async (req, res) => {
    try {
        const { userId } = req.query;
        console.log('getCommitteesForUser: received userId:', userId, 'type:', typeof userId);
        if (!userId) return res.status(400).json({ message: 'userId is required' });
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'userId is not a valid ObjectId', received: userId });
        }
        const objectId = mongoose.Types.ObjectId(userId);
        const committees = await Committee.find({
            $or: [
                { 'chairman.userId': objectId },
                { 'convener.userId': objectId },
                { 'members.userId': objectId }
            ]
        });
        res.status(200).json(committees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};