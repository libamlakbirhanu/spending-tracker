import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import { Expense } from "../types";
import toast from "react-hot-toast";

interface ExpenseContextType {
  expenses: Expense[];
  dailyTotal: number;
  remainingBudget: number;
  addExpense: (
    amount: number,
    description: string,
    category: string
  ) => Promise<void>;
  getExpensesByCategory: () => { [key: string]: number };
  loading: boolean;
  totalSpent: number;
  weeklyExpenses: { date: string; amount: number }[];
  getHistoricalExpensesByCategory: () => Promise<{ [key: string]: number }>;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [weeklyExpenses, setWeeklyExpenses] = useState<
    { date: string; amount: number }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const { user, userSettings } = useAuth();

  const fetchExpenses = async () => {
    if (!user) {
      console.log("No user, skipping expense fetch");
      setExpenses([]);
      return;
    }

    try {
      console.log("Fetching expenses for user:", user.id);
      setLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data, error } = await supabase
        .from("expenses")
        .select("*, category_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      const { data: dailyData, error: dailyError } = await supabase
        .from("expenses")
        .select("*, category_id")
        .eq("user_id", user.id)
        .gte("created_at", today.toISOString())
        .lt("created_at", tomorrow.toISOString())
        .order("created_at", { ascending: false });

      if (error || dailyError) {
        throw error;
      }

      setExpenses(dailyData || []);
      const total = (data || []).reduce(
        (sum, expense) => sum + expense.amount,
        0
      );
      setTotalSpent(total);
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyExpenses = async () => {
    if (!user) return;

    try {
      console.log("Fetching weekly expenses...");
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 6); // Change to -6 to include today
      lastWeek.setHours(0, 0, 0, 0);

      console.log("Fetching expenses from:", lastWeek.toISOString());
      const { data: weeklyData, error: weeklyError } = await supabase
        .from("expenses")
        .select("amount, created_at")
        .eq("user_id", user.id)
        .gte("created_at", lastWeek.toISOString())
        .order("created_at", { ascending: true });

      if (weeklyError) throw weeklyError;

      console.log("Weekly data received:", weeklyData);

      // Create a map for all days in the last week, initialized with 0
      const dailyTotals: { [key: string]: number } = {};
      for (let i = 0; i <= 6; i++) {
        const date = new Date(lastWeek);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split("T")[0];
        dailyTotals[dateStr] = 0;
      }

      // Add the actual expenses
      weeklyData.forEach((exp) => {
        const date = new Date(exp.created_at).toISOString().split("T")[0];
        dailyTotals[date] = (dailyTotals[date] || 0) + exp.amount;
      });

      // Convert to array format
      const weeklyTotals = Object.entries(dailyTotals).map(
        ([date, amount]) => ({
          date,
          amount,
        })
      );

      console.log("Processed weekly totals:", weeklyTotals);
      setWeeklyExpenses(weeklyTotals);
    } catch (error) {
      console.error("Failed to fetch weekly expenses:", error);
      toast.error("Failed to load weekly expenses");
    }
  };

  const addExpense = async (
    amount: number,
    description: string,
    category: string
  ) => {
    if (!user) return;

    const { error } = await supabase.from("expenses").insert([
      {
        user_id: user.id,
        amount,
        description,
        category_id: category,
      },
    ]);

    if (error) {
      toast.error("Failed to add expense");
      throw error;
    }

    toast.success("Expense added successfully");
    await fetchExpenses();
  };

  const dailyTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remainingBudget = userSettings
    ? userSettings.daily_limit - dailyTotal
    : 0;

  const getExpensesByCategory = () => {
    console.log("Getting expenses by category...");
    console.log("Current expenses:", expenses);

    const categoryTotals = expenses.reduce((acc, expense) => {
      const categoryId = expense.category_id;
      if (!categoryId) {
        console.log("Found expense without category:", expense);
        return acc;
      }
      acc[categoryId] = (acc[categoryId] || 0) + expense.amount;
      return acc;
    }, {} as { [key: string]: number });

    console.log("Category totals:", categoryTotals);
    return categoryTotals;
  };

  const getHistoricalExpensesByCategory = async () => {
    if (!user) return {};

    try {
      console.log("Fetching historical expenses by category...");
      const { data, error } = await supabase
        .from("expenses")
        .select("amount, category_id")
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      console.log("Historical expense data:", data);

      const totals = data.reduce((acc: { [key: string]: number }, expense) => {
        if (expense.category_id) {
          acc[expense.category_id] =
            (acc[expense.category_id] || 0) + expense.amount;
        } else {
          // Add to "Uncategorized" if no category
          acc["uncategorized"] = (acc["uncategorized"] || 0) + expense.amount;
        }
        return acc;
      }, {});

      console.log("Processed category totals:", totals);
      return totals;
    } catch (error) {
      console.error("Failed to load historical expenses:", error);
      toast.error("Failed to load historical expenses");
      return {};
    }
  };

  useEffect(() => {
    let mounted = true;
    console.log("ExpenseContext: User or settings changed", {
      userId: user?.id,
      hasSettings: !!userSettings,
    });

    if (user && userSettings) {
      (async () => {
        try {
          await fetchExpenses();
          if (mounted) {
            await fetchWeeklyExpenses();
          }
        } catch (error) {
          console.error("Failed to fetch expenses:", error);
          if (mounted) {
            toast.error("Failed to load expenses");
          }
        }
      })();
    } else {
      setExpenses([]);
      setTotalSpent(0);
      setWeeklyExpenses([]);
    }

    return () => {
      mounted = false;
    };
  }, [user, userSettings]);

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        dailyTotal,
        remainingBudget,
        addExpense,
        getExpensesByCategory,
        loading,
        totalSpent,
        weeklyExpenses,
        getHistoricalExpensesByCategory,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error("useExpenses must be used within an ExpenseProvider");
  }
  return context;
};
