import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  toJSON(): Omit<IUser, 'password'>;
}

export interface ITeam extends Document {
  _id: Types.ObjectId;
  name: string;
  budget: number;
  members: ITeamMember[];
  created_by: string;
  created_by_name: string;
  created_by_email: string;
  total_spent: number;
  budget_alerts_sent: {
    eighty_percent: boolean;
    hundred_percent: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  budget_utilization: number;
  is_over_budget: boolean;
  is_near_budget: boolean;
}

export interface ITeamMember {
  user_id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
}

export interface IExpense extends Document {
  _id: Types.ObjectId;
  team_id: Types.ObjectId;
  amount: number;
  description: string;
  category: ExpenseCategory;
  ai_suggested_category?: ExpenseCategory;
  status: ExpenseStatus;
  created_by: string;
  created_by_name: string;
  created_by_email: string;
  receipt_url?: string;
  expense_date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ExpenseCategory =
  | 'travel'
  | 'food'
  | 'supplies'
  | 'software'
  | 'marketing'
  | 'office'
  | 'other';

export type ExpenseStatus = 'pending' | 'approved' | 'rejected';

export interface ApiResponse<T = any> {
  ok: boolean;
  data?: T;
  code?: string;
  message?: string;
  error?: string;
}

export interface AuthRequest extends Request {
  user?: IUser;
}

export interface CreateTeamRequest {
  name: string;
  budget: number;
  members?: ITeamMember[];
}

export interface UpdateTeamRequest {
  name?: string;
  budget?: number;
  members?: ITeamMember[];
}

export interface CreateExpenseRequest {
  team_id: string;
  amount: number;
  description: string;
  category?: ExpenseCategory;
  receipt_url?: string;
  expense_date?: string;
  notes?: string;
}

export interface UpdateExpenseRequest {
  amount?: number;
  description?: string;
  category?: ExpenseCategory;
  status?: ExpenseStatus;
  receipt_url?: string;
  notes?: string;
}

export interface SearchRequest {
  team_id?: string;
  category?: ExpenseCategory;
  status?: ExpenseStatus;
  search?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface BudgetAlertResult {
  utilization: string;
  alertsSent: string[];
  isOverBudget: boolean;
  isNearBudget: boolean;
}

export interface AIInsightsResult {
  insights: string;
}
