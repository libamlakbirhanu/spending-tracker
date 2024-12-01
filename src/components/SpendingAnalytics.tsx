import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useExpenses } from "../contexts/ExpenseContext";
import SpendingChart from "./SpendingChart";

const SpendingAnalytics: React.FC = () => {
  const { userSettings } = useAuth();
  const { dailyTotal, getExpensesByCategory } = useExpenses();

  const percentageUsed = userSettings
    ? (dailyTotal / userSettings.daily_limit) * 100
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Spending Analytics
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Daily Overview
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-600">Daily Limit</p>
              <p className="text-2xl font-bold text-blue-500">
                ${userSettings?.daily_limit.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Spent Today</p>
              <p className="text-2xl font-bold text-orange-500">
                ${dailyTotal.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Budget Used</p>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                      {percentageUsed.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                  <div
                    style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                      percentageUsed > 100 ? "bg-red-500" : "bg-blue-500"
                    }`}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Spending by Category
          </h2>
          <SpendingChart expenses={getExpensesByCategory()} />
        </div>
      </div>
    </div>
  );
};

export default SpendingAnalytics;
