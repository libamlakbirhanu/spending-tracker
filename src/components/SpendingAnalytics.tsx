import React, { useEffect, useState } from "react";
import { useExpenses } from "../contexts/ExpenseContext";
import { useAuth } from "../contexts/AuthContext";
import { useCategories } from "../contexts/CategoryContext";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import WeeklySpendingChart from "./WeeklySpendingChart";
import {
  FaChartLine,
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
  FaWallet,
} from "react-icons/fa";

const SpendingAnalytics: React.FC = () => {
  const { userSettings } = useAuth();
  const { weeklyExpenses, getHistoricalExpensesByCategory } = useExpenses();
  const { categories } = useCategories();
  const [historicalExpenses, setHistoricalExpenses] = useState<{
    [key: string]: number;
  }>({});
  const [totalStats, setTotalStats] = useState({
    totalSpent: 0,
    avgPerDay: 0,
    highestDay: { date: "", amount: 0 },
    lowestDay: { date: "", amount: Infinity },
    monthlyProjection: 0,
  });

  useEffect(() => {
    const loadHistoricalData = async () => {
      const data = await getHistoricalExpensesByCategory();
      setHistoricalExpenses(data);
    };
    loadHistoricalData();
  }, [getHistoricalExpensesByCategory]);

  useEffect(() => {
    if (weeklyExpenses.length > 0) {
      const total = weeklyExpenses.reduce((sum, day) => sum + day.amount, 0);
      const avg = total / weeklyExpenses.length;

      let highest = { date: "", amount: 0 };
      let lowest = { date: "", amount: Infinity };

      weeklyExpenses.forEach((day) => {
        if (day.amount > highest.amount) {
          highest = { date: day.date, amount: day.amount };
        }
        if (day.amount < lowest.amount && day.amount > 0) {
          lowest = { date: day.date, amount: day.amount };
        }
      });

      // Project monthly spending based on daily average
      const monthlyProjection = avg * 30;

      setTotalStats({
        totalSpent: total,
        avgPerDay: avg,
        highestDay: highest,
        lowestDay:
          lowest.amount === Infinity ? { date: "", amount: 0 } : lowest,
        monthlyProjection,
      });
    }
  }, [weeklyExpenses]);

  const categoryChartOptions: ApexOptions = {
    chart: {
      type: "bar",
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: true,
        barHeight: "70%",
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return `$${(+val).toFixed(2)}`;
      },
      style: {
        fontSize: "12px",
      },
    },
    xaxis: {
      labels: {
        formatter: (value) => `$${(+value).toFixed(0)}`,
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
        },
      },
    },
    tooltip: {
      y: {
        formatter: (value) => `$${value.toFixed(2)}`,
      },
    },
    colors: [
      "#3B82F6",
      "#10B981",
      "#F59E0B",
      "#EF4444",
      "#8B5CF6",
      "#EC4899",
    ].sort(() => Math.random() - 0.5),
  };

  // Process category data
  const categoryData = Object.entries(historicalExpenses)
    .map(([id, amount]) => {
      const category = categories.find((c) => c.id === id);
      return {
        category:
          category?.name ||
          (id === "uncategorized" ? "Uncategorized" : "Other"),
        amount: amount,
      };
    })
    .sort((a, b) => b.amount - a.amount); // Sort by amount in descending order

  console.log("Processed category data:", categoryData);

  const chartSeries = [
    {
      name: "Total Spent",
      data: categoryData.map((item) => item.amount),
    },
  ];

  const chartCategories = categoryData.map((item) => item.category);

  // Update the categoryChartOptions with the processed categories
  categoryChartOptions.xaxis = {
    ...categoryChartOptions.xaxis,
    categories: chartCategories,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Spending Analytics
      </h1>

      {/* Total Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Spent */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-medium text-gray-500">
                Total Spent (7 Days)
              </h2>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${totalStats.totalSpent.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FaWallet className="text-blue-600 text-xl" />
            </div>
          </div>
          <p className="text-sm text-gray-500">
            {totalStats.totalSpent > (userSettings?.daily_limit || 0) * 7 ? (
              <span className="text-red-500 flex items-center">
                <FaArrowUp className="mr-1" />
                Over weekly budget
              </span>
            ) : (
              <span className="text-green-500 flex items-center">
                <FaArrowDown className="mr-1" />
                Within budget
              </span>
            )}
          </p>
        </div>

        {/* Daily Average */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-medium text-gray-500">
                Daily Average
              </h2>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${totalStats.avgPerDay.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FaCalendarAlt className="text-green-600 text-xl" />
            </div>
          </div>
          <p className="text-sm text-gray-500">
            {totalStats.avgPerDay > (userSettings?.daily_limit || 0) ? (
              <span className="text-red-500 flex items-center">
                <FaArrowUp className="mr-1" />
                Above daily limit
              </span>
            ) : (
              <span className="text-green-500 flex items-center">
                <FaArrowDown className="mr-1" />
                Below daily limit
              </span>
            )}
          </p>
        </div>

        {/* Highest Spending Day */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-medium text-gray-500">
                Peak Spending Day
              </h2>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${totalStats.highestDay.amount.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <FaArrowUp className="text-red-600 text-xl" />
            </div>
          </div>
          <p className="text-sm text-gray-500">
            {totalStats.highestDay.date && (
              <span>
                {new Date(totalStats.highestDay.date).toLocaleDateString(
                  "en-US",
                  {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  }
                )}
              </span>
            )}
          </p>
        </div>

        {/* Monthly Projection */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-medium text-gray-500">
                Monthly Projection
              </h2>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${totalStats.monthlyProjection.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <FaChartLine className="text-purple-600 text-xl" />
            </div>
          </div>
          <p className="text-sm text-gray-500">Based on 7-day average</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6">
        {/* Weekly Spending Trends */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Last 7 Days Spending
          </h2>
          <div className="h-[300px]">
            <WeeklySpendingChart weeklyExpenses={weeklyExpenses} />
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Overall Category Distribution
          </h2>
          <div className="h-[400px]">
            {categoryData.length > 0 ? (
              <ReactApexChart
                options={categoryChartOptions}
                series={chartSeries}
                type="bar"
                height="100%"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No spending data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpendingAnalytics;
