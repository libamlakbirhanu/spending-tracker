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
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, userSettings } = useAuth();

  const fetchExpenses = async () => {
    try {
      if (!user) {
        setExpenses([]);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching expenses:", error);
        toast.error("Failed to load expenses");
        return;
      }

      setExpenses(data || []);
    } catch (error) {
      console.error("Error in fetchExpenses:", error);
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchExpenses();
    } else {
      setExpenses([]);
      setLoading(false);
    }
  }, [user]);

  const addExpense = async (
    amount: number,
    description: string,
    category: string
  ) => {
    if (!user) return;

    try {
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
    } catch (error) {
      console.error("Error adding expense:", error);
      throw error;
    }
  };

  const dailyTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remainingBudget = userSettings
    ? userSettings.daily_limit - dailyTotal
    : 0;

  const getExpensesByCategory = () => {
    return expenses.reduce((acc, expense) => {
      acc[expense.category_id] =
        (acc[expense.category_id] || 0) + expense.amount;
      return acc;
    }, {} as { [key: string]: number });
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        dailyTotal,
        remainingBudget,
        addExpense,
        getExpensesByCategory,
        loading,
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
