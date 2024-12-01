import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { FaWallet } from "react-icons/fa";
import { Dashboard } from "./components/Dashboard";
import { SpendingAnalytics } from "./components/SpendingAnalytics";
import { ExpenseDetail } from "./components/ExpenseDetail";
import { User, Expense } from "./types";

function App() {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("currentUser");
    return stored ? JSON.parse(stored) : null;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    if (!user) return [];
    const stored = localStorage.getItem(`expenses_${user.id}`);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`expenses_${user.id}`);
      setExpenses(stored ? JSON.parse(stored) : []);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`expenses_${user.id}`, JSON.stringify(expenses));
    }
  }, [expenses, user]);

  const login = () => {
    const newUser = { id: "1", username: "demo", dailyLimit: 100 };
    localStorage.setItem("currentUser", JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("currentUser");
    setUser(null);
    setExpenses([]);
  };

  const addExpense = (
    amount: number,
    description: string,
    category: string
  ) => {
    if (!user) return;
    const newExpense: Expense = {
      id: crypto.randomUUID(),
      amount,
      description,
      category,
      timestamp: Date.now(),
    };
    setExpenses((prev) => [...prev, newExpense]);
  };

  const dailyTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remainingBudget = user ? user.dailyLimit - dailyTotal : 0;

  const getExpensesByCategory = () => {
    return expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as { [key: string]: number });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" />
      {!user ? (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex flex-col items-center mb-8">
              <div className="bg-blue-100 p-4 rounded-full mb-4">
                <FaWallet className="text-blue-500 text-4xl" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800">
                Daily Spending Tracker
              </h1>
              <p className="text-gray-600 mt-2 text-center">
                Track your daily expenses and stay within budget
              </p>
            </div>
            <button
              onClick={login}
              className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center text-lg font-semibold"
            >
              <FaWallet className="mr-2" />
              Login as Demo User
            </button>
          </div>
        </div>
      ) : (
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                user={user}
                expenses={expenses}
                dailyTotal={dailyTotal}
                remainingBudget={remainingBudget}
                addExpense={addExpense}
                getExpensesByCategory={getExpensesByCategory}
                onLogout={logout}
              />
            }
          />
          <Route
            path="/analytics"
            element={
              <SpendingAnalytics
                expenses={expenses}
                dailyLimit={user.dailyLimit}
              />
            }
          />
          <Route
            path="/expense/:id"
            element={
              <ExpenseDetail
                expenses={expenses}
                dailyLimit={user.dailyLimit}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </div>
  );
}

export default App;
