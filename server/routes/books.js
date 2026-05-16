const express = require('express');
const { body } = require('express-validator');
const {
  getBooks, getBook, createBook, updateBook, deleteBook,
  addReview, deleteReview, toggleLike, getFeed,
} = require('../controllers/bookController');
const { getComments, addComment, deleteComment, toggleCommentLike } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getBooks);
router.get('/feed', protect, getFeed);
router.get('/:id', getBook);

router.post(
  '/',
  protect,
  [
    body('title').trim().notEmpty().withMessage('Title required'),
    body('author').trim().notEmpty().withMessage('Author required'),
  ],
  createBook
);
router.put('/:id', protect, updateBook);
router.delete('/:id', protect, deleteBook);

router.post('/:id/reviews', protect, addReview);
router.delete('/:id/reviews/:reviewId', protect, deleteReview);
router.put('/:id/like', protect, toggleLike);

router.get('/:bookId/comments', getComments);
router.post('/:bookId/comments', protect, addComment);
router.delete('/comments/:id', protect, deleteComment);
router.put('/comments/:id/like', protect, toggleCommentLike);

module.exports = router;
