import React, { useState } from "react";
import { Link } from "react-router-dom";
import { User, Expense } from "../types";
import toast from "react-hot-toast";
import {
  FaWallet,
  FaSignOutAlt,
  FaChartLine,
  FaExclamationTriangle,
} from "react-icons/fa";

interface DashboardProps {
  user: User;
  expenses: Expense[];
  dailyTotal: number;
  remainingBudget: number;
  addExpense: (amount: number, description: string, category: string) => void;
  getExpensesByCategory: () => { [key: string]: number };
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  expenses,
  dailyTotal,
  remainingBudget,
  addExpense,
  onLogout,
}) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("food");
  const spentPercentage = (dailyTotal / user.dailyLimit) * 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    addExpense(parsedAmount, description, category);
    setAmount("");
    setDescription("");
    toast.success("Expense added successfully");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <FaWallet className="text-blue-500 text-2xl" />
            <h1 className="text-xl font-bold">Daily Spending Tracker</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/analytics"
              className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center"
            >
              <FaChartLine className="mr-2" />
              Analytics
            </Link>
            <button
              onClick={onLogout}
              className="flex items-center text-gray-600 hover:text-gray-800 bg-gray-100 px-4 py-2 rounded-md transition-colors"
            >
              <FaSignOutAlt className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-500">Daily Limit</p>
              <FaWallet className="text-blue-500 text-xl" />
            </div>
            <p className="text-2xl font-bold">${user.dailyLimit.toFixed(2)}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-500">Total Spent</p>
              <FaChartLine className="text-green-500 text-xl" />
            </div>
            <p className="text-2xl font-bold">${dailyTotal.toFixed(2)}</p>
          </div>

          <div
            className={`bg-white p-6 rounded-lg shadow-sm ${
              remainingBudget < 0 ? "bg-red-50" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-500">Remaining</p>
              {remainingBudget < 0 && (
                <FaExclamationTriangle className="text-red-500 text-xl" />
              )}
            </div>
            <p
              className={`text-2xl font-bold ${
                remainingBudget < 0 ? "text-red-600" : ""
              }`}
            >
              ${remainingBudget.toFixed(2)}
            </p>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  spentPercentage >= 100 ? "bg-red-500" : "bg-blue-500"
                }`}
                style={{ width: `${Math.min(spentPercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Expense Card */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
              <h2 className="text-xl font-semibold text-white mb-2">Add New Expense</h2>
              <p className="text-blue-100 text-sm">Track your spending by adding expenses</p>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-5">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="0.00"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="What did you spend on?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { value: "food", label: "Food", icon: "🍔" },
                      { value: "transport", label: "Transport", icon: "🚗" },
                      { value: "entertainment", label: "Entertainment", icon: "🎮" },
                      { value: "shopping", label: "Shopping", icon: "🛍️" },
                      { value: "bills", label: "Bills", icon: "💰" },
                      { value: "other", label: "Other", icon: "📦" },
                    ].map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setCategory(cat.value)}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                          category === cat.value
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-blue-200 hover:bg-gray-50"
                        }`}
                      >
                        <span className="text-2xl mb-1">{cat.icon}</span>
                        <span className="text-sm font-medium">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center font-semibold"
                >
                  <FaWallet className="mr-2" />
                  Add Expense
                </button>
              </div>
            </form>
          </div>

          {/* Recent Expenses Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Recent Expenses</h2>
            <div className="space-y-4">
              {expenses.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No expenses yet</p>
              ) : (
                expenses.slice().reverse().map((expense) => (
                  <Link
                    to={`/expense/${expense.id}`}
                    key={expense.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
                  >
                    <div>
                      <p className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                        {expense.description}
                      </p>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="capitalize mr-2">{expense.category}</span>
                        <span>•</span>
                        <span className="ml-2">
                          {new Date(expense.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900">
                      ${expense.amount.toFixed(2)}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
