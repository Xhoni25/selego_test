import mongoose, { Schema, Document } from 'mongoose';
import { ITeam, ITeamMember } from '../types';

const teamMemberSchema = new Schema<ITeamMember>({
  user_id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'member'],
    default: 'member',
  },
});

const teamSchema = new Schema<ITeam>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    budget: {
      type: Number,
      required: true,
      min: 0,
    },
    members: [teamMemberSchema],
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
    total_spent: {
      type: Number,
      default: 0,
    },
    budget_alerts_sent: {
      eighty_percent: {
        type: Boolean,
        default: false,
      },
      hundred_percent: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Calculate budget utilization percentage
teamSchema.virtual('budget_utilization').get(function (this: ITeam) {
  return this.budget > 0 ? (this.total_spent / this.budget) * 100 : 0;
});

// Check if team is over budget
teamSchema.virtual('is_over_budget').get(function (this: ITeam) {
  return this.total_spent > this.budget;
});

// Check if team is near budget (80% threshold)
teamSchema.virtual('is_near_budget').get(function (this: ITeam) {
  return this.budget_utilization >= 80 && this.budget_utilization < 100;
});

export default mongoose.model<ITeam>('Team', teamSchema);
