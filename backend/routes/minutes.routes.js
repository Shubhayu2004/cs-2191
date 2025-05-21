const express = require('express');
const router = express.Router();
const minutesController = require('../controllers/minutes.controller');
const { authUser } = require('../middlewares/auth.middleware');

router.use(authUser);

// Create a real MoM (Minutes of Meeting)
router.post('/create', minutesController.createMinutes);
router.get('/committee/:committeeId', minutesController.getMinutesByCommittee);
router.put('/:id', minutesController.updateMinutes);
router.delete('/:id', minutesController.deleteMinutes);
router.post('/:meetingId/suggestions', minutesController.addSuggestion);

module.exports = router;