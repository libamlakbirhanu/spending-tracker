import React from 'react';
import { Link } from 'react-router-dom';
import { FaChartPie, FaArrowLeft, FaCalendarWeek, FaTags } from 'react-icons/fa';
import { Expense } from '../types';
import ReactApexChart from 'react-apexcharts';

interface SpendingAnalyticsProps {
  expenses: Expense[];
  dailyLimit: number;
}

export const SpendingAnalytics: React.FC<SpendingAnalyticsProps> = ({
  expenses,
  dailyLimit,
}) => {
  // Helper function to get today's date at midnight
  const getToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  // Get expenses for the last 7 days
  const getWeeklyExpenses = () => {
    const today = getToday();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.timestamp);
      return expenseDate >= weekAgo;
    });
  };

  // Calculate category totals
  const getCategoryTotals = () => {
    return expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as { [key: string]: number });
  };

  // Calculate daily totals for bar chart
  const getDailyTotals = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dailyTotals = Array(7).fill(0);
    const today = new Date();
    const dayIndex = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

    const weeklyExpenses = getWeeklyExpenses();
    weeklyExpenses.forEach(expense => {
      const expenseDate = new Date(expense.timestamp);
      const expenseDayIndex = expenseDate.getDay();
      const daysAgo = (dayIndex - expenseDayIndex + 7) % 7;
      if (daysAgo < 7) {
        dailyTotals[expenseDayIndex] += expense.amount;
      }
    });

    // Rotate array so that it starts with the oldest day
    const rotateIndex = (dayIndex + 1) % 7;
    const rotatedTotals = [
      ...dailyTotals.slice(rotateIndex),
      ...dailyTotals.slice(0, rotateIndex)
    ];
    const rotatedDays = [
      ...days.slice(rotateIndex),
      ...days.slice(0, rotateIndex)
    ];

    return {
      categories: rotatedDays,
      data: rotatedTotals
    };
  };

  const weeklyExpenses = getWeeklyExpenses();
  const categoryTotals = getCategoryTotals();
  const dailyData = getDailyTotals();

  // Prepare data for pie chart
  const pieChartOptions = {
    labels: Object.keys(categoryTotals).map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)),
    colors: ['#3B82F6', '#10B981', '#6366F1', '#F59E0B', '#EF4444'],
    legend: {
      position: 'bottom' as const,
    },
    chart: {
      type: 'pie' as const,
    },
  };

  const pieChartSeries = Object.values(categoryTotals);

  // Chart configurations
  const barChartOptions = {
    chart: {
      type: 'bar' as const,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false
      }
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '60%',
      }
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: dailyData.categories,
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      labels: {
        formatter: (value: number) => `$${value.toFixed(0)}`
      }
    },
    grid: {
      borderColor: '#f3f4f6',
    },
    colors: ['#3B82F6'],
    tooltip: {
      y: {
        formatter: (value: number) => `$${value.toFixed(2)}`
      }
    }
  };

  const barChartSeries = [{
    name: 'Daily Spending',
    data: dailyData.data
  }];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link to="/" className="mr-4 text-gray-600 hover:text-gray-800">
              <FaArrowLeft className="text-xl" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">Spending Analytics</h1>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pie Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Spending Distribution</h2>
            <ReactApexChart
              options={pieChartOptions}
              series={pieChartSeries}
              type="pie"
              height={350}
            />
          </div>

          {/* Bar Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Weekly Spending</h2>
            <ReactApexChart
              options={barChartOptions}
              series={barChartSeries}
              type="bar"
              height={350}
            />
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Category Overview */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center mb-4">
              <FaChartPie className="text-blue-500 mr-2" />
              <h2 className="text-lg font-semibold">Category Breakdown</h2>
            </div>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {Object.entries(categoryTotals).map(([category, total]) => (
                <div key={category} className="flex flex-col">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{category}</span>
                    <span className="font-medium">${total.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min((total / dailyLimit) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Overview */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center mb-4">
              <FaCalendarWeek className="text-green-500 mr-2" />
              <h2 className="text-lg font-semibold">Weekly Overview</h2>
            </div>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {weeklyExpenses.map(expense => (
                <div key={expense.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-sm text-gray-500 capitalize">{expense.category}</p>
                  </div>
                  <span className="font-semibold">${expense.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Categories */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center mb-4">
              <FaTags className="text-purple-500 mr-2" />
              <h2 className="text-lg font-semibold">Top Categories</h2>
            </div>
            <div className="space-y-4">
              {Object.entries(categoryTotals)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([category, total]) => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="capitalize">{category}</span>
                    <span className="font-medium">${total.toFixed(2)}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
