const Committee = require('../models/committee.model');
const mongoose = require('mongoose');
const Notification = require('../models/notification.model');
const User = require('../models/user.model');

exports.createCommittee = async (req, res) => {
    try {
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
                email: chairman.email,
                contactNumber: chairman.contactNumber || ''
            }, 
            convener: {
                name: convener.name,
                email: convener.email,
                contactNumber: convener.contactNumber || ''
            }, 
            members: members.map(member => ({
                name: member.name,
                email: member.email,
                contactNumber: member.contactNumber || ''
            }))
        });

        await committee.save();

        // --- Start Notification Logic ---
        const involvedEmails = [committee.convener.email];
        committee.members.forEach(member => {
            if (!involvedEmails.includes(member.email)) {
                involvedEmails.push(member.email);
            }
        });

        const usersToNotify = await User.find({ email: { $in: involvedEmails } });

        if (usersToNotify.length > 0) {
            const notifications = usersToNotify.map(user => ({
                userId: user._id,
                committeeId: committee._id,
                message: `You have been added to the committee: "${committee.committeeName}"`
            }));
            await Notification.insertMany(notifications);
        }
        // --- End Notification Logic ---

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