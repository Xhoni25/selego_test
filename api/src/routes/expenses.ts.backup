import { Router, Request, Response } from 'express';
import Joi from 'joi';
import Expense from '../models/Expense';
import Team from '../models/Team';
import { protect } from '../middleware/auth';
import aiService from '../services/aiService';
import {
  CreateExpenseRequest,
  UpdateExpenseRequest,
  SearchRequest,
  AuthRequest,
} from '../types';

const router = Router();

// Validation schemas
const createExpenseSchema = Joi.object({
  team_id: Joi.string().required(),
  amount: Joi.number().min(0.01).required(),
  description: Joi.string().min(2).max(500).required(),
  category: Joi.string()
    .valid(
      'travel',
      'food',
      'supplies',
      'software',
      'marketing',
      'office',
      'other'
    )
    .optional(),
  receipt_url: Joi.string().uri().optional(),
  expense_date: Joi.date().optional(),
  notes: Joi.string().max(1000).optional(),
});

const updateExpenseSchema = Joi.object({
  amount: Joi.number().min(0.01),
  description: Joi.string().min(2).max(500),
  category: Joi.string().valid(
    'travel',
    'food',
    'supplies',
    'software',
    'marketing',
    'office',
    'other'
  ),
  status: Joi.string().valid('pending', 'approved', 'rejected'),
  receipt_url: Joi.string().uri(),
  notes: Joi.string().max(1000),
});

const searchSchema = Joi.object({
  team_id: Joi.string(),
  category: Joi.string().valid(
    'travel',
    'food',
    'supplies',
    'software',
    'marketing',
    'office',
    'other'
  ),
  status: Joi.string().valid('pending', 'approved', 'rejected'),
  search: Joi.string(),
  start_date: Joi.date(),
  end_date: Joi.date(),
});

// Get all expenses for user
router.get('/', protect, async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = searchSchema.validate(req.query);
    if (error) {
      res.status(400).json({
        ok: false,
        code: 'VALIDATION_ERROR',
        message: error.details[0].message,
      });
      return;
    }

    const searchParams: SearchRequest = value;
    const query: any = {};

    // Build query based on search parameters
    if (searchParams.team_id) {
      query.team_id = searchParams.team_id;
    }
    if (searchParams.category) {
      query.category = searchParams.category;
    }
    if (searchParams.status) {
      query.status = searchParams.status;
    }
    if (searchParams.search) {
      query.$or = [
        { description: { $regex: searchParams.search, $options: 'i' } },
        { notes: { $regex: searchParams.search, $options: 'i' } },
      ];
    }
    if (searchParams.start_date || searchParams.end_date) {
      query.expense_date = {};
      if (searchParams.start_date) {
        query.expense_date.$gte = new Date(searchParams.start_date);
      }
      if (searchParams.end_date) {
        query.expense_date.$lte = new Date(searchParams.end_date);
      }
    }

    // Only show expenses from teams user has access to
    const userTeams = await Team.find({
      $or: [
        { created_by: req.user?._id.toString() },
        { 'members.user_id': req.user?._id.toString() },
      ],
    }).select('_id');

    const teamIds = userTeams.map(team => team._id);
    query.team_id = { $in: teamIds };

    const expenses = await Expense.find(query)
      .populate('team_id', 'name')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      ok: true,
      data: expenses,
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({
      ok: false,
      code: 'SERVER_ERROR',
      message: 'Failed to fetch expenses',
    });
  }
});

// Get single expense
router.get(
  '/:id',
  protect,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const expense = await Expense.findById(req.params.id).populate(
        'team_id',
        'name'
      );

      if (!expense) {
        res.status(404).json({
          ok: false,
          code: 'EXPENSE_NOT_FOUND',
          message: 'Expense not found',
        });
        return;
      }

      // Check if user has access to this expense's team
      const team = await Team.findById(expense.team_id);
      if (!team) {
        res.status(404).json({
          ok: false,
          code: 'TEAM_NOT_FOUND',
          message: 'Team not found',
        });
        return;
      }

      const hasAccess =
        team.created_by === req.user?._id.toString() ||
        team.members.some(
          member => member.user_id === req.user?._id.toString()
        );

      if (!hasAccess) {
        res.status(403).json({
          ok: false,
          code: 'ACCESS_DENIED',
          message: 'Access denied to this expense',
        });
        return;
      }

      res.json({
        ok: true,
        data: expense,
      });
    } catch (error) {
      console.error('Get expense error:', error);
      res.status(500).json({
        ok: false,
        code: 'SERVER_ERROR',
        message: 'Failed to fetch expense',
      });
    }
  }
);

// Create expense
router.post(
  '/',
  protect,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { error, value } = createExpenseSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          ok: false,
          code: 'VALIDATION_ERROR',
          message: error.details[0].message,
        });
        return;
      }

      const {
        team_id,
        amount,
        description,
        category,
        receipt_url,
        expense_date,
        notes,
      }: CreateExpenseRequest = value;

      // Check if user has access to the team
      const team = await Team.findById(team_id);
      if (!team) {
        res.status(404).json({
          ok: false,
          code: 'TEAM_NOT_FOUND',
          message: 'Team not found',
        });
        return;
      }

      const hasAccess =
        team.created_by === req.user?._id.toString() ||
        team.members.some(
          member => member.user_id === req.user?._id.toString()
        );

      if (!hasAccess) {
        res.status(403).json({
          ok: false,
          code: 'ACCESS_DENIED',
          message: 'Access denied to this team',
        });
        return;
      }

      // Get AI suggested category if not provided
      let aiSuggestedCategory;
      if (!category) {
        const aiResult = await aiService.categorizeExpense(description);
        if (aiResult.ok && aiResult.category) {
          aiSuggestedCategory = aiResult.category;
        }
      }

      const expense = new Expense({
        team_id,
        amount,
        description,
        category: category || aiSuggestedCategory || 'other',
        ai_suggested_category: aiSuggestedCategory,
        created_by: req.user?._id.toString(),
        created_by_name: req.user?.name || '',
        created_by_email: req.user?.email || '',
        receipt_url,
        expense_date: expense_date ? new Date(expense_date) : new Date(),
        notes,
      });

      await expense.save();

      // Update team's total spent
      team.total_spent += amount;
      await team.save();

      res.status(201).json({
        ok: true,
        data: expense,
      });
    } catch (error) {
      console.error('Create expense error:', error);
      res.status(500).json({
        ok: false,
        code: 'SERVER_ERROR',
        message: 'Failed to create expense',
      });
    }
  }
);

// Update expense
router.put(
  '/:id',
  protect,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { error, value } = updateExpenseSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          ok: false,
          code: 'VALIDATION_ERROR',
          message: error.details[0].message,
        });
        return;
      }

      const expense = await Expense.findById(req.params.id);

      if (!expense) {
        res.status(404).json({
          ok: false,
          code: 'EXPENSE_NOT_FOUND',
          message: 'Expense not found',
        });
        return;
      }

      // Check if user has access to this expense's team
      const team = await Team.findById(expense.team_id);
      if (!team) {
        res.status(404).json({
          ok: false,
          code: 'TEAM_NOT_FOUND',
          message: 'Team not found',
        });
        return;
      }

      const hasAccess =
        team.created_by === req.user?._id.toString() ||
        team.members.some(
          member => member.user_id === req.user?._id.toString()
        );

      if (!hasAccess) {
        res.status(403).json({
          ok: false,
          code: 'ACCESS_DENIED',
          message: 'Access denied to this expense',
        });
        return;
      }

      // Update team's total spent if amount changed
      if (value.amount && value.amount !== expense.amount) {
        team.total_spent = team.total_spent - expense.amount + value.amount;
        await team.save();
      }

      const updatedExpense = await Expense.findByIdAndUpdate(
        req.params.id,
        value as UpdateExpenseRequest,
        { new: true, runValidators: true }
      );

      res.json({
        ok: true,
        data: updatedExpense,
      });
    } catch (error) {
      console.error('Update expense error:', error);
      res.status(500).json({
        ok: false,
        code: 'SERVER_ERROR',
        message: 'Failed to update expense',
      });
    }
  }
);

// Delete expense
router.delete(
  '/:id',
  protect,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const expense = await Expense.findById(req.params.id);

      if (!expense) {
        res.status(404).json({
          ok: false,
          code: 'EXPENSE_NOT_FOUND',
          message: 'Expense not found',
        });
        return;
      }

      // Check if user has access to this expense's team
      const team = await Team.findById(expense.team_id);
      if (!team) {
        res.status(404).json({
          ok: false,
          code: 'TEAM_NOT_FOUND',
          message: 'Team not found',
        });
        return;
      }

      const hasAccess =
        team.created_by === req.user?._id.toString() ||
        team.members.some(
          member => member.user_id === req.user?._id.toString()
        );

      if (!hasAccess) {
        res.status(403).json({
          ok: false,
          code: 'ACCESS_DENIED',
          message: 'Access denied to this expense',
        });
        return;
      }

      // Update team's total spent
      team.total_spent -= expense.amount;
      await team.save();

      // Delete expense
      await Expense.findByIdAndDelete(req.params.id);

      res.json({
        ok: true,
        message: 'Expense deleted successfully',
      });
    } catch (error) {
      console.error('Delete expense error:', error);
      res.status(500).json({
        ok: false,
        code: 'SERVER_ERROR',
        message: 'Failed to delete expense',
      });
    }
  }
);

// Get AI insights
router.get(
  '/insights/ai',
  protect,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { team_id } = req.query;

      if (!team_id) {
        res.status(400).json({
          ok: false,
          code: 'MISSING_TEAM_ID',
          message: 'Team ID is required',
        });
        return;
      }

      // Check if user has access to the team
      const team = await Team.findById(team_id);
      if (!team) {
        res.status(404).json({
          ok: false,
          code: 'TEAM_NOT_FOUND',
          message: 'Team not found',
        });
        return;
      }

      const hasAccess =
        team.created_by === req.user?._id.toString() ||
        team.members.some(
          member => member.user_id === req.user?._id.toString()
        );

      if (!hasAccess) {
        res.status(403).json({
          ok: false,
          code: 'ACCESS_DENIED',
          message: 'Access denied to this team',
        });
        return;
      }

      // Get recent expenses for insights
      const expenses = await Expense.find({ team_id })
        .sort({ createdAt: -1 })
        .limit(50);

      const aiResult = await aiService.generateInsights(expenses);

      if (!aiResult.ok) {
        res.status(500).json({
          ok: false,
          code: 'AI_ERROR',
          message: 'Failed to generate insights',
        });
        return;
      }

      res.json({
        ok: true,
        data: {
          insights: aiResult.insights,
        },
      });
    } catch (error) {
      console.error('AI insights error:', error);
      res.status(500).json({
        ok: false,
        code: 'SERVER_ERROR',
        message: 'Failed to generate insights',
      });
    }
  }
);

export default router;
