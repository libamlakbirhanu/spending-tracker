import React, { createContext, useContext, useState, useEffect } from 'react';
import { SpendingContextType, Expense } from '../types';
import { useAuth } from './AuthContext';
import { getStoredExpenses, storeExpenses, clearOldExpenses } from '../utils/storage';

const SpendingContext = createContext<SpendingContextType | undefined>(undefined);

export const SpendingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    if (user) {
      clearOldExpenses(user.id);
      const storedExpenses = getStoredExpenses(user.id);
      setExpenses(storedExpenses);
    } else {
      setExpenses([]);
    }
  }, [user]);

  const dailyTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remainingBudget = user ? user.dailyLimit - dailyTotal : 0;

  const addExpense = (amount: number, description: string, category: string) => {
    if (!user) return;

    const newExpense: Expense = {
      id: crypto.randomUUID(),
      amount,
      description,
      category,
      timestamp: Date.now(),
    };

    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);
    storeExpenses(user.id, updatedExpenses);
  };

  const resetDaily = () => {
    if (!user) return;
    setExpenses([]);
    storeExpenses(user.id, []);
  };

  const getExpensesByCategory = () => {
    return expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as { [key: string]: number });
  };

  return (
    <SpendingContext.Provider
      value={{
        expenses,
        dailyTotal,
        remainingBudget,
        addExpense,
        resetDaily,
        getExpensesByCategory,
      }}
    >
      {children}
    </SpendingContext.Provider>
  );
};

export const useSpending = () => {
  const context = useContext(SpendingContext);
  if (context === undefined) {
    throw new Error('useSpending must be used within a SpendingProvider');
  }
  return context;
};