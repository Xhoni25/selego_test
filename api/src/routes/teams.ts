import { Router, Request, Response } from 'express';
import Joi from 'joi';
import Team from '../models/Team';
import Expense from '../models/Expense';
import { protect } from '../middleware/auth';
import emailService from '../services/emailService';
import { CreateTeamRequest, UpdateTeamRequest, AuthRequest } from '../types';

const router = Router();

// Validation schemas
const createTeamSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  budget: Joi.number().min(0).required(),
  members: Joi.array()
    .items(
      Joi.object({
        user_id: Joi.string().required(),
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        role: Joi.string().valid('admin', 'member').default('member'),
      })
    )
    .optional(),
});

const updateTeamSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  budget: Joi.number().min(0),
  members: Joi.array().items(
    Joi.object({
      user_id: Joi.string().required(),
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      role: Joi.string().valid('admin', 'member').default('member'),
    })
  ),
});

// Get all teams for user
router.get(
  '/',
  protect,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const teams = await Team.find({
        $or: [
          { created_by: req.user?._id.toString() },
          { 'members.user_id': req.user?._id.toString() },
        ],
      }).sort({ createdAt: -1 });

      res.json({
        ok: true,
        data: teams,
      });
    } catch (error) {
      console.error('Get teams error:', error);
      res.status(500).json({
        ok: false,
        code: 'SERVER_ERROR',
        message: 'Failed to fetch teams',
      });
    }
  }
);

// Get single team
router.get(
  '/:id',
  protect,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const team = await Team.findById(req.params.id);

      if (!team) {
        res.status(404).json({
          ok: false,
          code: 'TEAM_NOT_FOUND',
          message: 'Team not found',
        });
        return;
      }

      // Check if user has access to this team
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

      res.json({
        ok: true,
        data: team,
      });
    } catch (error) {
      console.error('Get team error:', error);
      res.status(500).json({
        ok: false,
        code: 'SERVER_ERROR',
        message: 'Failed to fetch team',
      });
    }
  }
);

// Create team
router.post(
  '/',
  protect,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { error, value } = createTeamSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          ok: false,
          code: 'VALIDATION_ERROR',
          message: error.details[0].message,
        });
        return;
      }

      const { name, budget, members = [] }: CreateTeamRequest = value;

      const team = new Team({
        name,
        budget,
        members,
        created_by: req.user?._id.toString(),
        created_by_name: req.user?.name || '',
        created_by_email: req.user?.email || '',
      });

      await team.save();

      res.status(201).json({
        ok: true,
        data: team,
      });
    } catch (error) {
      console.error('Create team error:', error);
      res.status(500).json({
        ok: false,
        code: 'SERVER_ERROR',
        message: 'Failed to create team',
      });
    }
  }
);

// Update team
router.put(
  '/:id',
  protect,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { error, value } = updateTeamSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          ok: false,
          code: 'VALIDATION_ERROR',
          message: error.details[0].message,
        });
        return;
      }

      const team = await Team.findById(req.params.id);

      if (!team) {
        res.status(404).json({
          ok: false,
          code: 'TEAM_NOT_FOUND',
          message: 'Team not found',
        });
        return;
      }

      // Check if user is team creator or admin
      const isCreator = team.created_by === req.user?._id.toString();
      const isAdmin = team.members.find(
        member =>
          member.user_id === req.user?._id.toString() && member.role === 'admin'
      );

      if (!isCreator && !isAdmin) {
        res.status(403).json({
          ok: false,
          code: 'ACCESS_DENIED',
          message: 'Only team creators and admins can update teams',
        });
        return;
      }

      const updatedTeam = await Team.findByIdAndUpdate(
        req.params.id,
        value as UpdateTeamRequest,
        { new: true, runValidators: true }
      );

      res.json({
        ok: true,
        data: updatedTeam,
      });
    } catch (error) {
      console.error('Update team error:', error);
      res.status(500).json({
        ok: false,
        code: 'SERVER_ERROR',
        message: 'Failed to update team',
      });
    }
  }
);

// Delete team
router.delete(
  '/:id',
  protect,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const team = await Team.findById(req.params.id);

      if (!team) {
        res.status(404).json({
          ok: false,
          code: 'TEAM_NOT_FOUND',
          message: 'Team not found',
        });
        return;
      }

      // Only team creator can delete
      if (team.created_by !== req.user?._id.toString()) {
        res.status(403).json({
          ok: false,
          code: 'ACCESS_DENIED',
          message: 'Only team creators can delete teams',
        });
        return;
      }

      // Delete associated expenses
      await Expense.deleteMany({ team_id: req.params.id });

      // Delete team
      await Team.findByIdAndDelete(req.params.id);

      res.json({
        ok: true,
        message: 'Team deleted successfully',
      });
    } catch (error) {
      console.error('Delete team error:', error);
      res.status(500).json({
        ok: false,
        code: 'SERVER_ERROR',
        message: 'Failed to delete team',
      });
    }
  }
);

// Get team expenses
router.get(
  '/:id/expenses',
  protect,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const team = await Team.findById(req.params.id);

      if (!team) {
        res.status(404).json({
          ok: false,
          code: 'TEAM_NOT_FOUND',
          message: 'Team not found',
        });
        return;
      }

      // Check access
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

      const expenses = await Expense.find({ team_id: req.params.id })
        .sort({ createdAt: -1 })
        .limit(50);

      res.json({
        ok: true,
        data: expenses,
      });
    } catch (error) {
      console.error('Get team expenses error:', error);
      res.status(500).json({
        ok: false,
        code: 'SERVER_ERROR',
        message: 'Failed to fetch team expenses',
      });
    }
  }
);

// Budget monitoring
router.get(
  '/:id/budget-status',
  protect,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const team = await Team.findById(req.params.id);

      if (!team) {
        res.status(404).json({
          ok: false,
          code: 'TEAM_NOT_FOUND',
          message: 'Team not found',
        });
        return;
      }

      // Check access
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

      const utilization = team.budget_utilization;
      const isOverBudget = team.is_over_budget;
      const isNearBudget = team.is_near_budget;

      // Send alerts if needed
      const alertsSent: string[] = [];

      if (isOverBudget && !team.budget_alerts_sent.hundred_percent) {
        await emailService.sendBudgetAlert(team, 'hundred');
        team.budget_alerts_sent.hundred_percent = true;
        alertsSent.push('100% budget alert sent');
      } else if (isNearBudget && !team.budget_alerts_sent.eighty_percent) {
        await emailService.sendBudgetAlert(team, 'eighty');
        team.budget_alerts_sent.eighty_percent = true;
        alertsSent.push('80% budget alert sent');
      }

      if (alertsSent.length > 0) {
        await team.save();
      }

      res.json({
        ok: true,
        data: {
          utilization: `${utilization.toFixed(1)}%`,
          alertsSent,
          isOverBudget,
          isNearBudget,
        },
      });
    } catch (error) {
      console.error('Budget status error:', error);
      res.status(500).json({
        ok: false,
        code: 'SERVER_ERROR',
        message: 'Failed to check budget status',
      });
    }
  }
);

export default router;
