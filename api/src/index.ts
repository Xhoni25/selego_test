import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import teamRoutes from './routes/teams';
import expenseRoutes from './routes/expenses';
import authRoutes from './routes/auth';

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env['CLIENT_URL'] || 'http://localhost:3000',
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/expenses', expenseRoutes);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.status(200).json({ ok: true, message: 'Server is running' });
});

// Error handling middleware
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({
      ok: false,
      code: 'SERVER_ERROR',
      message: 'Something went wrong!',
    });
  }
);

// 404 handler
app.use('*', (_req, res) => {
  res.status(404).json({
    ok: false,
    code: 'NOT_FOUND',
    message: 'Route not found',
  });
});

// Database connection
mongoose
  .connect(
    process.env['MONGODB_URI'] || 'mongodb://localhost:27017/expense-manager'
  )
  .then(() => {
    console.log('Connected to MongoDB');
    const PORT = process.env['PORT'] || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error: Error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

export default app;
