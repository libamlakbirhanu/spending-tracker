/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGoals } from "../contexts/GoalsContext";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaPiggyBank,
  FaCalendarAlt,
  FaChartLine,
  FaClock,
  FaCheckCircle,
} from "react-icons/fa";
import Chart from "react-apexcharts";
import { format, differenceInDays } from "date-fns";
import { AddSavingsModal } from "./AddSavingsModal";

const GoalDetails: React.FC = () => {
  const { goalId } = useParams<{ goalId: string }>();
  const navigate = useNavigate();
  const { goals, getSavingsTransactions, addSavingsTransaction } = useGoals();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showAddSavings, setShowAddSavings] = useState(false);
  const [chartData, setChartData] = useState<any>({
    options: {
      chart: {
        id: "savings-chart",
        type: "area",
        height: 300,
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 800,
        },
      },
      stroke: {
        curve: "smooth",
        width: 2,
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.3,
          stops: [0, 90, 100],
        },
      },
      dataLabels: {
        enabled: false,
      },
      colors: ["#3B82F6"],
      xaxis: {
        categories: [],
        type: "datetime",
        labels: {
          style: {
            colors: "#64748b",
          },
          datetimeFormatter: {
            year: "yyyy",
            month: "MMM dd",
            day: "MMM dd",
          },
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: "#64748b",
          },
          formatter: (value: number) => `$${value.toFixed(0)}`,
        },
      },
      grid: {
        borderColor: "#e2e8f0",
        strokeDashArray: 4,
        xaxis: {
          lines: {
            show: true,
          },
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
      },
      tooltip: {
        x: {
          format: "MMM dd, yyyy",
        },
        y: {
          formatter: (value: number) => `$${value.toFixed(2)}`,
        },
      },
      theme: {
        mode: "light",
      },
    },
    series: [
      {
        name: "Total Savings",
        data: [],
      },
    ],
  });

  const goal = goals.find((g) => g.id === goalId);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (goalId) {
        const data = await getSavingsTransactions(goalId);
        setTransactions(data);

        // Prepare chart data
        const sortedTransactions = [...data].sort(
          (a, b) =>
            new Date(a.transaction_date).getTime() -
            new Date(b.transaction_date).getTime()
        );

        let runningTotal = 0;
        const chartPoints = sortedTransactions.map((t) => {
          runningTotal += t.amount;
          return [new Date(t.transaction_date).getTime(), runningTotal];
        });

        // Add initial point if there are transactions
        if (chartPoints.length > 0) {
          chartPoints.unshift([
            new Date(
              goal?.start_date || sortedTransactions[0].transaction_date
            ).getTime(),
            0,
          ]);
        }

        // Add current point if not up to date
        const lastPoint = chartPoints[chartPoints.length - 1];
        if (lastPoint && lastPoint[0] < new Date().getTime()) {
          chartPoints.push([new Date().getTime(), runningTotal]);
        }

        setChartData((prev: any) => ({
          ...prev,
          series: [
            {
              name: "Total Savings",
              data: chartPoints,
            },
          ],
        }));
      }
    };

    fetchTransactions();
  }, [goalId, getSavingsTransactions, goal?.start_date]);

  const handleAddSavings = async (data: {
    goal_id: string;
    amount: number;
    description: string;
    transaction_date?: string;
  }) => {
    await addSavingsTransaction(data);
    setShowAddSavings(false);
  };

  if (!goal) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Goal not found</p>
        <button
          onClick={() => navigate("/goals")}
          className="mt-4 text-blue-500 hover:text-blue-600"
        >
          Return to Goals
        </button>
      </div>
    );
  }

  const progress = (goal.current_amount / goal.target_amount) * 100;
  const daysLeft = differenceInDays(new Date(goal.target_date), new Date());
  const dailyRequired =
    (goal.target_amount - goal.current_amount) / Math.max(daysLeft, 1);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={() => navigate("/goals")}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FaArrowLeft className="text-xl" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{goal.title}</h1>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Goal Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Goal Progress
              </h2>
              <button
                onClick={() => setShowAddSavings(true)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-600 transition-colors"
              >
                <FaPiggyBank />
                <span>Add Savings</span>
              </button>
            </div>

            {/* Progress Bar */}
            <div className="relative h-4 bg-gray-100 rounded-full mb-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                className={`absolute h-full rounded-full ${
                  progress >= 100
                    ? "bg-green-500"
                    : progress >= 75
                    ? "bg-blue-500"
                    : "bg-yellow-500"
                }`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Current Amount</div>
                <div className="text-xl font-semibold text-gray-900">
                  ${goal.current_amount.toFixed(2)}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Target Amount</div>
                <div className="text-xl font-semibold text-gray-900">
                  ${goal.target_amount.toFixed(2)}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Remaining</div>
                <div className="text-xl font-semibold text-gray-900">
                  ${(goal.target_amount - goal.current_amount).toFixed(2)}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Savings Progress
            </h2>
            <div className="h-[300px] w-full">
              <Chart
                options={chartData.options}
                series={chartData.series}
                type="area"
                height="100%"
                width="100%"
              />
            </div>
          </motion.div>
        </div>

        {/* Right Column - Details & Transactions */}
        <div className="space-y-6">
          {/* Goal Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Goal Details
            </h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <FaCalendarAlt className="text-blue-500" />
                <div>
                  <div className="text-sm text-gray-600">Target Date</div>
                  <div className="font-medium">
                    {format(new Date(goal.target_date), "MMMM d, yyyy")}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FaClock className="text-yellow-500" />
                <div>
                  <div className="text-sm text-gray-600">Days Remaining</div>
                  <div className="font-medium">
                    {daysLeft > 0 ? `${daysLeft} days` : "Past due"}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FaChartLine className="text-green-500" />
                <div>
                  <div className="text-sm text-gray-600">Daily Required</div>
                  <div className="font-medium">
                    ${dailyRequired.toFixed(2)}/day
                  </div>
                </div>
              </div>
              {goal.status === "completed" && (
                <div className="flex items-center space-x-3">
                  <FaCheckCircle className="text-green-500" />
                  <div>
                    <div className="text-sm text-gray-600">Status</div>
                    <div className="font-medium text-green-500">
                      Completed! 🎉
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Transactions
            </h2>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {transactions.length === 0 ? (
                <p className="text-gray-600 text-center py-4">
                  No transactions yet
                </p>
              ) : (
                transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">
                        ${transaction.amount.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {transaction.description || "Savings deposit"}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(
                        new Date(transaction.transaction_date),
                        "MMM d, yyyy"
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Add Savings Modal */}
      {showAddSavings && (
        <AddSavingsModal
          isOpen={true}
          onClose={() => setShowAddSavings(false)}
          onSubmit={handleAddSavings}
          goal={goal}
        />
      )}
    </div>
  );
};

export default GoalDetails;
