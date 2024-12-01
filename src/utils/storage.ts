import { Expense } from "../types";

export const getStoredExpenses = (userId: string): Expense[] => {
  const expenses = localStorage.getItem(`expenses_${userId}`);
  return expenses ? JSON.parse(expenses) : [];
};

export const storeExpenses = (userId: string, expenses: Expense[]): void => {
  localStorage.setItem(`expenses_${userId}`, JSON.stringify(expenses));
};

export const clearOldExpenses = (userId: string): void => {
  const expenses = getStoredExpenses(userId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentExpenses = expenses.filter(
    (expense) => expense.created_at >= today.getTime()
  );

  storeExpenses(userId, currentExpenses);
};
