export interface User {
  id: string;
  username: string;
  dailyLimit: number;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  timestamp: number;
}

export interface SpendingContextType {
  expenses: Expense[];
  dailyTotal: number;
  remainingBudget: number;
  addExpense: (amount: number, description: string, category: string) => void;
  resetDaily: () => void;
  getExpensesByCategory: () => { [key: string]: number };
}
