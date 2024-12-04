import React from "react";
import { Link } from "react-router-dom";
import { Expense } from "../types";
import { useCategories } from "../contexts/CategoryContext";
import {
  FaShoppingCart,
  FaUtensils,
  FaHome,
  FaCar,
  FaPlane,
  FaShoppingBag,
  FaGamepad,
  FaMedkit,
  FaGraduationCap,
  FaQuestion,
} from "react-icons/fa";

const styles = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-slideIn {
    animation: slideIn 0.3s ease-out forwards;
  }
`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

interface ExpenseListProps {
  expenses: Expense[];
}

const getCategoryIcon = (categoryName: string | undefined) => {
  if (!categoryName) return FaQuestion;

  const normalizedName = categoryName.toLowerCase();

  if (normalizedName.includes("food") || normalizedName.includes("restaurant"))
    return FaUtensils;
  if (normalizedName.includes("shopping") || normalizedName.includes("retail"))
    return FaShoppingCart;
  if (normalizedName.includes("home") || normalizedName.includes("rent"))
    return FaHome;
  if (normalizedName.includes("transport") || normalizedName.includes("car"))
    return FaCar;
  if (normalizedName.includes("travel")) return FaPlane;
  if (normalizedName.includes("clothes") || normalizedName.includes("fashion"))
    return FaShoppingBag;
  if (
    normalizedName.includes("entertainment") ||
    normalizedName.includes("game")
  )
    return FaGamepad;
  if (normalizedName.includes("health") || normalizedName.includes("medical"))
    return FaMedkit;
  if (normalizedName.includes("education")) return FaGraduationCap;

  return FaQuestion;
};

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
    <div className="space-y-4 px-4 max-h-[400px] overflow-y-auto pb-2">
      {expenses.map((expense, index) => (
        <Link
          to={`/expense/${expense.id}`}
          key={expense.id}
          className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-white rounded-xl 
                   border border-gray-100 shadow-sm hover:shadow-md hover:scale-[1.02] 
                   transition-all duration-200 group animate-slideIn"
          style={{
            animationDelay: `${index * 50}ms`,
          }}
        >
          <div className="space-y-1">
            <p className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors text-lg">
              {expense.description}
            </p>
            <div className="flex items-center text-sm text-gray-500 space-x-3">
              <span className="capitalize bg-gray-100 px-2 py-0.5 rounded-full text-gray-600 flex items-center gap-1">
                {(() => {
                  const category = categories?.find(
                    (cat) => cat.id === expense.category_id
                  );
                  const Icon = getCategoryIcon(category?.name);
                  return (
                    <>
                      <Icon className="w-3.5 h-3.5" />
                      <span>{category?.name}</span>
                    </>
                  );
                })()}
              </span>
              <span>{new Date(expense.created_at).toLocaleTimeString()}</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <p className="font-semibold text-gray-900 text-xl">
              ${expense.amount.toFixed(2)}
            </p>
            <span className="text-xs text-gray-500 mt-1">
              Click to view details
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ExpenseList;
