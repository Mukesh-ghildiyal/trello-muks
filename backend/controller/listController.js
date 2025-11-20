const List = require('../models/List');
const Board = require('../models/Board');
const Card = require('../models/Card');

// Create list
exports.createList = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'List title is required',
      });
    }

    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
      });
    }

    // Check access - allow owner and members
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

    const listCount = await List.countDocuments({ board: boardId });
    const list = await List.create({
      title,
      board: boardId,
      position: listCount,
      cards: [],
    });

    board.lists.push(list._id);
    await board.save();

    res.status(201).json({
      success: true,
      message: 'List created successfully',
      data: { list },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating list',
    });
  }
};

// Update list
exports.updateList = async (req, res) => {
  try {
    const { listId } = req.params;
    const { title, position } = req.body;

    const list = await List.findById(listId).populate('board');
    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found',
      });
    }

    // Check access - allow owner and members
    const board = list.board;
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

    if (title) list.title = title;
    if (position !== undefined) list.position = position;

    await list.save();

    res.status(200).json({
      success: true,
      message: 'List updated successfully',
      data: { list },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating list',
    });
  }
};

// Delete list
exports.deleteList = async (req, res) => {
  try {
    const list = await List.findById(req.params.listId).populate('board');
    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found',
      });
    }

    // Check access - allow owner and members
    const board = list.board;
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

    // Delete all cards
    await Card.deleteMany({ list: list._id });

    // Remove from board
    board.lists = board.lists.filter(l => l.toString() !== list._id.toString());
    await board.save();

    await List.findByIdAndDelete(req.params.listId);

    res.status(200).json({
      success: true,
      message: 'List deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting list',
    });
  }
};

