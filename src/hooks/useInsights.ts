import { useMemo } from "react";
import { Expense } from "../types";
import {
  analyzeCategoryTrends,
  analyzeSpendingPatterns,
  generateInsights,
} from "../api/insights";

export function useInsightCalculations(expenses: Expense[]) {
  const categoryTrends = useMemo(
    () => analyzeCategoryTrends(expenses),
    [expenses]
  );

  const spendingPatterns = useMemo(
    () => analyzeSpendingPatterns(expenses),
    [expenses]
  );

  const insights = useMemo(
    () => generateInsights(categoryTrends, spendingPatterns),
    [categoryTrends, spendingPatterns]
  );

  return {
    categoryTrends,
    spendingPatterns,
    insights,
  };
}
