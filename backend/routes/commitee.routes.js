const express = require('express');
const router = express.Router();
const committeeController = require('../controllers/committee.controller');

router.post('/create', committeeController.createCommittee);
router.get('/', committeeController.getCommittees);

module.exports = router;