import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import User from '../models/User';
import emailService from '../services/emailService';
import { protect } from '../middleware/auth';
import { LoginRequest, RegisterRequest, AuthRequest } from '../types';

const router = Router();

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        ok: false,
        code: 'VALIDATION_ERROR',
        message: error.details[0].message,
      });
      return;
    }

    const { name, email, password }: RegisterRequest = value;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        ok: false,
        code: 'USER_EXISTS',
        message: 'User already exists with this email',
      });
      return;
    }

    // Create user
    const user = new User({ name, email, password });
    await user.save();

    // Send welcome email
    await emailService.sendWelcomeEmail(email, name);

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback-secret',
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
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        ok: false,
        code: 'VALIDATION_ERROR',
        message: error.details[0].message,
      });
      return;
    }

    const { email, password }: LoginRequest = value;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({
        ok: false,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
      return;
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        ok: false,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
      return;
    }

    // Check if account is active
    if (!user.is_active) {
      res.status(401).json({
        ok: false,
        code: 'ACCOUNT_DISABLED',
        message: 'Account is disabled',
      });
      return;
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback-secret',
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
router.get(
  '/me',
  protect,
  async (req: AuthRequest, res: Response): Promise<void> => {
    res.json({
      ok: true,
      data: {
        user: req.user?.toJSON(),
      },
    });
  }
);

export default router;
