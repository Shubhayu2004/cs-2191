const userModel = require('../models/user.model');
const userService = require('../services/user.service');
const { validationResult } = require('express-validator');
const blackListTokenModel = require('../models/blacklistToken.model');

module.exports.registerUser = async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { fullname, email, password } = req.body;

    const hashedPassword = await userModel.hashPassword(password);

    const user = await userService.createUser({
        firstname: fullname.firstname,
        lastname: fullname.lastname,
        email,
        password: hashedPassword
    });

    const token = user.generateAuthToken();

    res.status(201).json({ token, user });


}
module.exports.loginUser = async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select('+password');

    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = user.generateAuthToken();

    res.cookie('token', token);

    res.status(200).json({ token, user });
}
module.exports.getUserProfile = async (req, res, next) => {

    res.status(200).json(req.user);

}
module.exports.logoutUser = async (req, res, next) => {
    res.clearCookie('token');
    const token = req.cookies.token || req.headers.authorization.split(' ')[ 1 ];

    await blackListTokenModel.create({ token });

    res.status(200).json({ message: 'Logged out' });

}
module.exports.updateUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    try {
        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        user.status = role;
        await user.save();

        return res.status(200).json({ 
            message: 'User role updated successfully.',
            user: {
                _id: user._id,
                email: user.email,
                status: user.status,
                fullname: user.fullname
            }
        });
    } catch (err) {
        console.error('Role update error:', err);
        return res.status(500).json({ message: 'Server error.' });
    }
}
module.exports.getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find().select('-password');
        return res.status(200).json(users);
    } catch (err) {
        console.error('Get users error:', err);
        return res.status(500).json({ message: 'Server error.' });
    }
}
module.exports.getUserNames = async (req, res) => {
    try {
        const users = await userModel.find().select('fullname email status');
        return res.status(200).json(users.fullname);
    } catch (err) {
        console.error('Get user names error:', err);
        return res.status(500).json({ message: 'Server error.' });
    }

}
module.exports.getUserIdsByEmails = async (emails) => {
    // Accepts array of emails, returns array of user _ids
    if (!Array.isArray(emails) || emails.length === 0) {
        console.warn('getUserIdsByEmails called with empty or invalid emails:', emails);
        return [];
    }
    const users = await userModel.find({ email: { $in: emails } }).select('_id email');
    if (users.length !== emails.length) {
        console.warn('Some emails not found in user collection:', emails, 'Found:', users.map(u => u.email));
    }
    return users.map(u => u._id);
};