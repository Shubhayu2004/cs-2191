const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');

module.exports.authUser = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'No auth token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded._id).select('+status');

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        console.log('Authenticated user:', {
            id: user._id,
            status: user.status,
            email: user.email
        });

        req.user = user;
        next();
    } catch (err) {
        console.error('Auth error:', err);
        return res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports.isAdmin = async (req, res, next) => {
    try {
        console.log('User in request:', req.user);
        console.log('User status:', req.user?.status);

        if (!req.user || !req.user.status) {
            return res.status(403).json({ 
                message: 'Access denied - No user or status found',
                debug: { hasUser: !!req.user, status: req.user?.status }
            });
        }

        if (req.user.status !== 'admin') {
            return res.status(403).json({ 
                message: 'Admin rights required',
                debug: { currentRole: req.user.status }
            });
        }

        next();
    } catch (error) {
        console.error('Admin authorization error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};