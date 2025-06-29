const Committee = require('../models/committee.model');

// Dissolve committee (only chairman)
exports.dissolveCommittee = async (req, res) => {
  try {
    await req.committee.deleteOne();
    // Optionally: send notifications to all members
    res.status(200).json({ message: 'Committee dissolved successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Schedule meeting (only convener)
exports.scheduleMeeting = async (req, res) => {
  try {
    const { date, time } = req.body;
    req.committee.upcomingMeetings.push({ date, time });
    await req.committee.save();
    // Optionally: send notifications to all members
    res.status(200).json({ message: 'Meeting scheduled.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Edit MoM (only convener)
exports.editMoM = async (req, res) => {
  try {
    const { minutes, summary, date, time } = req.body;
    req.committee.pastMeetings.push({ minutes, summary, date, time });
    await req.committee.save();
    // Optionally: send notifications to all members
    res.status(200).json({ message: 'MoM added.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Suggest for MoM (any member)
exports.suggestMoM = async (req, res) => {
  try {
    const { suggestion } = req.body;
    if (!suggestion) return res.status(400).json({ message: 'Suggestion is required.' });
    // You may want to store suggestions in a separate collection or in the committee
    req.committee.suggestions = req.committee.suggestions || [];
    req.committee.suggestions.push({
      userId: req.user._id,
      suggestion,
      date: new Date()
    });
    await req.committee.save();
    // Optionally: send notifications to convener/chairman
    res.status(200).json({ message: 'Suggestion submitted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
