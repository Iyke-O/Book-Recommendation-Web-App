const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3 }).withMessage('Username min 3 chars'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  login
);

router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);

module.exports = router;
