const User = require('../models/User');
const Book = require('../models/Book');

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('following', 'username avatar')
      .populate('followers', 'username avatar');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserBooks = async (req, res) => {
  try {
    const books = await Book.find({ addedBy: req.params.id })
      .sort({ createdAt: -1 })
      .populate('addedBy', 'username avatar');
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggleFollow = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ message: "Can't follow yourself" });

    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: 'User not found' });

    const currentUser = await User.findById(req.user._id);
    const isFollowing = currentUser.following.includes(req.params.id);

    if (isFollowing) {
      currentUser.following.pull(req.params.id);
      target.followers.pull(req.user._id);
    } else {
      currentUser.following.push(req.params.id);
      target.followers.push(req.user._id);
    }

    await Promise.all([currentUser.save(), target.save()]);
    res.json({ following: !isFollowing, followersCount: target.followers.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const users = await User.find({
      username: { $regex: q, $options: 'i' },
      _id: { $ne: req.user._id },
    }).select('username avatar bio').limit(10);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
