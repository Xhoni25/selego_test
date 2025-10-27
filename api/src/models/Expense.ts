import mongoose, { Schema } from 'mongoose';
import { IExpense, ExpenseCategory } from '../types';

const expenseSchema = new Schema<IExpense>(
  {
    team_id: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'travel',
        'food',
        'supplies',
        'software',
        'marketing',
        'office',
        'other',
      ] as ExpenseCategory[],
    },
    ai_suggested_category: {
      type: String,
      enum: [
        'travel',
        'food',
        'supplies',
        'software',
        'marketing',
        'office',
        'other',
      ] as ExpenseCategory[],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    created_by: {
      type: String,
      required: true,
    },
    created_by_name: {
      type: String,
      required: true,
    },
    created_by_email: {
      type: String,
      required: true,
    },
    receipt_url: {
      type: String,
    },
    expense_date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
expenseSchema.index({ team_id: 1, created_at: -1 });
expenseSchema.index({ created_by: 1 });
expenseSchema.index({ category: 1 });

export default mongoose.model<IExpense>('Expense', expenseSchema);
