import { User, Expense } from '../types';

// Sample users
const DEFAULT_USERS: User[] = [
  { id: '1', username: 'demo', password: 'demo123', dailyLimit: 100 },
  { id: '2', username: 'test', password: 'test123', dailyLimit: 50 },
];

export const getUsers = (): User[] => {
  const users = localStorage.getItem('users');
  if (!users) {
    localStorage.setItem('users', JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }
  return JSON.parse(users);
};

export const getUser = (username: string, password: string): User | null => {
  const users = getUsers();
  return users.find(
    (user) => user.username === username && user.password === password
  ) || null;
};

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
    (expense) => expense.timestamp >= today.getTime()
  );
  
  storeExpenses(userId, currentExpenses);
};