export interface SavingsTransaction {
  id: string;
  user_id: string;
  goal_id: string;
  amount: number;
  description: string;
  transaction_date: string;
  created_at: string;
  updated_at: string;
}

export interface SavingsTransactionInput {
  goal_id: string;
  amount: number;
  description: string;
  transaction_date?: string;
}
