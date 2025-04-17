const express = require('express');
const router = express.Router();
const minutesController = require('../controllers/minutes.controller');
const { authUser } = require('../middlewares/auth.middleware');

router.use(authUser);

router.post('/create', minutesController.createMinutes);
router.get('/committee/:committeeId', minutesController.getMinutesByCommittee);
router.put('/:id', minutesController.updateMinutes);
router.delete('/:id', minutesController.deleteMinutes);

module.exports = router;