/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from "../lib/supabase";
import { Expense, TimeWindow, ExpenseQueryResult } from "../types/expense";
import { ExpenseSchema } from "../types/expense";

const getTimeWindowDates = (window: TimeWindow) => {
  const now = new Date();
  const today = new Date(now.setHours(0, 0, 0, 0));
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  let windowSize = new Date();

  switch (window) {
    case "daily":
      return { start: today, end: tomorrow };
    case "weekly":
      windowSize = new Date(today);
      windowSize.setDate(windowSize.getDate() - 7);
      return { start: windowSize, end: tomorrow };
    case "monthly":
      windowSize = new Date(today);
      windowSize.setMonth(windowSize.getMonth() - 1);
      return { start: windowSize, end: tomorrow };
    case "recent":
      windowSize = new Date(today);
      windowSize.setDate(windowSize.getDate() - 90);
      return { start: windowSize, end: tomorrow };
    default:
      return { start: today, end: tomorrow };
  }
};

export const fetchExpensesByTimeWindow = async (
  userId: string,
  timeWindow: TimeWindow,
  page = 1,
  pageSize = 20
): Promise<ExpenseQueryResult> => {
  try {
    const { start, end } = getTimeWindowDates(timeWindow);

    // For daily expenses, fetch all without pagination
    const query = supabase
      .from("expenses")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .gte("created_at", start.toISOString())
      .lt("created_at", end.toISOString())
      .order("created_at", { ascending: false });

    // Only apply pagination for non-daily queries
    const { data, error } = await (timeWindow === "daily"
      ? query
      : query.range((page - 1) * pageSize, page * pageSize - 1));

    if (error) throw error;

    // Validate data
    const validatedData = data
      .map((expense) => {
        try {
          return ExpenseSchema.parse(expense);
        } catch (e) {
          console.error("Invalid expense data:", expense, e);
          return null;
        }
      })
      .filter((expense): expense is Expense => expense !== null);

    return {
      data: validatedData,
      error: null,
      // count: count ?? 0,
      // hasMore: timeWindow !== "daily" && (count ?? 0) > page * pageSize,
    };
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return {
      data: [],
      error,
      // count: 0,
      // hasMore: false,
    };
  }
};

export const addExpense = async (
  userId: string,
  expense: Omit<Expense, "id" | "user_id" | "created_at">
): Promise<{ data: Expense | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from("expenses")
      .insert([
        {
          ...expense,
          user_id: userId,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    const validatedExpense = ExpenseSchema.parse(data);
    return { data: validatedExpense, error: null };
  } catch (error) {
    console.error("Error adding expense:", error);
    return { data: null, error };
  }
};
