const BoardInvite = require('../models/BoardInvite');
const Board = require('../models/Board');
const User = require('../models/User');
const crypto = require('crypto');
const emailService = require('../services/emailService');

// Send invite
exports.sendInvite = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
      });
    }

    // Check if user is owner or member
    const userId = String(req.userId);
    const ownerId = String(board.owner);
    const isOwner = ownerId === userId;
    const isMember = board.members && board.members.length > 0 && 
                     board.members.some(m => {
                       const memberId = m._id ? String(m._id) : String(m);
                       return memberId === userId;
                     });
    const hasAccess = isOwner || isMember;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this board',
      });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if user exists (optional - we allow inviting non-existent users)
    const user = await User.findOne({ email: normalizedEmail });
    
    // If user exists, check if they're already owner or member
    if (user) {
      const invitedUserId = String(user._id);
      const boardOwnerId = String(board.owner);
      
      // Check if user is the owner
      if (boardOwnerId === invitedUserId) {
        return res.status(400).json({
          success: false,
          message: 'User is already the owner of this board',
        });
      }

      // Check if already a member
      const isAlreadyMember = board.members && board.members.length > 0 && 
                              board.members.some(m => {
                                const memberId = m._id ? String(m._id) : String(m);
                                return memberId === invitedUserId;
                              });
      
      if (isAlreadyMember) {
        return res.status(400).json({
          success: false,
          message: 'User is already a member of this board',
        });
      }
    }

    // Check if already invited (use normalized email for consistency)
    const existingInvite = await BoardInvite.findOne({
      board: boardId,
      email: normalizedEmail,
      status: 'pending',
    });

    if (existingInvite) {
      return res.status(400).json({
        success: false,
        message: 'Invite already sent to this email',
      });
    }

    // Create invite (works for both existing and non-existing users)
    const token = crypto.randomBytes(32).toString('hex');
    const invite = await BoardInvite.create({
      board: boardId,
      email: normalizedEmail,
      invitedBy: req.userId,
      token,
    });

    // Send email notification (optional - works without email config)
    const inviter = await User.findById(req.userId);
    const inviterName = inviter ? inviter.name : 'Someone';
    await emailService.sendInvitationEmail(normalizedEmail, board.name, inviterName, token);

    res.status(201).json({
      success: true,
      message: user 
        ? 'Invitation sent successfully' 
        : 'Invitation sent successfully. The user will be able to accept it after signing up.',
      data: { invite },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error sending invitation',
    });
  }
};

// Accept invite
exports.acceptInvite = async (req, res) => {
  try {
    const { token } = req.params;

    const invite = await BoardInvite.findOne({ token, status: 'pending' });
    if (!invite) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired invitation',
      });
    }

    // Get the authenticated user
    const authenticatedUser = await User.findById(req.userId);
    if (!authenticatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify that the authenticated user's email matches the invite email
    const normalizedInviteEmail = invite.email.toLowerCase().trim();
    const normalizedUserEmail = authenticatedUser.email.toLowerCase().trim();
    
    if (normalizedUserEmail !== normalizedInviteEmail) {
      return res.status(403).json({
        success: false,
        message: 'This invitation was sent to a different email address. Please log in with the email address that received the invitation.',
      });
    }

    // Check if board exists
    const board = await Board.findById(invite.board);
    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
      });
    }

    // Check if user is already a member
    const userId = String(authenticatedUser._id);
    const ownerId = String(board.owner);
    const isOwner = ownerId === userId;
    const isAlreadyMember = board.members && board.members.length > 0 && 
                            board.members.some(m => {
                              const memberId = m._id ? String(m._id) : String(m);
                              return memberId === userId;
                            });

    if (isOwner) {
      // If user is the owner, mark invite as accepted but don't add them again
      invite.status = 'accepted';
      await invite.save();
      return res.status(200).json({
        success: true,
        message: 'You are already the owner of this board',
        data: { board },
      });
    }

    if (isAlreadyMember) {
      invite.status = 'accepted';
      await invite.save();
      return res.status(200).json({
        success: true,
        message: 'You are already a member of this board',
        data: { board },
      });
    }

    // Add user to board members
    board.members.push(authenticatedUser._id);
    await board.save();

    invite.status = 'accepted';
    await invite.save();

    res.status(200).json({
      success: true,
      message: 'Invitation accepted successfully',
      data: { board },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error accepting invitation',
    });
  }
};

// Get board members
exports.getBoardMembers = async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        owner: board.owner,
        members: board.members,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching members',
    });
  }
};

// Get pending invitations for the authenticated user
exports.getMyPendingInvites = async (req, res) => {
  try {
    const authenticatedUser = await User.findById(req.userId);
    if (!authenticatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const normalizedUserEmail = authenticatedUser.email.toLowerCase().trim();

    // Find all pending invites for this user's email
    const invites = await BoardInvite.find({
      email: normalizedUserEmail,
      status: 'pending',
    })
      .populate({
        path: 'board',
        select: 'name description color owner',
        populate: {
          path: 'owner',
          select: 'name email',
        },
      })
      .populate({
        path: 'invitedBy',
        select: 'name email',
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { invites },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching invitations',
    });
  }
};

