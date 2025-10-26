const express = require('express');
const Team = require('../models/Team');
const Expense = require('../models/Expense');
const { authenticateToken } = require('../middleware/auth');
const emailService = require('../services/emailService');

const router = express.Router();

// Get all teams
router.get('/', authenticateToken, async (req, res) => {
  try {
    const query = {};

    // Filter by user's teams (as member or creator)
    query.$or = [
      { created_by: req.user._id },
      { 'members.user_id': req.user._id },
    ];

    const teams = await Team.find(query).sort({ created_at: -1 });

    // Include virtual fields in the response
    const teamsWithVirtuals = teams.map(team => {
      const teamObj = team.toObject();
      teamObj.budget_utilization =
        team.budget > 0 ? (team.total_spent / team.budget) * 100 : 0;
      teamObj.is_over_budget = team.total_spent > team.budget;
      teamObj.is_near_budget =
        teamObj.budget_utilization >= 80 && teamObj.budget_utilization < 100;
      return teamObj;
    });

    res.json({ ok: true, data: teamsWithVirtuals });
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ ok: false, message: 'Failed to fetch teams' });
  }
});

// Search teams
router.post('/search', authenticateToken, async (req, res) => {
  try {
    const query = {};

    // Filter by user's teams (as member or creator)
    query.$or = [
      { created_by: req.user._id },
      { 'members.user_id': req.user._id },
    ];

    const teams = await Team.find(query).sort({ created_at: -1 });

    // Include virtual fields in the response
    const teamsWithVirtuals = teams.map(team => {
      const teamObj = team.toObject();
      teamObj.budget_utilization =
        team.budget > 0 ? (team.total_spent / team.budget) * 100 : 0;
      teamObj.is_over_budget = team.total_spent > team.budget;
      teamObj.is_near_budget =
        teamObj.budget_utilization >= 80 && teamObj.budget_utilization < 100;
      return teamObj;
    });

    res.json({ ok: true, data: teamsWithVirtuals });
  } catch (error) {
    console.error('Teams search error:', error);
    res.status(500).json({
      ok: false,
      code: 'SERVER_ERROR',
      message: 'Failed to fetch teams',
    });
  }
});

// Get team by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        ok: false,
        code: 'TEAM_NOT_FOUND',
        message: 'Team not found',
      });
    }

    // Check if user has access to this team
    const hasAccess =
      team.created_by.toString() === req.user._id.toString() ||
      team.members.some(member => member.user_id === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({
        ok: false,
        code: 'ACCESS_DENIED',
        message: 'Access denied to this team',
      });
    }

    res.json({ ok: true, data: team });
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({
      ok: false,
      code: 'SERVER_ERROR',
      message: 'Failed to fetch team',
    });
  }
});

// Create team
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, budget, members = [] } = req.body;

    if (!name || budget === undefined) {
      return res.status(400).json({
        ok: false,
        code: 'MISSING_FIELDS',
        message: 'Team name and budget are required',
      });
    }

    if (budget < 0) {
      return res.status(400).json({
        ok: false,
        code: 'INVALID_BUDGET',
        message: 'Budget must be a positive number',
      });
    }

    const teamData = {
      name,
      budget,
      created_by: req.user._id,
      created_by_name: req.user.name,
      created_by_email: req.user.email,
      members: [
        {
          user_id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: 'admin',
        },
        ...members,
      ],
    };

    const team = await Team.create(teamData);
    res.status(201).json({ ok: true, data: team });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({
      ok: false,
      code: 'SERVER_ERROR',
      message: 'Failed to create team',
    });
  }
});

// Get team expenses
router.get('/:id/expenses', authenticateToken, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        ok: false,
        code: 'TEAM_NOT_FOUND',
        message: 'Team not found',
      });
    }

    // Check if user has access to this team
    const hasAccess =
      team.created_by.toString() === req.user._id.toString() ||
      team.members.some(member => member.user_id === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({
        ok: false,
        code: 'ACCESS_DENIED',
        message: 'Access denied to this team',
      });
    }

    const expenses = await Expense.find({ team_id: req.params.id }).sort({
      created_at: -1,
    });

    res.json({ ok: true, data: expenses });
  } catch (error) {
    console.error('Get team expenses error:', error);
    res.status(500).json({
      ok: false,
      code: 'SERVER_ERROR',
      message: 'Failed to fetch team expenses',
    });
  }
});

// Check budget alerts
router.post('/:id/check-budget', authenticateToken, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        ok: false,
        code: 'TEAM_NOT_FOUND',
        message: 'Team not found',
      });
    }

    const utilization = team.budget_utilization;
    let alertsSent = [];

    // Check 80% threshold
    if (utilization >= 80 && !team.budget_alerts_sent.eighty_percent) {
      const result = await emailService.sendBudgetAlert(team, 'eighty');
      if (result.ok) {
        team.budget_alerts_sent.eighty_percent = true;
        alertsSent.push('80% threshold alert sent');
      }
    }

    // Check 100% threshold
    if (utilization >= 100 && !team.budget_alerts_sent.hundred_percent) {
      const result = await emailService.sendBudgetAlert(team, 'hundred');
      if (result.ok) {
        team.budget_alerts_sent.hundred_percent = true;
        alertsSent.push('100% threshold alert sent');
      }
    }

    await team.save();

    res.json({
      ok: true,
      data: {
        utilization: utilization.toFixed(2),
        alertsSent,
        isOverBudget: team.is_over_budget,
        isNearBudget: team.is_near_budget,
      },
    });
  } catch (error) {
    console.error('Budget check error:', error);
    res.status(500).json({
      ok: false,
      code: 'SERVER_ERROR',
      message: 'Failed to check budget alerts',
    });
  }
});

// Update team
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const teamId = req.params.id;
    const { name, budget } = req.body;

    // Find the team and verify ownership
    const team = await Team.findOne({
      _id: teamId,
      created_by: req.user._id,
    });

    if (!team) {
      return res.status(404).json({
        ok: false,
        code: 'TEAM_NOT_FOUND',
        message: 'Team not found or you do not have permission to update it',
      });
    }

    // Update the team
    const updatedTeam = await Team.findByIdAndUpdate(
      teamId,
      { name, budget },
      { new: true }
    );

    // Include virtual fields in the response
    const teamWithVirtuals = {
      ...updatedTeam.toObject(),
      budget_utilization:
        updatedTeam.budget > 0
          ? (updatedTeam.total_spent / updatedTeam.budget) * 100
          : 0,
      is_over_budget: updatedTeam.total_spent > updatedTeam.budget,
      is_near_budget:
        (updatedTeam.budget > 0
          ? (updatedTeam.total_spent / updatedTeam.budget) * 100
          : 0) >= 80 &&
        (updatedTeam.budget > 0
          ? (updatedTeam.total_spent / updatedTeam.budget) * 100
          : 0) < 100,
    };

    res.json({
      ok: true,
      data: teamWithVirtuals,
      message: 'Team updated successfully',
    });
  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({
      ok: false,
      code: 'SERVER_ERROR',
      message: 'Failed to update team',
    });
  }
});

// Delete team
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const teamId = req.params.id;

    // Find the team and verify ownership
    const team = await Team.findOne({
      _id: teamId,
      created_by: req.user._id,
    });

    if (!team) {
      return res.status(404).json({
        ok: false,
        code: 'TEAM_NOT_FOUND',
        message: 'Team not found or you do not have permission to delete it',
      });
    }

    // Delete the team
    await Team.findByIdAndDelete(teamId);

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
});

module.exports = router;
