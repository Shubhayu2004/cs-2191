const express = require('express');
const router = express.Router();
const committeeController = require('../controllers/committee.controller');
const { authUser } = require('../middlewares/auth.middleware');

router.use(authUser);

router.post('/create', committeeController.createCommittee);
router.get('/', committeeController.getCommittees);
router.get('/:id', 
    [
        authUser,
        (req, res, next) => {
            if (!req.params.id) {
                return res.status(400).json({ message: 'Committee ID is required' });
            }
            next();
        }
    ], 
    committeeController.getCommitteeById
);
router.delete('/:id', committeeController.deleteCommittee);
module.exports = router;