import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { IUser } from '../types';

interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        ok: false,
        code: 'NO_TOKEN',
        message: 'Access denied. No token provided.',
      });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env['JWT_SECRET'] || 'fallback-secret'
    ) as { userId: string };
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      res.status(401).json({
        ok: false,
        code: 'INVALID_TOKEN',
        message: 'Token is not valid.',
      });
      return;
    }

    if (!user.is_active) {
      res.status(401).json({
        ok: false,
        code: 'ACCOUNT_DISABLED',
        message: 'Account is disabled.',
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      ok: false,
      code: 'INVALID_TOKEN',
      message: 'Token is not valid.',
    });
  }
};

export const adminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({
      ok: false,
      code: 'INSUFFICIENT_PERMISSIONS',
      message: 'Access denied. Admin privileges required.',
    });
    return;
  }
  next();
};
