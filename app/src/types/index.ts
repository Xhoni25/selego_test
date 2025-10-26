export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  user_id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
}

export interface Team {
  _id: string;
  name: string;
  budget: number;
  members: TeamMember[];
  created_by: string;
  created_by_name: string;
  created_by_email: string;
  total_spent: number;
  budget_alerts_sent: {
    eighty_percent: boolean;
    hundred_percent: boolean;
  };
  createdAt: string;
  updatedAt: string;
  budget_utilization: number;
  is_over_budget: boolean;
  is_near_budget: boolean;
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

export interface Expense {
  _id: string;
  team_id: string | Team;
  amount: number;
  description: string;
  category: ExpenseCategory;
  ai_suggested_category?: ExpenseCategory;
  status: ExpenseStatus;
  created_by: string;
  created_by_name: string;
  created_by_email: string;
  receipt_url?: string;
  expense_date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  ok: boolean;
  data?: T;
  code?: string;
  message?: string;
  error?: string;
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

export interface CreateTeamRequest {
  name: string;
  budget: number;
  members?: TeamMember[];
}

export interface UpdateTeamRequest {
  name?: string;
  budget?: number;
  members?: TeamMember[];
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

export interface SearchParams {
  team_id?: string;
  category?: ExpenseCategory;
  status?: ExpenseStatus;
  search?: string;
  start_date?: string;
  end_date?: string;
}

export interface BudgetStatus {
  utilization: string;
  alertsSent: string[];
  isOverBudget: boolean;
  isNearBudget: boolean;
}

export interface AIInsights {
  insights: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}
