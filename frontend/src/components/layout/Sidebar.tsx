'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  LuLayoutDashboard, LuCalendarCheck, LuMessageSquare, 
  LuChevronLeft, LuChevronRight, LuBookOpen, LuLogOut
} from 'react-icons/lu';

const sidebarItems = [
  { name: 'Dashboard', path: '/', icon: <LuLayoutDashboard className="w-5 h-5" /> },
  { name: 'Study Plans', path: '/plan', icon: <LuCalendarCheck className="w-5 h-5" /> },
  { name: 'Learning Materials', path: '/materials', icon: <LuBookOpen className="w-5 h-5" /> },
  { name: 'Assistant', path: '/chat', icon: <LuMessageSquare className="w-5 h-5" /> },
];

const Sidebar = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.div
      className={`sticky top-0 flex flex-col bg-white dark:bg-gray-900 shadow-lg transition-all duration-300 h-screen ${
        collapsed ? 'w-20' : 'w-64'
      }`}
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
        <motion.div 
          className="flex items-center"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md shadow-orange-200 dark:shadow-orange-900/20">
            <span className="text-white font-bold text-lg">A+</span>
          </div>
          {!collapsed && <h2 className="text-xl font-bold ml-3 text-gray-800 dark:text-white">Aplus</h2>}
        </motion.div>
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? 
            <LuChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" /> : 
            <LuChevronLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          }
        </button>
      </div>
      
      <nav className="flex-grow py-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
        <div className="space-y-2 px-3">
          <div className={`text-xs font-semibold text-gray-400 dark:text-gray-500 ${collapsed ? 'text-center mb-2' : 'px-4 mb-2'}`}>
            {!collapsed && 'MAIN MENU'}
            {collapsed && '•••'}
          </div>
          
          {sidebarItems.map((item) => (
            <motion.div 
              key={item.name}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link 
                href={item.path}
                className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start'} py-3 px-4 rounded-lg transition-all ${
                  pathname === item.path
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-200 dark:shadow-orange-900/20'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!collapsed && <span className={`ml-3 font-medium ${pathname === item.path ? '' : 'text-gray-600 dark:text-gray-400'}`}>{item.name}</span>}
              </Link>
            </motion.div>
          ))}
        </div>
      </nav>
      
      <motion.div 
        className="p-4 mt-auto border-t border-gray-100 dark:border-gray-800"
      >
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-orange-50 dark:bg-gray-800/50 rounded-lg p-3 mb-4">
              <h4 className="font-medium text-sm text-orange-700 dark:text-orange-400">Need help?</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Click here to get support with your learning journey</p>
            </div>
          </motion.div>
        )}
        
        <motion.div 
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <button className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start'} w-full py-3 px-4 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300`}>
            <LuLogOut className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            {!collapsed && <span className="ml-3 font-medium text-gray-600 dark:text-gray-400">Log Out</span>}
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Sidebar;