import React from "react";
import { Link } from "react-router-dom";
import { Expense } from "../types";
import { useCategories } from "../contexts/CategoryContext";

interface ExpenseListProps {
  expenses: Expense[];
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses }) => {
  const { categories } = useCategories();

  if (expenses.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No expenses recorded today</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {expenses.map((expense) => (
        <Link
          to={`/expense/${expense.id}`}
          key={expense.id}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
        >
          <div>
            <p className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
              {expense.description}
            </p>
            <div className="flex items-center text-sm text-gray-500">
              <span className="capitalize">
                {
                  categories?.find((cat) => cat.id === expense.category_id)
                    ?.name
                }
              </span>
              <span className="mx-2">•</span>
              <span>{new Date(expense.created_at).toLocaleTimeString()}</span>
            </div>
          </div>
          <p className="font-semibold text-gray-900">
            ${expense.amount.toFixed(2)}
          </p>
        </Link>
      ))}
    </div>
  );
};

export default ExpenseList;
