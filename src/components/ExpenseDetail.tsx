import React from "react";
import { useParams, Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaChartPie,
  FaWallet,
} from "react-icons/fa";
import ReactApexChart from "react-apexcharts";
import { useExpenses } from "../contexts/ExpenseContext";
import { useAuth } from "../contexts/AuthContext";
import { useCategories } from "../contexts/CategoryContext";

export const ExpenseDetail: React.FC = () => {
  const { id } = useParams();
  const { expenses } = useExpenses();
  const { userSettings } = useAuth();
  const { categories } = useCategories();
  const expense = expenses.find((e) => e.id === id);

  if (!expense) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Expense not found
          </h2>
          <Link
            to="/"
            className="text-blue-500 hover:text-blue-600 mt-4 inline-block"
          >
            Go back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Format timestamp to a valid date string
  const formatDate = (timestamp: string | number) => {
    try {
      const date = new Date(timestamp);
      return isNaN(date.getTime())
        ? new Date().toISOString()
        : date.toISOString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return new Date().toISOString();
    }
  };

  // Get all expenses from the same day
  const getSameDayExpenses = () => {
    const expenseDate = new Date(formatDate(expense.created_at));
    return expenses.filter((e) => {
      const date = new Date(formatDate(e.created_at));
      return date.toDateString() === expenseDate.toDateString();
    });
  };

  // Calculate category distribution for the day
  const getCategoryDistribution = () => {
    const sameDayExpenses = getSameDayExpenses();
    const distribution: { [key: string]: number } = {};
    const total = sameDayExpenses.reduce((sum, e) => sum + e.amount, 0);

    sameDayExpenses.forEach((e) => {
      distribution[e.category_id] =
        (distribution[e.category_id] || 0) + e.amount;
    });

    return Object.entries(distribution).map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / total) * 100,
    }));
  };

  // Get spending trend for the category
  const getCategoryTrend = () => {
    const dates: { [key: string]: number } = {};
    const last7Days = [...Array(7)]
      .map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split("T")[0];
      })
      .reverse();

    last7Days.forEach((date) => {
      dates[date] = 0;
    });

    expenses
      .filter((e) => e.category_id === expense.category_id)
      .forEach((e) => {
        const date = new Date(formatDate(e.created_at))
          .toISOString()
          .split("T")[0];
        if (dates[date] !== undefined) {
          dates[date] += e.amount;
        }
      });

    return {
      dates: Object.keys(dates),
      amounts: Object.values(dates),
    };
  };

  const categoryDistribution = getCategoryDistribution();
  const categoryTrend = getCategoryTrend();

  // Chart configurations
  const pieChartOptions = {
    labels: categoryDistribution.map(
      (d) => categories.find((c) => c.id === d.category)?.name || "Other"
    ),
    colors: ["#3B82F6", "#10B981", "#6366F1", "#F59E0B", "#EF4444", "#8B5CF6"],
    legend: {
      position: "bottom" as const,
    },
  };

  const lineChartOptions = {
    chart: {
      type: "line" as const,
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: "smooth" as const,
    },
    xaxis: {
      categories: categoryTrend.dates.map((date) =>
        new Date(date).toLocaleDateString()
      ),
    },
    colors: ["#3B82F6"],
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="text-gray-500 hover:text-gray-700">
            <FaArrowLeft className="text-xl" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {expense.description}
            </h1>
            <p className="text-gray-500">
              {new Date(formatDate(expense.created_at)).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Amount */}
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <FaWallet className="text-blue-500 text-xl" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Amount</h2>
              <p className="text-3xl font-bold text-gray-900">
                ${expense.amount.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {(
                  (expense.amount / (userSettings?.daily_limit || 0)) *
                  100
                ).toFixed(1)}
                % of daily limit
              </p>
            </div>
          </div>

          {/* Category */}
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-full">
              <FaChartPie className="text-green-500 text-xl" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Category</h2>
              <p className="text-3xl font-bold text-gray-900">
                {
                  categories?.filter((c) => c.id === expense.category_id)[0]
                    ?.name
                }
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {categoryDistribution
                  .find((d) => d.category === expense.category_id)
                  ?.percentage.toFixed(1)}
                % of daily spending
              </p>
            </div>
          </div>

          {/* Daily Total */}
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <FaCalendarAlt className="text-purple-500 text-xl" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Daily Total</h2>
              <p className="text-3xl font-bold text-gray-900">
                $
                {getSameDayExpenses()
                  .reduce((sum, e) => sum + e.amount, 0)
                  .toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Total spending for the day
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4">
            Daily Category Distribution
          </h2>
          <ReactApexChart
            options={pieChartOptions}
            series={categoryDistribution.map((d) => d.amount)}
            type="pie"
            height={300}
          />
        </div>

        {/* Category Trend */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4">
            Category Spending Trend (Last 7 Days)
          </h2>
          <ReactApexChart
            options={lineChartOptions}
            series={[
              {
                name: "Spending",
                data: categoryTrend.amounts,
              },
            ]}
            type="line"
            height={300}
          />
        </div>
      </div>
    </div>
  );
};
