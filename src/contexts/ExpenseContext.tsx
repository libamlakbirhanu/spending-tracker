import React, { createContext, useContext, useMemo } from "react";
import { useAuth } from "./AuthContext";
import { Expense } from "../types/expense";
import {
  useExpenseQuery,
  useAddExpense,
  useExpenseStats,
  useWeeklyExpenses,
  useCategoryExpenses,
} from "../hooks/useExpenses";
import toast from "react-hot-toast";

interface ExpenseContextType {
  expenses: Expense[];
  monthlyExpenses: Expense[];
  recentExpenses: Expense[];
  dailyTotal: number;
  remainingBudget: number;
  addExpense: (
    amount: number,
    description: string,
    category: string
  ) => Promise<void>;
  loading: boolean;
  isAddingExpense: boolean;
  totalSpent: number;
  weeklyExpenses: { date: string; amount: number }[];
  getExpensesByCategory: () => { [key: string]: number };
  getHistoricalExpensesByCategory: () => Promise<{ [key: string]: number }>;
  historicalExpenses: { [key: string]: number };
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { userSettings } = useAuth();

  // Fetch expenses for different time windows
  const {
    data: dailyData = { data: [], count: 0 },
    isLoading: isDailyLoading,
  } = useExpenseQuery("daily");

  const {
    data: monthlyData = { data: [], count: 0 },
    isLoading: isMonthlyLoading,
  } = useExpenseQuery("monthly");

  const {
    data: recentData = { data: [], count: 0 },
    isLoading: isRecentLoading,
  } = useExpenseQuery("recent");

  const addExpenseMutation = useAddExpense();

  // Calculate derived states using memoized hooks
  const stats = useExpenseStats(monthlyData.data);
  const weeklyExpenses = useWeeklyExpenses(monthlyData.data);
  const categoryExpenses = useCategoryExpenses(dailyData.data);
  const historicalCategoryExpenses = useCategoryExpenses(monthlyData.data);

  // Calculate daily total and remaining budget
  const dailyTotal = useMemo(() => {
    return dailyData.data.reduce((sum, expense) => sum + expense.amount, 0);
  }, [dailyData.data]);

  const remainingBudget = useMemo(() => {
    if (!userSettings?.daily_limit) return 0;
    const limit = userSettings.daily_limit;
    return Math.max(0, limit - dailyTotal);
  }, [userSettings?.daily_limit, dailyTotal]);

  const handleAddExpense = async (
    amount: number,
    description: string,
    category: string
  ) => {
    try {
      await addExpenseMutation.mutateAsync({
        amount,
        description,
        category_id: category,
      });
      toast.success("Expense added successfully");
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error("Failed to add expense");
    }
  };

  const getExpensesByCategory = () => categoryExpenses;

  const getHistoricalExpensesByCategory = async () => {
    return historicalCategoryExpenses;
  };

  const loading = isDailyLoading || isMonthlyLoading || isRecentLoading;
  const isAddingExpense = addExpenseMutation.isPending;

  return (
    <ExpenseContext.Provider
      value={{
        expenses: dailyData.data,
        monthlyExpenses: monthlyData.data,
        recentExpenses: recentData.data,
        dailyTotal,
        remainingBudget,
        addExpense: handleAddExpense,
        loading,
        isAddingExpense,
        totalSpent: stats.totalSpent,
        weeklyExpenses,
        getExpensesByCategory,
        getHistoricalExpensesByCategory,
        historicalExpenses: historicalCategoryExpenses,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error("useExpenses must be used within an ExpenseProvider");
  }
  return context;
};
