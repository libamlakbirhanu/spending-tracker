/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";

export const ExpenseSchema = z.object({
  id: z.string(),
  amount: z.number().positive(),
  description: z.string().min(1),
  created_at: z.string(),
  category_id: z.string().nullable(),
  user_id: z.string(),
});

export type Expense = z.infer<typeof ExpenseSchema>;

export type TimeWindow = "daily" | "weekly" | "monthly" | "recent";

export interface ExpenseQueryResult {
  data: Expense[];
  error: any;
}

export interface WeeklyExpense {
  date: string;
  amount: number;
}

export interface ExpenseStats {
  totalSpent: number;
  avgPerDay: number;
  highestDay: { date: string; amount: number };
  lowestDay: { date: string; amount: number };
  monthlyProjection: number;
}

export interface CategoryExpense {
  category_id: string;
  total: number;
}
