const express = require('express');
const router = express.Router();
const inviteController = require('../controller/inviteController');
const { protect } = require('../middleware/auth');

// POST route for sending invites - must come before GET routes with similar patterns
router.post('/:boardId', protect, inviteController.sendInvite);

// GET routes
router.get('/accept/:token', protect, inviteController.acceptInvite);
router.get('/:boardId/members', protect, inviteController.getBoardMembers);

module.exports = router;

