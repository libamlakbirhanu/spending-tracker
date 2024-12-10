export interface User {
  id: string;
  username: string;
  password: string;
  dailyLimit: number;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  created_at: number;
  category: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

export interface ExpenseContextType {
  expenses: Expense[];
  monthlyExpenses: Expense[];
  recentExpenses: Expense[];
  dailyTotal: number;
  remainingBudget: number;
  addExpense: (amount: number, description: string, category: string) => Promise<void>;
  getExpensesByCategory: () => { [key: string]: number };
  loading: boolean;
  totalSpent: number;
  weeklyExpenses: { date: string; amount: number }[];
  getHistoricalExpensesByCategory: () => Promise<{ [key: string]: number }>;
  historicalExpenses: { [key: string]: number };
}

export const EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
