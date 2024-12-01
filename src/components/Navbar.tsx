import React from "react";
import { Link } from "react-router-dom";
import { FaWallet, FaSignOutAlt, FaChartPie } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";

export const Navbar: React.FC = () => {
  const { signOut } = useAuth();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link
              to="/"
              className="flex items-center text-gray-700 hover:text-gray-900"
            >
              <FaWallet className="text-blue-500 text-2xl" />
              <span className="ml-2 text-lg font-semibold">ExpenseTracker</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/analytics"
              className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium flex items-center"
            >
              <FaChartPie className="mr-2" />
              Analytics
            </Link>
            <button
              onClick={signOut}
              className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium flex items-center"
            >
              <FaSignOutAlt className="mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
