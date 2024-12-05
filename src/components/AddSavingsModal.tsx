import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaPiggyBank, FaCalendarAlt } from "react-icons/fa";
import { format } from "date-fns";
import { SavingsGoal } from "../types/goals";

interface AddSavingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    goal_id: string;
    amount: number;
    description: string;
    transaction_date?: string;
  }) => void;
  goal: SavingsGoal;
}

export const AddSavingsModal: React.FC<AddSavingsModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  goal,
}) => {
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    transaction_date: format(new Date(), "yyyy-MM-dd"),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({
      goal_id: goal.id,
      amount: parseFloat(formData.amount),
      description: formData.description,
      transaction_date: formData.transaction_date,
    });
    setFormData({
      amount: "",
      description: "",
      transaction_date: format(new Date(), "yyyy-MM-dd"),
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 flex items-center justify-center px-4 z-50"
          >
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-lg">
              <form onSubmit={handleSubmit}>
                <div className="relative bg-green-500 px-6 py-8 text-white">
                  <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                <h2 className="text-2xl font-bold mb-2">Record Savings</h2>
                <p className="text-green-100">
                  Add money saved towards: {goal.title}
                </p>
                <div className="mt-4 bg-green-400/20 rounded-lg p-3">
                  <div className="text-sm">Progress</div>
                  <div className="text-lg font-semibold">
                    ${goal.current_amount.toFixed(2)} / $
                    {goal.target_amount.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <FaPiggyBank className="text-green-500" />
                      <span>Amount Saved</span>
                    </div>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                      className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow"
                      placeholder="0.00"
                      required
                      min="0.01"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow"
                    placeholder="e.g., Monthly savings, Birthday money"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <FaCalendarAlt className="text-green-500" />
                      <span>Date</span>
                    </div>
                  </label>
                  <input
                    type="date"
                    value={formData.transaction_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        transaction_date: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow"
                    max={format(new Date(), "yyyy-MM-dd")}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
  );
};
