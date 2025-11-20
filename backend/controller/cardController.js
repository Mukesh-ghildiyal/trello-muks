const Card = require('../models/Card');
const List = require('../models/List');
const Board = require('../models/Board');

// Create card
exports.createCard = async (req, res) => {
  try {
    const { listId } = req.params;
    const { title, description, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Card title is required',
      });
    }

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

    const cardCount = await Card.countDocuments({ list: listId });
    const card = await Card.create({
      title,
      description: description || '',
      list: listId,
      board: board._id,
      position: cardCount,
      dueDate: dueDate ? new Date(dueDate) : null,
      createdBy: req.userId,
    });

    list.cards.push(card._id);
    await list.save();

    const populatedCard = await Card.findById(card._id)
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Card created successfully',
      data: { card: populatedCard },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating card',
    });
  }
};

// Update card
exports.updateCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { title, description, dueDate, listId, position } = req.body;

    const card = await Card.findById(cardId).populate('board');
    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found',
      });
    }

    // Check access - allow owner and members
    const board = card.board;
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

    if (title) card.title = title;
    if (description !== undefined) card.description = description;
    if (dueDate !== undefined) card.dueDate = dueDate ? new Date(dueDate) : null;
    if (position !== undefined) card.position = position;

    // Move card to different list
    if (listId && listId !== card.list.toString()) {
      const oldList = await List.findById(card.list);
      const newList = await List.findById(listId);

      if (!newList) {
        return res.status(404).json({
          success: false,
          message: 'Target list not found',
        });
      }

      // Remove from old list
      oldList.cards = oldList.cards.filter(c => c.toString() !== card._id.toString());
      await oldList.save();

      // Add to new list
      newList.cards.push(card._id);
      await newList.save();

      card.list = listId;
    }

    await card.save();

    const populatedCard = await Card.findById(card._id)
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Card updated successfully',
      data: { card: populatedCard },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating card',
    });
  }
};

// Delete card
exports.deleteCard = async (req, res) => {
  try {
    const card = await Card.findById(req.params.cardId).populate('board');
    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found',
      });
    }

    // Check access - allow owner and members
    const board = card.board;
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

    // Remove from list
    const list = await List.findById(card.list);
    list.cards = list.cards.filter(c => c.toString() !== card._id.toString());
    await list.save();

    await Card.findByIdAndDelete(req.params.cardId);

    res.status(200).json({
      success: true,
      message: 'Card deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting card',
    });
  }
};

