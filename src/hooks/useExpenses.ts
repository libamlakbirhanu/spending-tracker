import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchExpensesByTimeWindow, addExpense } from "../api/expenses";
import {
  TimeWindow,
  Expense,
  WeeklyExpense,
  ExpenseStats,
} from "../types/expense";
import { useAuth } from "../contexts/AuthContext";
import { useMemo } from "react";

const STALE_TIME = 5 * 60 * 1000; // 5 minutes
// const CACHE_TIME = 30 * 60 * 1000; // 30 minutes

export function useExpenseQuery(timeWindow: TimeWindow, page = 1) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["expenses", timeWindow, page],
    queryFn: () => fetchExpensesByTimeWindow(user?.id || "", timeWindow, page),
    staleTime: STALE_TIME,
    enabled: !!user,
  });
}

export function useAddExpense() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newExpense: Omit<Expense, "id" | "user_id" | "created_at">) =>
      addExpense(user?.id || "", newExpense),
    onSuccess: () => {
      // Invalidate all expense queries to refetch with new data
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

export function useExpenseStats(expenses: Expense[]): ExpenseStats {
  return useMemo(() => {
    if (!expenses.length) {
      return {
        totalSpent: 0,
        avgPerDay: 0,
        highestDay: { date: "", amount: 0 },
        lowestDay: { date: "", amount: 0 },
        monthlyProjection: 0,
      };
    }

    const dailyTotals: { [key: string]: number } = {};

    expenses.forEach((expense) => {
      const date = new Date(expense.created_at).toISOString().split("T")[0];
      dailyTotals[date] = (dailyTotals[date] || 0) + expense.amount;
    });

    const dailyAmounts = Object.entries(dailyTotals);
    const total = Object.values(dailyTotals).reduce(
      (sum, amount) => sum + amount,
      0
    );
    const avg = total / dailyAmounts.length;

    const highest = dailyAmounts.reduce(
      (max, [date, amount]) => (amount > max.amount ? { date, amount } : max),
      { date: "", amount: 0 }
    );

    const lowest = dailyAmounts.reduce(
      (min, [date, amount]) => (amount < min.amount ? { date, amount } : min),
      { date: "", amount: Number.MAX_VALUE }
    );

    return {
      totalSpent: total,
      avgPerDay: avg,
      highestDay: highest,
      lowestDay:
        lowest.amount === Number.MAX_VALUE ? { date: "", amount: 0 } : lowest,
      monthlyProjection: avg * 30,
    };
  }, [expenses]);
}

export function useWeeklyExpenses(expenses: Expense[]): WeeklyExpense[] {
  return useMemo(() => {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 6);
    lastWeek.setHours(0, 0, 0, 0);

    const weeklyData: WeeklyExpense[] = [];

    for (let i = 0; i <= 6; i++) {
      const date = new Date(lastWeek);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];

      const dailyExpenses = expenses.filter((expense) => {
        const expenseDate = new Date(expense.created_at)
          .toISOString()
          .split("T")[0];
        return expenseDate === dateStr;
      });

      const dailyTotal = dailyExpenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );

      weeklyData.push({ date: dateStr, amount: dailyTotal });
    }

    return weeklyData;
  }, [expenses]);
}

export function useCategoryExpenses(expenses: Expense[]) {
  return useMemo(() => {
    return expenses.reduce((acc: { [key: string]: number }, expense) => {
      const categoryId = expense.category_id;
      if (!categoryId) {
        acc["uncategorized"] = (acc["uncategorized"] || 0) + expense.amount;
        return acc;
      }
      acc[categoryId] = (acc[categoryId] || 0) + expense.amount;
      return acc;
    }, {});
  }, [expenses]);
}
