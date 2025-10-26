const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
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
    members: [
      {
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
      },
    ],
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
teamSchema.virtual('budget_utilization').get(function () {
  return this.budget > 0 ? (this.total_spent / this.budget) * 100 : 0;
});

// Check if team is over budget
teamSchema.virtual('is_over_budget').get(function () {
  return this.total_spent > this.budget;
});

// Check if team is near budget (80% threshold)
teamSchema.virtual('is_near_budget').get(function () {
  return this.budget_utilization >= 80 && this.budget_utilization < 100;
});

module.exports = mongoose.model('Team', teamSchema);
