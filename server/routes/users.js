const express = require('express');
const { getUser, getUserBooks, toggleFollow, searchUsers } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/search', protect, searchUsers);
router.get('/:id', getUser);
router.get('/:id/books', getUserBooks);
router.put('/:id/follow', protect, toggleFollow);

module.exports = router;
