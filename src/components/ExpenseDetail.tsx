import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaCalendarAlt, FaChartPie, FaHistory } from 'react-icons/fa';
import ReactApexChart from 'react-apexcharts';
import { Expense } from '../types';

interface ExpenseDetailProps {
  expenses: Expense[];
  dailyLimit: number;
}

export const ExpenseDetail: React.FC<ExpenseDetailProps> = ({ expenses, dailyLimit }) => {
  const { id } = useParams();
  const expense = expenses.find(e => e.id === id);

  if (!expense) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800">Expense not found</h2>
          <Link to="/" className="text-blue-500 hover:text-blue-600 mt-4 inline-block">
            Go back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Get all expenses from the same day
  const getSameDayExpenses = () => {
    const expenseDate = new Date(expense.timestamp);
    return expenses.filter(e => {
      const date = new Date(e.timestamp);
      return date.toDateString() === expenseDate.toDateString();
    });
  };

  // Get category distribution for the day
  const getCategoryDistribution = () => {
    const sameDayExpenses = getSameDayExpenses();
    const total = sameDayExpenses.reduce((sum, e) => sum + e.amount, 0);
    const distribution = sameDayExpenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as { [key: string]: number });

    return Object.entries(distribution).map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / total) * 100
    }));
  };

  // Get spending trend for the category
  const getCategoryTrend = () => {
    const dates: { [key: string]: number } = {};
    const last7Days = [...Array(7)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    last7Days.forEach(date => {
      dates[date] = 0;
    });

    expenses
      .filter(e => e.category === expense.category)
      .forEach(e => {
        const date = new Date(e.timestamp).toISOString().split('T')[0];
        if (dates[date] !== undefined) {
          dates[date] += e.amount;
        }
      });

    return {
      dates: Object.keys(dates),
      amounts: Object.values(dates)
    };
  };

  const categoryDistribution = getCategoryDistribution();
  const categoryTrend = getCategoryTrend();

  // Chart configurations
  const pieChartOptions = {
    labels: categoryDistribution.map(d => d.category),
    colors: ['#3B82F6', '#10B981', '#6366F1', '#F59E0B', '#EF4444', '#8B5CF6'],
    legend: {
      position: 'bottom' as const
    }
  };

  const lineChartOptions = {
    chart: {
      type: 'line' as const,
      toolbar: {
        show: false
      }
    },
    stroke: {
      curve: 'smooth' as const
    },
    xaxis: {
      categories: categoryTrend.dates.map(date => new Date(date).toLocaleDateString())
    },
    colors: ['#3B82F6']
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link to="/" className="mr-4 text-gray-600 hover:text-gray-800">
            <FaArrowLeft className="text-xl" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{expense.description}</h1>
            <p className="text-gray-500">
              {new Date(expense.timestamp).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Expense Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center mb-2">
              <FaCalendarAlt className="text-blue-500 mr-2" />
              <h2 className="text-lg font-semibold">Amount</h2>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              ${expense.amount.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {((expense.amount / dailyLimit) * 100).toFixed(1)}% of daily limit
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center mb-2">
              <FaChartPie className="text-green-500 mr-2" />
              <h2 className="text-lg font-semibold">Category</h2>
            </div>
            <p className="text-3xl font-bold text-gray-900 capitalize">
              {expense.category}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {categoryDistribution.find(d => d.category === expense.category)?.percentage.toFixed(1)}% of daily spending
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center mb-2">
              <FaHistory className="text-purple-500 mr-2" />
              <h2 className="text-lg font-semibold">Daily Total</h2>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              ${getSameDayExpenses().reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Total spending for the day
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Daily Category Distribution</h2>
            <ReactApexChart
              options={pieChartOptions}
              series={categoryDistribution.map(d => d.amount)}
              type="pie"
              height={300}
            />
          </div>

          {/* Category Trend */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4">
              {expense.category} Spending Trend (Last 7 Days)
            </h2>
            <ReactApexChart
              options={lineChartOptions}
              series={[{
                name: 'Spending',
                data: categoryTrend.amounts
              }]}
              type="line"
              height={300}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
