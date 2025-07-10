// --- Chairman proposes convener and members ---
const Notification = require('../models/notification.model');
const User = require('../models/user.model');

// Chairman proposes convener and members for approval
exports.proposeMembers = async (req, res) => {
    try {
        const { committeeId, convener, members } = req.body;
        if (!committeeId || !convener || !members || !Array.isArray(members) || members.length === 0) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const committee = await Committee.findById(committeeId);
        if (!committee) return res.status(404).json({ message: 'Committee not found' });
        // Only chairman can propose
        if (String(committee.chairman.email) !== req.user.email) {
            return res.status(403).json({ message: 'Only the chairman can propose members' });
        }
        // Store proposal
        committee.pendingProposal = {
            convener,
            members,
            status: 'pending',
            feedback: ''
        };
        await committee.save();
        // Notify all admins
        const admins = await User.find({ status: 'admin' });
        const message = `Chairman of committee '${committee.committeeName}' has proposed a convener and members for approval.`;
        const link = `/committeeDashboard/${committee._id}`;
        for (const admin of admins) {
            await Notification.create({ userId: admin._id, message, link });
        }
        res.status(200).json({ message: 'Proposal sent to admin for approval.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin approves proposal
exports.approveProposal = async (req, res) => {
    try {
        const { committeeId } = req.body;
        const committee = await Committee.findById(committeeId);
        if (!committee || !committee.pendingProposal) return res.status(404).json({ message: 'No pending proposal found' });
        // Only admin can approve
        if (req.user.status !== 'admin') return res.status(403).json({ message: 'Only admin can approve proposals' });
        // Set convener and members
        committee.convener = committee.pendingProposal.convener;
        committee.members = committee.pendingProposal.members;
        committee.pendingProposal.status = 'approved';
        await committee.save();
        // Notify chairman
        const chairmanUser = await User.findOne({ email: committee.chairman.email });
        if (chairmanUser) {
            await Notification.create({
                userId: chairmanUser._id,
                message: `Your proposal for convener and members in committee '${committee.committeeName}' was approved by admin.`,
                link: `/committeeDashboard/${committee._id}`
            });
        }
        res.status(200).json({ message: 'Proposal approved and committee updated.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin rejects proposal
exports.rejectProposal = async (req, res) => {
    try {
        const { committeeId, feedback } = req.body;
        const committee = await Committee.findById(committeeId);
        if (!committee || !committee.pendingProposal) return res.status(404).json({ message: 'No pending proposal found' });
        if (req.user.status !== 'admin') return res.status(403).json({ message: 'Only admin can reject proposals' });
        committee.pendingProposal.status = 'rejected';
        committee.pendingProposal.feedback = feedback || '';
        await committee.save();
        // Notify chairman
        const chairmanUser = await User.findOne({ email: committee.chairman.email });
        if (chairmanUser) {
            await Notification.create({
                userId: chairmanUser._id,
                message: `Your proposal for convener and members in committee '${committee.committeeName}' was rejected by admin. Feedback: ${feedback}`,
                link: `/committeeDashboard/${committee._id}`
            });
        }
        res.status(200).json({ message: 'Proposal rejected and feedback sent to chairman.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const Committee = require('../models/committee.model');
const mongoose = require('mongoose');
const { sendNotification } = require('../controllers/minutes.controller');
const { getUserIdsByEmails } = require('./user.controller');

exports.createCommittee = async (req, res) => {
    try {
        console.log('createCommittee: called with body:', req.body);
        const { committeeName, committeePurpose, chairman } = req.body;

        // Validate required fields (admin creation: only these are required)
        if (!committeeName || !committeePurpose || !chairman) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                required: ['committeeName', 'committeePurpose', 'chairman']
            });
        }

        // Ensure userId is present for chairman
        if (!chairman.userId) {
            return res.status(400).json({
                message: 'userId is required for chairman',
                chairmanUserId: chairman.userId
            });
        }

        const committee = new Committee({
            committeeName, 
            committeePurpose, 
            chairman: {
                userId: chairman.userId,
                name: chairman.name,
                email: chairman.email
            }
            // convener and members will be added later by chairman proposal/approval flow
        });

        await committee.save();

        // Try notification delivery, but do not fail committee creation if notification fails
        try {
            console.log('createCommittee: preparing to notify chairman');
            const userIds = await getUserIdsByEmails([chairman.email]);
            console.log('createCommittee: userIds from emails:', userIds);
            const message = `You have been added as chairman to the committee: ${committee.committeeName}`;
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
        const { userId, email, name, role } = req.body;
        if (!userId || !email || !name || !role) return res.status(400).json({ message: 'Missing fields (userId, email, name, role required)' });
        const committee = await Committee.findById(id);
        if (!committee) return res.status(404).json({ message: 'Committee not found' });
        // Prevent duplicate
        if (committee.members.some(m => m.email === email)) {
            return res.status(400).json({ message: 'User already in committee' });
        }
        const newMember = { userId, name, email, role };
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
        const objectId = new mongoose.Types.ObjectId(userId); // FIXED: use 'new' keyword
        console.log('Querying committees for userId:', objectId);
        const committees = await Committee.find({
            $or: [
                { 'chairman.userId': objectId },
                { 'convener.userId': objectId },
                { 'members.userId': objectId }
            ]
        });
        res.status(200).json(committees);
    } catch (error) {
        console.error('Error in getCommitteesForUser:', error.stack || error);
        res.status(500).json({ message: error.message, stack: error.stack });
    }
};