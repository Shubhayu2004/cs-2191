const express = require('express');
const router = express.Router();
const minutesController = require('../controllers/minutes.controller');
const { authUser } = require('../middlewares/auth.middleware');
const { requireCommitteeRole } = require('../middlewares/committeeRole.middleware');

router.use(authUser);

// Create a real MoM (Minutes of Meeting)
router.post('/create', minutesController.createMinutes);
router.get('/committee/:committeeId', minutesController.getMinutesByCommittee);
// Only convener can update MoM
router.put('/:id', requireCommitteeRole('convener'), minutesController.updateMinutes);
router.delete('/:id', minutesController.deleteMinutes);
router.post('/:meetingId/suggestions', minutesController.addSuggestion);
router.get('/:meetingId/suggestions', minutesController.getSuggestionsByMeeting);

module.exports = router;