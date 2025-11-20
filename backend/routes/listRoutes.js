const express = require('express');
const router = express.Router();
const listController = require('../controller/listController');
const { protect } = require('../middleware/auth');

router.post('/:boardId', protect, listController.createList);
router.put('/:listId', protect, listController.updateList);
router.delete('/:listId', protect, listController.deleteList);

module.exports = router;

