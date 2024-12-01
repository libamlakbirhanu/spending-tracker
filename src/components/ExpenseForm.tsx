import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";
import { useCategories } from "../contexts/CategoryContext";

interface ExpenseFormProps {
  onSubmit: (amount: number, description: string, category: string) => void;
  onClose: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSubmit, onClose }) => {
  const { categories, isLoading } = useCategories();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!category) {
      toast.error("Please select a category");
      return;
    }

    onSubmit(parsedAmount, description, category);
    setAmount("");
    setDescription("");
    setCategory("");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-t-xl flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Add New Expense
            </h2>
            <p className="text-blue-100 text-sm">Track your spending</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-100 transition-colors"
          >
            <FaTimes size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  $
                </span>
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
              {isLoading ? (
                <div className="text-center py-4">Loading categories...</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                        category === cat.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-200"
                      }`}
                    >
                      <span className="text-2xl mb-1">{cat.icon || "📦"}</span>
                      <span className="text-sm font-medium text-gray-700">
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2.5 rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Add Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;
