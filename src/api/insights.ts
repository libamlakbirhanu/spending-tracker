import { Expense } from "../types";
import {
  CategoryTrend,
  SpendingPattern,
  SpendingInsight,
} from "../types/insights";

export const analyzeCategoryTrends = (expenses: Expense[]): CategoryTrend[] => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

  const categoryTotals: {
    [key: string]: { current: number; previous: number };
  } = {};

  expenses.forEach((expense) => {
    if (!expense.category_id) return;

    const expenseDate = new Date(expense.created_at);
    const isCurrentPeriod = expenseDate >= thirtyDaysAgo;

    if (!categoryTotals[expense.category_id]) {
      categoryTotals[expense.category_id] = { current: 0, previous: 0 };
    }

    if (isCurrentPeriod) {
      categoryTotals[expense.category_id].current += expense.amount;
    } else {
      categoryTotals[expense.category_id].previous += expense.amount;
    }
  });

  return Object.entries(categoryTotals).map(([category_id, totals]) => {
    const percentageChange =
      ((totals.current - totals.previous) / (totals.previous || 1)) * 100;
    return {
      category_id,
      previousAverage: totals.previous,
      currentAmount: totals.current,
      percentageChange,
      trend:
        percentageChange > 10
          ? "increasing"
          : percentageChange < -10
          ? "decreasing"
          : "stable",
    };
  });
};

export const analyzeSpendingPatterns = (
  expenses: Expense[]
): SpendingPattern[] => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

  const patterns: {
    [key: string]: {
      total: number;
      count: number;
      recentTotal: number;
      recentCount: number;
    };
  } = {};

  // Analyze patterns by day of week
  expenses.forEach((expense) => {
    const date = new Date(expense.created_at);
    const weekday = date.toLocaleDateString("en-US", { weekday: "long" });

    if (!patterns[weekday]) {
      patterns[weekday] = {
        total: 0,
        count: 0,
        recentTotal: 0,
        recentCount: 0,
      };
    }

    patterns[weekday].total += expense.amount;
    patterns[weekday].count += 1;

    if (date >= thirtyDaysAgo) {
      patterns[weekday].recentTotal += expense.amount;
      patterns[weekday].recentCount += 1;
    }
  });

  return Object.entries(patterns)
    .map(([weekday, data]) => {
      const averageSpending = data.count > 0 ? data.total / data.count : 0;
      const frequency = data.count;

      return {
        weekday,
        averageSpending,
        frequency,
      };
    })
    .sort((a, b) => b.frequency - a.frequency);
};

export const generateInsights = (
  categoryTrends: CategoryTrend[],
  patterns: SpendingPattern[]
): SpendingInsight[] => {
  const insights: SpendingInsight[] = [];

  // Add insights based on category trends
  categoryTrends
    .filter((trend) => Math.abs(trend.percentageChange) > 20)
    .forEach((trend) => {
      insights.push({
        id: `cat-trend-${trend.category_id}`,
        type: trend.percentageChange > 0 ? "warning" : "trend",
        title:
          trend.percentageChange > 0
            ? "Spending Increase Alert"
            : "Spending Decrease Noticed",
        description: `Spending in this category has ${
          trend.percentageChange > 0 ? "increased" : "decreased"
        } by ${Math.abs(trend.percentageChange).toFixed(
          1
        )}% compared to last month`,
        priority: Math.abs(trend.percentageChange) > 50 ? 5 : 3,
        category_id: trend.category_id,
        metadata: {
          percentageChange: trend.percentageChange,
          comparisonPeriod: "last month",
          currentValue: trend.currentAmount,
        },
        created_at: new Date().toISOString(),
      });
    });

  // Add insights based on spending patterns
  patterns
    .filter((pattern) => pattern.frequency > 5)
    .forEach((pattern) => {
      if (pattern.averageSpending > 0) {
        insights.push({
          id: `pattern-${pattern.weekday}`,
          type: "trend",
          title: "Spending Pattern Detected",
          description: `You tend to spend more on ${pattern.weekday}s`,
          priority: 2,
          metadata: {
            currentValue: pattern.averageSpending,
          },
          created_at: new Date().toISOString(),
        });
      }
    });

  // Add achievement insights if spending is decreasing
  const totalCurrentSpending = categoryTrends.reduce(
    (sum, trend) => sum + trend.currentAmount,
    0
  );
  const totalPreviousSpending = categoryTrends.reduce(
    (sum, trend) => sum + trend.previousAverage,
    0
  );
  if (
    totalCurrentSpending < totalPreviousSpending &&
    totalPreviousSpending > 0
  ) {
    insights.push({
      id: "achievement-spending-decrease",
      type: "achievement",
      title: "Spending Reduction Achievement",
      description:
        "Your overall spending has decreased compared to last month!",
      priority: 4,
      metadata: {
        percentageChange:
          ((totalPreviousSpending - totalCurrentSpending) /
            totalPreviousSpending) *
          100,
      },
      created_at: new Date().toISOString(),
    });
  }

  return insights.sort((a, b) => b.priority - a.priority);
};
