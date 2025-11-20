const express = require('express');
const router = express.Router();
const cardController = require('../controller/cardController');
const { protect } = require('../middleware/auth');

router.post('/:listId', protect, cardController.createCard);
router.put('/:cardId', protect, cardController.updateCard);
router.delete('/:cardId', protect, cardController.deleteCard);

module.exports = router;

