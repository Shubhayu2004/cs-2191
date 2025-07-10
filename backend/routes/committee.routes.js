// Chairman proposes convener and members
router.post('/propose-members', committeeController.proposeMembers);
// Admin approves/rejects proposal
router.post('/approve-proposal', committeeController.approveProposal);
router.post('/reject-proposal', committeeController.rejectProposal);
const express = require('express');
const router = express.Router();
const committeeController = require('../controllers/committee.controller');
const { authUser } = require('../middlewares/auth.middleware');
const { requireCommitteeRole } = require('../middlewares/committeeRole.middleware');
const committeeRoleActions = require('../controllers/committeeRoleActions.controller');

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
router.delete('/:id', requireCommitteeRole('chairman'), committeeRoleActions.dissolveCommittee);
router.post('/:id/schedule', requireCommitteeRole('convener'), committeeRoleActions.scheduleMeeting);
router.post('/:id/mom', requireCommitteeRole('convener'), committeeRoleActions.editMoM);
router.post('/:id/suggest', requireCommitteeRole('member'), committeeRoleActions.suggestMoM);

// Example for future: router.post('/:id/schedule', requireCommitteeRole('convener'), committeeController.scheduleMeeting);
// Example for future: router.post('/:id/mom', requireCommitteeRole('convener'), committeeController.editMoM);
// Example for future: router.post('/:id/suggest', requireCommitteeRole('member'), committeeController.suggestMoM);

module.exports = router;