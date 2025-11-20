const express = require('express');
const router = express.Router();
const boardController = require('../controller/boardController');
const { protect } = require('../middleware/auth');

router.get('/', protect, boardController.getBoards);
router.post('/', protect, boardController.createBoard);
router.get('/:boardId', protect, boardController.getBoard);
router.put('/:boardId', protect, boardController.updateBoard);
router.delete('/:boardId', protect, boardController.deleteBoard);

module.exports = router;

