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

      {/* Calendar & Upcoming Sessions */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
              <LuCalendar className="mr-2 h-5 w-5 text-orange-500" />
              Calendar
            </h2>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                Month
              </button>
              <button className="px-3 py-1 bg-orange-500 text-white rounded-md text-sm hover:bg-orange-600 transition-colors">
                Week
              </button>
              <button className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                Day
              </button>
            </div>
          </div>

          {/* Calendar Placeholder - This would be your actual CalendarWidget component */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]}
              </div>
            ))}
            {Array.from({ length: 35 }).map((_, i) => {
              const isToday = i === 12;
              const hasEvent = [15, 18, 23, 27].includes(i);
              return (
                <div key={i} 
                  className={`aspect-square rounded-lg flex items-center justify-center text-sm
                    ${i < 3 || i > 30 ? 'text-gray-400 dark:text-gray-600' : 'text-gray-800 dark:text-gray-200'}
                    ${isToday ? 'bg-orange-500 text-white' : hasEvent ? 'border-2 border-orange-500 text-gray-800 dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
                  `}
                >
                  {((i < 3 ? 27 : 0) + i + 1) % 31 || 31}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center mb-6">
            <LuBookOpen className="mr-2 h-5 w-5 text-orange-500" />
            Today&apos;s Sessions
          </h2>
          
          <div className="space-y-4">
            {[
              { title: "Linear Algebra", time: "9:00 - 10:30 AM", progress: 80 },
              { title: "Chemical Reactions", time: "1:00 - 2:30 PM", progress: 60 },
              { title: "Essay Writing", time: "4:00 - 5:30 PM", progress: 40 }
            ].map((session, idx) => (
              <div key={idx} className="p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:shadow-md transition-all">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-white">{session.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{session.time}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full flex items-center justify-center relative">
                    <svg className="absolute" width="40" height="40" viewBox="0 0 40 40">
                      <circle cx="20" cy="20" r="16" fill="none" stroke="#F3F4F6" strokeWidth="4" />
                      <circle cx="20" cy="20" r="16" fill="none" stroke="#FF6900" strokeWidth="4" 
                              strokeDasharray={`${session.progress} ${100 - session.progress}`} 
                              strokeDashoffset="25" />
                    </svg>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{session.progress}%</span>
                  </div>
                </div>
                <div className="mt-2 bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full" style={{ width: `${session.progress}%` }}></div>
                </div>
              </div>
            ))}
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