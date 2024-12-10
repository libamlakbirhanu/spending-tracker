/* eslint-disable @typescript-eslint/no-explicit-any */
import { User as SupabaseUser } from "@supabase/supabase-js";

export interface DBUser {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserMetadata {
  username: string;
  avatar_url?: string;
  phone?: string;
}

export type User = Omit<SupabaseUser, "user_metadata"> & {
  user_metadata: UserMetadata;
};

export interface UserSettings {
  user_id: string;
  daily_limit: number;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category_id: string | null;
  created_at: string;
}

export interface SpendingContextType {
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

export interface AuthContextType {
  user: User | null;
  userSettings: UserSettings | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    options?: {
      data: {
        username: string;
        phone: string | null;
        avatar_url: string | null;
      };
    }
  ) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<{ error: any }>;
}
