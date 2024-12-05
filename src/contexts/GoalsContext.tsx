import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { SavingsGoal, GoalProgress, Achievement } from "../types/goals";
import { SavingsTransaction, SavingsTransactionInput } from "../types/savings";
import { supabase } from "../lib/supabase";
import { toast } from "react-hot-toast";

interface GoalsContextType {
  goals: SavingsGoal[];
  achievements: Achievement[];
  loading: boolean;
  addGoal: (
    goal: Omit<
      SavingsGoal,
      | "id"
      | "user_id"
      | "created_at"
      | "updated_at"
      | "current_amount"
      | "status"
    >
  ) => Promise<void>;
  updateGoal: (goalId: string, updates: Partial<SavingsGoal>) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  getGoalProgress: (goalId: string) => GoalProgress;
  addSavingsTransaction: (transaction: SavingsTransactionInput) => Promise<void>;
  getSavingsTransactions: (goalId: string) => Promise<SavingsTransaction[]>;
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

export const useGoals = () => {
  const context = useContext(GoalsContext);
  if (!context) {
    throw new Error("useGoals must be used within a GoalsProvider");
  }
  return context;
};

export const GoalsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch goals from Supabase
  const fetchGoals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("savings_goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error("Error fetching goals:", error);
      toast.error("Failed to load savings goals");
    } finally {
      setLoading(false);
    }
  };

  // Add new goal
  const addGoal = async (
    goalData: Omit<
      SavingsGoal,
      | "id"
      | "user_id"
      | "created_at"
      | "updated_at"
      | "current_amount"
      | "status"
    >
  ) => {
    if (!user) return;

    try {
      const newGoal = {
        ...goalData,
        user_id: user.id,
        current_amount: 0,
        status: "active" as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("savings_goals")
        .insert([newGoal])
        .select()
        .single();

      if (error) throw error;

      setGoals((prev) => [data, ...prev]);
      toast.success("Savings goal created!");
    } catch (error) {
      console.error("Error adding goal:", error);
      toast.error("Failed to create savings goal");
    }
  };

  // Update existing goal
  const updateGoal = async (goalId: string, updates: Partial<SavingsGoal>) => {
    try {
      const { data, error } = await supabase
        .from("savings_goals")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", goalId)
        .select()
        .single();

      if (error) throw error;

      setGoals((prev) =>
        prev.map((goal) => (goal.id === goalId ? { ...goal, ...data } : goal))
      );

      // Check for goal completion
      if (
        data.current_amount >= data.target_amount &&
        data.status !== "completed"
      ) {
        await handleGoalCompletion(data);
      }
    } catch (error) {
      console.error("Error updating goal:", error);
      toast.error("Failed to update savings goal");
    }
  };

  // Delete goal
  const deleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from("savings_goals")
        .delete()
        .eq("id", goalId);

      if (error) throw error;

      setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
      toast.success("Goal deleted successfully");
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast.error("Failed to delete goal");
    }
  };

  // Calculate goal progress
  const getGoalProgress = (goalId: string): GoalProgress => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) {
      return {
        percentageComplete: 0,
        daysRemaining: 0,
        isOnTrack: false,
        projectedCompletion: new Date().toISOString(),
        requiredDailySavings: 0,
        currentDailySavings: 0,
      };
    }

    const totalDays = Math.ceil(
      (new Date(goal.target_date).getTime() -
        new Date(goal.start_date).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const daysRemaining = Math.ceil(
      (new Date(goal.target_date).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const percentageComplete = (goal.current_amount / goal.target_amount) * 100;

    const daysPassed = totalDays - daysRemaining;
    const currentDailySavings =
      daysPassed > 0 ? goal.current_amount / daysPassed : 0;
    const requiredDailySavings =
      daysRemaining > 0
        ? (goal.target_amount - goal.current_amount) / daysRemaining
        : 0;

    const projectedDaysToCompletion =
      currentDailySavings > 0
        ? Math.ceil(
            (goal.target_amount - goal.current_amount) / currentDailySavings
          )
        : totalDays;

    const projectedCompletion = new Date();
    projectedCompletion.setDate(
      projectedCompletion.getDate() + projectedDaysToCompletion
    );

    return {
      percentageComplete,
      daysRemaining,
      isOnTrack: currentDailySavings >= requiredDailySavings,
      projectedCompletion: projectedCompletion.toISOString(),
      requiredDailySavings,
      currentDailySavings,
    };
  };

  // Handle goal completion
  const handleGoalCompletion = async (goal: SavingsGoal) => {
    // Update goal status
    await supabase
      .from("savings_goals")
      .update({ status: "completed" })
      .eq("id", goal.id);

    // Create achievement
    const achievement: Omit<Achievement, "id"> = {
      type: "completion",
      title: "Goal Achieved! ",
      description: `Congratulations! You've reached your savings goal: ${goal.title}`,
      icon: "",
      achieved_at: new Date().toISOString(),
    };

    const { data: achievementData } = await supabase
      .from("achievements")
      .insert([achievement])
      .select()
      .single();

    if (achievementData) {
      setAchievements((prev) => [achievementData, ...prev]);
      toast.success(" Congratulations! Goal completed!");
    }
  };

  // Add a savings transaction
  const addSavingsTransaction = async (transaction: SavingsTransactionInput) => {
    if (!user) return;

    try {
      const newTransaction = {
        ...transaction,
        user_id: user.id,
        transaction_date: transaction.transaction_date || new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("savings_transactions")
        .insert([newTransaction]);

      if (error) throw error;

      // Update the goal's current amount
      const goal = goals.find((g) => g.id === transaction.goal_id);
      if (goal) {
        const newAmount = goal.current_amount + transaction.amount;
        await updateGoal(goal.id, { current_amount: newAmount });
      }

      toast.success("Savings recorded successfully!");
    } catch (error) {
      console.error("Error adding savings transaction:", error);
      toast.error("Failed to record savings");
    }
  };

  // Get savings transactions for a goal
  const getSavingsTransactions = async (goalId: string) => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from("savings_transactions")
        .select("*")
        .eq("goal_id", goalId)
        .order("transaction_date", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching savings transactions:", error);
      toast.error("Failed to load savings history");
      return [];
    }
  };

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  return (
    <GoalsContext.Provider
      value={{
        goals,
        achievements,
        loading,
        addGoal,
        updateGoal,
        deleteGoal,
        getGoalProgress,
        addSavingsTransaction,
        getSavingsTransactions,
      }}
    >
      {children}
    </GoalsContext.Provider>
  );
};
