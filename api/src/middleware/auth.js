const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        ok: false,
        code: 'ACCESS_TOKEN_REQUIRED',
        message: 'Access token required',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user || !user.is_active) {
      return res.status(401).json({
        ok: false,
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        ok: false,
        code: 'INVALID_TOKEN',
        message: 'Invalid token',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        ok: false,
        code: 'TOKEN_EXPIRED',
        message: 'Token expired',
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      ok: false,
      code: 'SERVER_ERROR',
      message: 'Authentication error',
    });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      ok: false,
      code: 'ADMIN_REQUIRED',
      message: 'Admin access required',
    });
  }
  next();
};

module.exports = { authenticateToken, requireAdmin };
