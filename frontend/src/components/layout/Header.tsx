"use client";

import React from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { LuBell, LuUser, LuSearch } from "react-icons/lu";

const Header = () => {
  const { theme, setTheme } = useTheme();

  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  return (
    <motion.header
      className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-100 dark:border-gray-800 py-3"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}>
      <div className="mx-auto px-4 flex items-center justify-between">
        <div className="flex-1 mr-4">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search study plans, content..."
              className="w-full py-2 pl-10 pr-4 border border-gray-200 dark:border-gray-700 rounded-lg 
                        focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 dark:bg-gray-800 
                        text-gray-800 dark:text-gray-200 transition-all"
            />
            <LuSearch className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500 h-5 w-5" />
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {isAuthenticated ? (
            <>
              <button className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 relative transition-colors">
                <LuBell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" />
              </button>

              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="ml-2">
                <button className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-1.5 px-3 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors">
                  <div className="relative w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center text-white font-medium">
                    A
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Alex
                  </span>
                </button>
              </motion.div>
            </>
          ) : (
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <button
                onClick={() => setIsAuthenticated(true)}
                className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-1.5 px-3 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors">
                <LuUser className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Login
                </span>
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
