import React, { createContext, useContext, useState, useEffect } from "react";
import { SpendingContextType, Expense } from "../types";
import { useAuth } from "./AuthContext";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

const SpendingContext = createContext<SpendingContextType | undefined>(
  undefined
);

export const SpendingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, userSettings } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

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

  const dailyTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remainingBudget = user
    ? (userSettings?.daily_limit || 0) - dailyTotal
    : 0;

  const addExpense = async (
    amount: number,
    description: string,
    category: string
  ): Promise<void> => {
    if (!user) return;

    try {
      const { error } = await supabase.from("expenses").insert([
        {
          user_id: user.id,
          amount,
          description,
          category,
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

  const getExpensesByCategory = () => {
    return expenses.reduce((acc, expense) => {
      acc[expense.category_id] =
        (acc[expense.category_id] || 0) + expense.amount;
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
        getExpensesByCategory,
        loading,
      }}
    >
      {children}
    </SpendingContext.Provider>
  );
};

export const useSpending = () => {
  const context = useContext(SpendingContext);
  if (context === undefined) {
    throw new Error("useSpending must be used within a SpendingProvider");
  }
  return context;
};
