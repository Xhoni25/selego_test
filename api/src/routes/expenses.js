const express = require('express');
const Expense = require('../models/Expense');
const Team = require('../models/Team');
const { authenticateToken } = require('../middleware/auth');
const aiService = require('../services/aiService');
const emailService = require('../services/emailService');

const router = express.Router();

// Get all expenses
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Filter by user's teams
    const userTeams = await Team.find({
      $or: [{ created_by: req.user._id }, { 'members.user_id': req.user._id }],
    }).select('_id');

    const query = {
      team_id: { $in: userTeams.map(team => team._id) },
    };

    // Handle query parameters
    if (req.query.team_id) {
      query.team_id = req.query.team_id;
    }
    if (req.query.category) {
      query.category = req.query.category;
    }
    if (req.query.search) {
      query.$or = [
        { description: { $regex: req.query.search, $options: 'i' } },
        { vendor: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const expenses = await Expense.find(query)
      .populate('team_id', 'name')
      .populate('created_by', 'name email')
      .sort({ expense_date: -1 });

    res.json({ ok: true, data: expenses });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ ok: false, message: 'Failed to fetch expenses' });
  }
});

// Search expenses
router.post('/search', authenticateToken, async (req, res) => {
  try {
    const query = {};

    // Filter by user's teams
    const userTeams = await Team.find({
      $or: [{ created_by: req.user._id }, { 'members.user_id': req.user._id }],
    }).select('_id');

    query.team_id = { $in: userTeams.map(team => team._id) };

    // Additional filters
    if (req.body.team_id) query.team_id = req.body.team_id;
    if (req.body.category) query.category = req.body.category;
    if (req.body.status) query.status = req.body.status;
    if (req.body.created_by) query.created_by = req.body.created_by;

    // Date range filters
    if (req.body.start_date || req.body.end_date) {
      query.expense_date = {};
      if (req.body.start_date)
        query.expense_date.$gte = new Date(req.body.start_date);
      if (req.body.end_date)
        query.expense_date.$lte = new Date(req.body.end_date);
    }

    const expenses = await Expense.find(query)
      .populate('team_id', 'name budget')
      .sort({ created_at: -1 });

    res.json({ ok: true, data: expenses });
  } catch (error) {
    console.error('Expenses search error:', error);
    res.status(500).json({
      ok: false,
      code: 'SERVER_ERROR',
      message: 'Failed to fetch expenses',
    });
  }
});

// Get expense by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id).populate(
      'team_id',
      'name budget'
    );

    if (!expense) {
      return res.status(404).json({
        ok: false,
        code: 'EXPENSE_NOT_FOUND',
        message: 'Expense not found',
      });
    }

    // Check if user has access to this expense's team
    const team = await Team.findById(expense.team_id._id);
    const hasAccess =
      team.created_by.toString() === req.user._id.toString() ||
      team.members.some(member => member.user_id === req.user._id);

    if (!hasAccess) {
      return res.status(403).json({
        ok: false,
        code: 'ACCESS_DENIED',
        message: 'Access denied to this expense',
      });
    }

    res.json({ ok: true, data: expense });
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({
      ok: false,
      code: 'SERVER_ERROR',
      message: 'Failed to fetch expense',
    });
  }
});

// Create expense
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      team_id,
      amount,
      description,
      category,
      receipt_url,
      expense_date,
      notes,
    } = req.body;

    if (!team_id || !amount || !description) {
      return res.status(400).json({
        ok: false,
        code: 'MISSING_FIELDS',
        message: 'Team ID, amount, and description are required',
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        ok: false,
        code: 'INVALID_AMOUNT',
        message: 'Amount must be greater than 0',
      });
    }

    // Check if user has access to this team
    const team = await Team.findById(team_id);
    if (!team) {
      return res.status(404).json({
        ok: false,
        code: 'TEAM_NOT_FOUND',
        message: 'Team not found',
      });
    }

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

    // Get AI suggested category if not provided
    let aiSuggestedCategory = null;
    if (!category) {
      aiSuggestedCategory = await aiService.suggestExpenseCategory(description);
    }

    const expenseData = {
      team_id,
      amount,
      description,
      category: category || aiSuggestedCategory || 'other',
      ai_suggested_category: aiSuggestedCategory,
      created_by: req.user._id,
      created_by_name: req.user.name,
      created_by_email: req.user.email,
      receipt_url,
      expense_date: expense_date ? new Date(expense_date) : new Date(),
      notes,
    };

    const expense = await Expense.create(expenseData);

    // Update team's total spent
    team.total_spent += amount;
    await team.save();

    // Check budget alerts
    const utilization = team.budget_utilization;
    let alertsSent = [];

    if (utilization >= 80 && !team.budget_alerts_sent.eighty_percent) {
      const result = await emailService.sendBudgetAlert(team, 'eighty');
      if (result.ok) {
        team.budget_alerts_sent.eighty_percent = true;
        alertsSent.push('80% threshold alert sent');
      }
    }

    if (utilization >= 100 && !team.budget_alerts_sent.hundred_percent) {
      const result = await emailService.sendBudgetAlert(team, 'hundred');
      if (result.ok) {
        team.budget_alerts_sent.hundred_percent = true;
        alertsSent.push('100% threshold alert sent');
      }
    }

    await team.save();

    const populatedExpense = await Expense.findById(expense._id).populate(
      'team_id',
      'name budget'
    );

    res.status(201).json({
      ok: true,
      data: populatedExpense,
      alertsSent,
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({
      ok: false,
      code: 'SERVER_ERROR',
      message: 'Failed to create expense',
    });
  }
});

// Update expense
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        ok: false,
        code: 'EXPENSE_NOT_FOUND',
        message: 'Expense not found',
      });
    }

    // Check if user can update this expense
    const canUpdate = expense.created_by.toString() === req.user._id.toString();
    if (!canUpdate) {
      return res.status(403).json({
        ok: false,
        code: 'ACCESS_DENIED',
        message: 'You can only update your own expenses',
      });
    }

    const { amount, description, category, status, receipt_url, notes } =
      req.body;
    const oldAmount = expense.amount;
    const updateData = {};

    if (amount !== undefined) {
      if (amount <= 0) {
        return res.status(400).json({
          ok: false,
          code: 'INVALID_AMOUNT',
          message: 'Amount must be greater than 0',
        });
      }
      updateData.amount = amount;
    }
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (status !== undefined) updateData.status = status;
    if (receipt_url !== undefined) updateData.receipt_url = receipt_url;
    if (notes !== undefined) updateData.notes = notes;

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('team_id', 'name budget');

    // Update team's total spent if amount changed
    if (amount !== undefined && amount !== oldAmount) {
      const team = await Team.findById(expense.team_id);
      team.total_spent = team.total_spent - oldAmount + amount;
      await team.save();
    }

    res.json({ ok: true, data: updatedExpense });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({
      ok: false,
      code: 'SERVER_ERROR',
      message: 'Failed to update expense',
    });
  }
});

// Delete expense
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        ok: false,
        code: 'EXPENSE_NOT_FOUND',
        message: 'Expense not found',
      });
    }

    // Check if user can delete this expense
    const canDelete = expense.created_by.toString() === req.user._id.toString();
    if (!canDelete) {
      return res.status(403).json({
        ok: false,
        code: 'ACCESS_DENIED',
        message: 'You can only delete your own expenses',
      });
    }

    // Update team's total spent
    const team = await Team.findById(expense.team_id);
    team.total_spent -= expense.amount;
    await team.save();

    await Expense.findByIdAndDelete(req.params.id);

    res.json({ ok: true, message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({
      ok: false,
      code: 'SERVER_ERROR',
      message: 'Failed to delete expense',
    });
  }
});

// Get AI insights for team expenses
router.get('/:teamId/insights', authenticateToken, async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId);

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
      team.members.some(member => member.user_id === req.user._id);

    if (!hasAccess) {
      return res.status(403).json({
        ok: false,
        code: 'ACCESS_DENIED',
        message: 'Access denied to this team',
      });
    }

    const expenses = await Expense.find({ team_id: req.params.teamId });
    const insights = await aiService.generateSpendingInsights(expenses);

    res.json({ ok: true, data: { insights } });
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({
      ok: false,
      code: 'SERVER_ERROR',
      message: 'Failed to generate insights',
    });
  }
});

module.exports = router;
