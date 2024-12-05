export interface SavingsGoal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  category_id?: string;
  start_date: string;
  target_date: string;
  status: 'active' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface GoalMilestone {
  id: string;
  goal_id: string;
  amount: number;
  achieved: boolean;
  achieved_at?: string;
}

export interface GoalProgress {
  percentageComplete: number;
  daysRemaining: number;
  isOnTrack: boolean;
  projectedCompletion: string;
  requiredDailySavings: number;
  currentDailySavings: number;
}

export interface Achievement {
  id: string;
  type: 'milestone' | 'completion' | 'streak';
  title: string;
  description: string;
  icon: string;
  achieved_at: string;
}
