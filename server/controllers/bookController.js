const { validationResult } = require('express-validator');
const Book = require('../models/Book');
const Comment = require('../models/Comment');

exports.getBooks = async (req, res) => {
  try {
    const { search, genre, page = 1, limit = 12 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { genre: { $regex: search, $options: 'i' } },
      ];
    }
    if (genre) query.genre = { $in: [genre] };

    const skip = (Number(page) - 1) * Number(limit);
    const [books, total] = await Promise.all([
      Book.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('addedBy', 'username avatar'),
      Book.countDocuments(query),
    ]);

    res.json({ books, total, pages: Math.ceil(total / Number(limit)), page: Number(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('addedBy', 'username avatar')
      .populate('reviews.user', 'username avatar')
      .populate('likes', 'username');
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createBook = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const book = await Book.create({ ...req.body, addedBy: req.user._id });
    await book.populate('addedBy', 'username avatar');
    res.status(201).json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (book.addedBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    Object.assign(book, req.body);
    await book.save();
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (book.addedBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    await book.deleteOne();
    await Comment.deleteMany({ book: req.params.id });
    res.json({ message: 'Book removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const alreadyReviewed = book.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) return res.status(400).json({ message: 'Already reviewed' });

    book.reviews.push({ user: req.user._id, rating: Number(rating), comment });
    book.calcAverageRating();
    await book.save();
    await book.populate('reviews.user', 'username avatar');
    res.status(201).json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const review = book.reviews.id(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    review.deleteOne();
    book.calcAverageRating();
    await book.save();
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const idx = book.likes.indexOf(req.user._id);
    if (idx === -1) {
      book.likes.push(req.user._id);
    } else {
      book.likes.splice(idx, 1);
    }
    await book.save();
    res.json({ likes: book.likes.length, liked: idx === -1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFeed = async (req, res) => {
  try {
    const following = req.user.following || [];
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const preferredGenres = req.user.favoriteGenres || [];
    const query =
      following.length > 0
        ? { $or: [{ addedBy: { $in: following } }, { genre: { $in: preferredGenres } }] }
        : preferredGenres.length > 0
        ? { genre: { $in: preferredGenres } }
        : {};

    const [books, total] = await Promise.all([
      Book.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('addedBy', 'username avatar'),
      Book.countDocuments(query),
    ]);

    res.json({ books, total, pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
