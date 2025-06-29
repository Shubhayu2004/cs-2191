const Committee = require('../models/committee.model');

// Middleware to check if the user has the required role for a committee
exports.requireCommitteeRole = (role) => async (req, res, next) => {
  try {
    const committeeId = req.params.committeeId || req.body.committeeId || req.query.committeeId;
    if (!committeeId) return res.status(400).json({ message: 'Committee ID is required' });
    const committee = await Committee.findById(committeeId);
    if (!committee) return res.status(404).json({ message: 'Committee not found' });

    const userId = req.user._id.toString();

    const isChairman = committee.chairman?.userId?.toString() === userId;
    const isConvener = committee.convener?.userId?.toString() === userId;
    const isMember = committee.members?.some(m => m.userId?.toString() === userId);

    if (
      (role === 'chairman' && isChairman) ||
      (role === 'convener' && isConvener) ||
      (role === 'member' && (isMember || isChairman || isConvener))
    ) {
      req.committee = committee;
      return next();
    }
    return res.status(403).json({ message: 'Forbidden: insufficient role for this action' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
