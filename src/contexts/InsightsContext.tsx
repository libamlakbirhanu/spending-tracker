import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import {
  SpendingInsight,
  CategoryTrend,
  SpendingPattern,
} from "../types/insights";
import { Expense } from "../types";
import { useExpenses } from "./ExpenseContext";
import { useCategories } from "./CategoryContext";

interface InsightsContextType {
  insights: SpendingInsight[];
  categoryTrends: CategoryTrend[];
  spendingPatterns: SpendingPattern[];
  loading: boolean;
}

const InsightsContext = createContext<InsightsContextType | undefined>(
  undefined
);

export const useInsights = () => {
  const context = useContext(InsightsContext);
  if (!context) {
    throw new Error("useInsights must be used within an InsightsProvider");
  }
  return context;
};

export const InsightsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const { monthlyExpenses, allTimeExpenses } = useExpenses();
  const { categories } = useCategories();
  const [insights, setInsights] = useState<SpendingInsight[]>([]);
  const [categoryTrends, setCategoryTrends] = useState<CategoryTrend[]>([]);
  const [spendingPatterns, setSpendingPatterns] = useState<SpendingPattern[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  // Analyze category trends
  const analyzeCategoryTrends = (expenses: Expense[]) => {
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

    const trends: CategoryTrend[] = Object.entries(categoryTotals).map(
      ([category_id, totals]) => {
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
      }
    );

    setCategoryTrends(trends);
    return trends;
  };

  // Analyze spending patterns
  const analyzeSpendingPatterns = (expenses: Expense[]) => {
    const patterns: { [key: string]: { total: number; count: number } } = {};

    expenses.forEach((expense) => {
      const date = new Date(expense.created_at);
      const weekday = date.toLocaleDateString("en-US", { weekday: "long" });

      if (!patterns[weekday]) {
        patterns[weekday] = { total: 0, count: 0 };
      }

      patterns[weekday].total += expense.amount;
      patterns[weekday].count += 1;
    });

    const weekdayPatterns: SpendingPattern[] = Object.entries(patterns).map(
      ([weekday, data]) => ({
        weekday,
        averageSpending: data.total / data.count,
        frequency: data.count,
      })
    );

    setSpendingPatterns(weekdayPatterns);
    return weekdayPatterns;
  };

  // Generate insights based on analysis
  const generateInsights = (
    expenses: Expense[],
    trends: CategoryTrend[],
    patterns: SpendingPattern[]
  ) => {
    const newInsights: SpendingInsight[] = [];

    // Analyze category trends
    trends.forEach((trend) => {
      if (trend.trend === "increasing") {
        const category = categories.find((c) => c.id === trend.category_id);
        newInsights.push({
          id: `trend-${trend.category_id}`,
          type: "warning",
          title: `Higher ${category?.name || "Category"} Spending`,
          description: `Your spending in ${
            category?.name || "this category"
          } has increased by ${trend.percentageChange.toFixed(
            1
          )}% compared to last month.`,
          priority: trend.percentageChange > 50 ? 5 : 3,
          category_id: trend.category_id,
          metadata: {
            percentageChange: trend.percentageChange,
            comparisonPeriod: "30 days",
          },
          created_at: new Date().toISOString(),
        });
      }
    });

    // Analyze spending patterns
    const highFrequencyDays = patterns.filter((p) => p.frequency > 10);
    highFrequencyDays.forEach((pattern) => {
      newInsights.push({
        id: `pattern-${pattern.weekday}`,
        type: "trend",
        title: `${pattern.weekday} Spending Pattern`,
        description: `You tend to spend more on ${
          pattern.weekday
        }s, averaging $${pattern.averageSpending.toFixed(2)} per transaction.`,
        priority: 2,
        metadata: {
          currentValue: pattern.averageSpending,
        },
        created_at: new Date().toISOString(),
      });
    });

    // Analyze recent achievements
    const recentTotal = expenses
      .filter(
        (e) =>
          new Date(e.created_at) >=
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      )
      .reduce((sum, e) => sum + e.amount, 0);

    const previousTotal = expenses
      .filter((e) => {
        const date = new Date(e.created_at);
        const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return date >= twoWeeksAgo && date < oneWeekAgo;
      })
      .reduce((sum, e) => sum + e.amount, 0);

    if (recentTotal < previousTotal) {
      newInsights.push({
        id: "achievement-weekly-reduction",
        type: "achievement",
        title: "Reduced Weekly Spending!",
        description: `Great job! You've spent ${(
          ((previousTotal - recentTotal) / previousTotal) *
          100
        ).toFixed(1)}% less this week compared to last week.`,
        priority: 4,
        metadata: {
          percentageChange:
            ((previousTotal - recentTotal) / previousTotal) * 100,
          comparisonPeriod: "7 days",
        },
        created_at: new Date().toISOString(),
      });
    }

    setInsights(newInsights);
  };

  useEffect(() => {
    if (!user || !allTimeExpenses.length) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const trends = analyzeCategoryTrends(monthlyExpenses);
    const patterns = analyzeSpendingPatterns(allTimeExpenses);
    generateInsights(allTimeExpenses, trends, patterns);
    setLoading(false);
  }, [user, allTimeExpenses, categories]);

  return (
    <InsightsContext.Provider
      value={{ insights, categoryTrends, spendingPatterns, loading }}
    >
      {children}
    </InsightsContext.Provider>
  );
};
