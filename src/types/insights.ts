export interface SpendingInsight {
  id: string;
  type: 'warning' | 'tip' | 'achievement' | 'trend';
  title: string;
  description: string;
  priority: number; // 1-5, with 5 being highest priority
  category_id?: string;
  metadata?: {
    percentageChange?: number;
    comparisonPeriod?: string;
    threshold?: number;
    currentValue?: number;
  };
  created_at: string;
}

export interface CategoryTrend {
  category_id: string;
  previousAverage: number;
  currentAmount: number;
  percentageChange: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface SpendingPattern {
  weekday: string;
  averageSpending: number;
  frequency: number;
}
