const Comment = require('../models/Comment');

exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ book: req.params.bookId })
      .sort({ createdAt: -1 })
      .populate('user', 'username avatar');
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: 'Text is required' });

    const comment = await Comment.create({
      book: req.params.bookId,
      user: req.user._id,
      text: text.trim(),
    });
    await comment.populate('user', 'username avatar');
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    await comment.deleteOne();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggleCommentLike = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const idx = comment.likes.indexOf(req.user._id);
    if (idx === -1) {
      comment.likes.push(req.user._id);
    } else {
      comment.likes.splice(idx, 1);
    }
    await comment.save();
    res.json({ likes: comment.likes.length, liked: idx === -1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
