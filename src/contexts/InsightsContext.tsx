import React, { createContext, useContext } from "react";
import {
  SpendingInsight,
  CategoryTrend,
  SpendingPattern,
} from "../types/insights";
import { useExpenses } from "./ExpenseContext";
import { useInsightCalculations } from "../hooks/useInsights";

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
  const { monthlyExpenses, loading: expensesLoading } = useExpenses();

  // Use our new insights calculations hook
  const { insights, categoryTrends, spendingPatterns } =
    useInsightCalculations(monthlyExpenses);

  return (
    <InsightsContext.Provider
      value={{
        insights,
        categoryTrends,
        spendingPatterns,
        loading: expensesLoading,
      }}
    >
      {children}
    </InsightsContext.Provider>
  );
};
