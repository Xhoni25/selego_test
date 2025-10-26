const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const emailService = require('../services/emailService');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        ok: false,
        code: 'MISSING_FIELDS',
        message: 'Name, email, and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        ok: false,
        code: 'PASSWORD_TOO_SHORT',
        message: 'Password must be at least 6 characters',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        ok: false,
        code: 'USER_EXISTS',
        message: 'User already exists with this email',
      });
    }

    const user = await User.create({ name, email, password });

    // Send welcome email (don't wait for it)
    emailService.sendWelcomeEmail(user.email, user.name);

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      ok: true,
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      ok: false,
      code: 'SERVER_ERROR',
      message: 'Registration failed',
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        code: 'MISSING_FIELDS',
        message: 'Email and password are required',
      });
    }

    const user = await User.findOne({ email });
    if (!user || !user.is_active) {
      return res.status(401).json({
        ok: false,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        ok: false,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      ok: true,
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      ok: false,
      code: 'SERVER_ERROR',
      message: 'Login failed',
    });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  res.json({
    ok: true,
    data: { user: req.user },
  });
});

module.exports = router;
