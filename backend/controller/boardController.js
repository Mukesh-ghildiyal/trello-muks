const Board = require('../models/Board');
const List = require('../models/List');
const Card = require('../models/Card');
const User = require('../models/User');

// Get all boards for a user
exports.getBoards = async (req, res) => {
  try {
    const boards = await Board.find({
      $or: [
        { owner: req.userId },
        { members: req.userId },
      ],
    })
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: { boards },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching boards',
    });
  }
};

// Get single board with lists and cards
exports.getBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
      });
    }

    // Normalize IDs to strings for comparison
    const userId = String(req.userId);
    const ownerId = String(board.owner);
    
    // Check if user is owner
    const isOwner = ownerId === userId;
    
    // Check if user is member (handle both populated and unpopulated)
    let isMember = false;
    if (board.members && board.members.length > 0) {
      isMember = board.members.some(m => {
        if (!m) return false;
        const memberId = m._id ? String(m._id) : String(m);
        return memberId === userId;
      });
    }

    const hasAccess = isOwner || isMember;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this board',
      });
    }

    // Populate after access check
    await board.populate('owner', 'name email');
    await board.populate('members', 'name email');

    // Get lists with cards
    const lists = await List.find({ board: board._id })
      .populate({
        path: 'cards',
        populate: {
          path: 'createdBy',
          select: 'name email',
        },
      })
      .sort({ position: 1 });

    res.status(200).json({
      success: true,
      data: {
        board,
        lists,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching board',
    });
  }
};

// Create new board
exports.createBoard = async (req, res) => {
  try {
    const { name, description, color } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Board name is required',
      });
    }

    const board = await Board.create({
      name,
      description,
      color: color || 'from-blue-500 to-indigo-600',
      owner: req.userId,
      members: [],
      lists: [],
    });

    // Create default lists
    const defaultLists = [
      { title: 'To Do', position: 0 },
      { title: 'In Progress', position: 1 },
      { title: 'Done', position: 2 },
    ];

    for (const listData of defaultLists) {
      const list = await List.create({
        title: listData.title,
        board: board._id,
        position: listData.position,
        cards: [],
      });
      board.lists.push(list._id);
    }

    await board.save();

    const populatedBoard = await Board.findById(board._id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    res.status(201).json({
      success: true,
      message: 'Board created successfully',
      data: { board: populatedBoard },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating board',
    });
  }
};

// Update board
exports.updateBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
      });
    }

    if (board.owner.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the owner can update the board',
      });
    }

    const { name, description, color } = req.body;
    if (name) board.name = name;
    if (description !== undefined) board.description = description;
    if (color) board.color = color;

    await board.save();

    res.status(200).json({
      success: true,
      message: 'Board updated successfully',
      data: { board },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating board',
    });
  }
};

// Delete board
exports.deleteBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
      });
    }

    if (board.owner.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the owner can delete the board',
      });
    }

    // Delete all lists and cards
    const lists = await List.find({ board: board._id });
    for (const list of lists) {
      await Card.deleteMany({ list: list._id });
    }
    await List.deleteMany({ board: board._id });

    await Board.findByIdAndDelete(req.params.boardId);

    res.status(200).json({
      success: true,
      message: 'Board deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting board',
    });
  }
};

