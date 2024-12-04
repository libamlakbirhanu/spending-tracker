import React, { useState } from "react";
import { FaPlus, FaWallet, FaChartBar, FaCalendarAlt } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { useExpenses } from "../contexts/ExpenseContext";
import ExpenseForm from "./ExpenseForm";
import SpendingChart from "./SpendingChart";
import WeeklySpendingChart from "./WeeklySpendingChart";
import ExpenseList from "./ExpenseList";

export const Dashboard: React.FC = () => {
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const { userSettings } = useAuth();
  const {
    expenses,
    dailyTotal,
    remainingBudget,
    addExpense,
    getExpensesByCategory,
    weeklyExpenses,
  } = useExpenses();

  const handleAddExpense = async (
    amount: number,
    description: string,
    category: string
  ) => {
    await addExpense(amount, description, category);
    setShowExpenseForm(false);
  };
  // Remove loading spinner since we handle loading at the route level
  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
  //     </div>
  //   );
  // }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-orange-500";
    return "bg-blue-500";
  };

  const spendingPercentage =
    (dailyTotal / (userSettings?.daily_limit || 1)) * 100;
  const progressColor = getProgressColor(spendingPercentage);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Daily Spending */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-medium text-gray-500">
                Daily Spending
              </h2>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${dailyTotal.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FaWallet className="text-blue-600 text-xl" />
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`${progressColor} h-2 rounded-full transition-all duration-500`}
              style={{
                width: `${Math.min(spendingPercentage, 100)}%`,
              }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {spendingPercentage.toFixed(1)}% of daily limit
          </p>
        </div>

        {/* Remaining Budget */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-medium text-gray-500">
                Remaining Budget
              </h2>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${remainingBudget.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FaCalendarAlt className="text-green-600 text-xl" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {(
              (remainingBudget / (userSettings?.daily_limit || 1)) *
              100
            ).toFixed(1)}
            % remaining
          </p>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-500">Quick Actions</h2>
            <div className="p-3 bg-purple-100 rounded-full">
              <FaChartBar className="text-purple-600 text-xl" />
            </div>
          </div>
          <button
            onClick={() => setShowExpenseForm(true)}
            className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center font-medium"
          >
            <FaPlus className="mr-2" />
            Add Expense
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Expenses */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Expenses
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {expenses.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No expenses recorded yet
              </div>
            ) : (
              <ExpenseList expenses={expenses} />
            )}
          </div>
        </div>

        {/* Weekly Spending Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Last 7 Days Spending
          </h2>
          <WeeklySpendingChart weeklyExpenses={weeklyExpenses} />
        </div>
      </div>

      {/* Category Spending Chart */}
      <div className="mt-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Spending by Category
          </h2>
          <SpendingChart expenses={getExpensesByCategory()} />
        </div>
      </div>

      {/* Add Expense Modal */}
      {showExpenseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Add New Expense
                </h2>
                <button
                  onClick={() => setShowExpenseForm(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ×
                </button>
              </div>
              <ExpenseForm
                onSubmit={handleAddExpense}
                onClose={() => setShowExpenseForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
