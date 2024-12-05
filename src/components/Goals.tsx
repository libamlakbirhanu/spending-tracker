import React, { useState } from "react";
import { useGoals } from "../contexts/GoalsContext";
import { useCategories } from "../contexts/CategoryContext";
import { motion } from "framer-motion";
import {
  FaPlus,
  FaTrash,
  FaTrophy,
  FaSpinner,
  FaFlag,
  FaPiggyBank,
  FaChartLine,
  FaClock,
} from "react-icons/fa";
import { CreateGoalModal } from "./CreateGoalModal";
import { AddSavingsModal } from "./AddSavingsModal";
import { SavingsGoal } from "../types/goals";
import { useNavigate } from "react-router-dom";

const Goals: React.FC = () => {
  const {
    goals,
    achievements,
    addGoal,
    deleteGoal,
    getGoalProgress,
    loading,
    addSavingsTransaction,
  } = useGoals();
  const navigate = useNavigate();
  const { categories } = useCategories();
  const [showNewGoalForm, setShowNewGoalForm] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);

  const handleSubmit = async (goalData: {
    title: string;
    target_amount: string;
    category_id: string;
    target_date: string;
  }) => {
    try {
      await addGoal({
        title: goalData.title,
        target_amount: parseFloat(goalData.target_amount),
        category_id: goalData.category_id || undefined,
        target_date: goalData.target_date,
        start_date: new Date().toISOString(),
      });
      setShowNewGoalForm(false);
    } catch (error) {
      console.error("Error adding goal:", error);
    }
  };

  const handleAddSavings = async (data: {
    goal_id: string;
    amount: number;
    description: string;
    transaction_date?: string;
  }) => {
    await addSavingsTransaction(data);
    setSelectedGoal(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Savings Goals</h1>
        <button
          onClick={() => setShowNewGoalForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-600 transition-colors"
        >
          <FaPlus />
          <span>New Goal</span>
        </button>
      </div>

      <CreateGoalModal
        isOpen={showNewGoalForm}
        onClose={() => setShowNewGoalForm(false)}
        onSubmit={handleSubmit}
      />

      {selectedGoal && (
        <AddSavingsModal
          isOpen={true}
          onClose={() => setSelectedGoal(null)}
          onSubmit={handleAddSavings}
          goal={selectedGoal}
        />
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mb-4" />
          <p className="text-gray-600">Loading your savings goals...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && goals.length === 0 && !showNewGoalForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 px-4"
        >
          <div className="bg-white rounded-xl shadow-sm p-8 max-w-md mx-auto">
            <FaFlag className="mx-auto text-4xl text-blue-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No savings goals yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start your financial journey by creating your first savings goal.
              Track your progress and celebrate achievements along the way!
            </p>
            <button
              onClick={() => setShowNewGoalForm(true)}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-blue-600 transition-colors mx-auto"
            >
              <FaPlus />
              <span>Create Your First Goal</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Goals Grid */}
      {!loading && goals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const progress = getGoalProgress(goal.id);

            return (
              <motion.div
                key={goal.id}
                layout
                className="bg-white rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-blue-100 relative overflow-hidden group"
                onClick={() => navigate(`/goals/${goal.id}`)}
              >
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-16 -translate-y-16 bg-blue-50 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500" />

                <div className="relative">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">
                        {goal.title}
                      </h3>
                      {goal.category_id && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          {categories.find((c) => c.id === goal.category_id)
                            ?.name || "Category"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGoal(goal);
                        }}
                        className="text-green-500 hover:text-green-600 transition-colors p-2 hover:bg-green-50 rounded-lg"
                        title="Add Savings"
                      >
                        <FaPiggyBank className="text-xl" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteGoal(goal.id);
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div className="relative">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>${goal.current_amount.toFixed(2)}</span>
                        <span>${goal.target_amount.toFixed(2)}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.min(
                              progress.percentageComplete,
                              100
                            )}%`,
                          }}
                          className={`h-full rounded-full ${
                            goal.status === "completed"
                              ? "bg-green-500"
                              : progress.isOnTrack
                              ? "bg-blue-500"
                              : "bg-yellow-500"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">
                          Days Left
                        </div>
                        <div className="font-medium">
                          {progress.daysRemaining > 0
                            ? `${progress.daysRemaining} days`
                            : "Past due"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">
                          Daily Goal
                        </div>
                        <div className="font-medium">
                          ${progress.requiredDailySavings.toFixed(2)}/day
                        </div>
                      </div>
                    </div>

                    {/* Status Indicators */}
                    {goal.status === "completed" ? (
                      <div className="flex items-center space-x-2 text-green-600 bg-green-50 rounded-lg px-3 py-2 text-sm">
                        <FaTrophy />
                        <span>Goal Completed! 🎉</span>
                      </div>
                    ) : progress.isOnTrack ? (
                      <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 rounded-lg px-3 py-2 text-sm">
                        <FaChartLine />
                        <span>On Track</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-yellow-600 bg-yellow-50 rounded-lg px-3 py-2 text-sm">
                        <FaClock />
                        <span>Needs Attention</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Recent Achievements */}
      {!loading && achievements.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Achievements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm p-4 flex items-center space-x-3"
              >
                <span className="text-2xl">{achievement.icon}</span>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {achievement.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {achievement.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
