import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaWallet, FaSignOutAlt, FaChartPie, FaUser, FaCaretDown } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";

export const Navbar: React.FC = () => {
  const { signOut, user } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

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

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  <FaUser />
                </div>
                <span className="hidden md:block max-w-[150px] truncate">
                  {user?.email}
                </span>
                <FaCaretDown className={`transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                    Signed in as<br />
                    <span className="font-medium truncate block">{user?.email}</span>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      signOut();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <FaSignOutAlt className="mr-2" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
