'use client';

import React from "react";
import { motion } from "framer-motion";
import { 
  LuPlus, LuTrendingUp, LuCalendar, LuBookOpen, 
  LuClock, LuTarget, LuChartBar
} from "react-icons/lu";
import Link from "next/link";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function DashboardPage() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <motion.div variants={item} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back! Ready to continue learning?</p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link href="/plan/create" className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-lg shadow-md shadow-orange-200 dark:shadow-orange-900/20 hover:from-orange-600 hover:to-orange-700 transition-all">
            <LuPlus className="mr-2 h-5 w-5" />
            New Study Plan
          </Link>
        </motion.div>
      </motion.div>

      {/* Progress Overview */}
      <motion.div variants={item}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 relative overflow-hidden">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Weekly Progress</p>
                <h3 className="text-2xl font-bold mt-1 text-gray-800 dark:text-white">87%</h3>
                <p className="text-green-500 text-sm mt-1 font-medium flex items-center">
                  <LuTrendingUp className="mr-1" /> +12% from last week
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <LuChartBar className="h-6 w-6 text-orange-500"  />
              </div>
            </div>
            <div className="mt-4 bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full" style={{ width: "87%" }}></div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 relative overflow-hidden">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Study Sessions</p>
                <h3 className="text-2xl font-bold mt-1 text-gray-800 dark:text-white">12</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">This month</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <LuClock className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 relative overflow-hidden">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Next Milestone</p>
                <h3 className="text-2xl font-bold mt-1 text-gray-800 dark:text-white">May 24</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Calculus Review</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <LuTarget className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Study Content Preview */}
      <motion.div variants={item}>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Recent Study Content</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* These would be your actual ContentPreview components */}
          {[
            { title: "Introduction to Quantum Computing", type: "video", duration: "25 min", progress: 70 },
            { title: "Advanced Statistical Analysis", type: "interactive", duration: "45 min", progress: 30 },
            { title: "Literary Analysis Techniques", type: "text", duration: "15 min", progress: 100 }
          ].map((content, idx) => (
            <motion.div 
              key={idx}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden group hover:shadow-md transition-all"
              whileHover={{ y: -5 }}
            >
              <div className="h-40 bg-gradient-to-br from-orange-400/20 to-orange-600/20 relative flex items-center justify-center">
                <div className="absolute inset-0 bg-gray-900/10 dark:bg-black/20 group-hover:bg-gray-900/0 transition-colors"></div>
                <span className="text-4xl opacity-50 dark:opacity-30 group-hover:opacity-70 transition-opacity">
                  {content.type === "video" ? "🎬" : content.type === "interactive" ? "🧩" : "📝"}
                </span>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-center mb-3">
                  <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs rounded-md font-medium">
                    {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{content.duration}</span>
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">{content.title}</h3>
                <div className="bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full" style={{ width: `${content.progress}%` }}></div>
                </div>
                <div className="mt-2 flex justify-between items-center text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{content.progress === 100 ? "Completed" : `${content.progress}% complete`}</span>
                  <button className="text-orange-500 hover:text-orange-600 font-medium">Continue</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}