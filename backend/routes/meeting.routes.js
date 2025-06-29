const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meeting.controller');
const { authUser } = require('../middlewares/auth.middleware');
const { requireCommitteeRole } = require('../middlewares/committeeRole.middleware');

router.use(authUser);

// Only convener can schedule meetings
router.post('/schedule', requireCommitteeRole('convener'), meetingController.scheduleMeeting);
// Get upcoming meetings for a committee
router.get('/committee/:committeeId', meetingController.getUpcomingMeetingsByCommittee);

module.exports = router;
