const express = require('express');
const router = express.Router();
const committeeController = require('../controllers/committee.controller');
const { authUser } = require('../middlewares/auth.middleware');

router.use(authUser);

router.post('/create', committeeController.createCommittee);
router.get('/user', committeeController.getCommitteesForUser); // <-- moved above /:id
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
router.get('/:id/users', committeeController.getCommitteeUsers);
router.post('/:id/users', committeeController.addUserToCommittee);
router.delete('/:id/users/:userId', committeeController.removeUserFromCommittee);
router.delete('/:id', committeeController.deleteCommittee);
module.exports = router;