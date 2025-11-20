const express = require('express');
const router = express.Router();
const recommendationsController = require('../controller/recommendationsController');
const { protect } = require('../middleware/auth');

router.get('/:boardId', protect, recommendationsController.getRecommendations);

module.exports = router;

