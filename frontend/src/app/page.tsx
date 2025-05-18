'use client';

import React from "react";
import { motion } from "framer-motion";
import { 
  LuPlus, LuTrendingUp,  
  LuClock, LuTarget, LuChartBar, 
  LuBookOpen, LuPlay, LuFileText
} from "react-icons/lu";
import Link from "next/link";
import { useAllData } from '../hooks/useAllData';

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
  const { data, loading, error } = useAllData();
  
  if (loading) return <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
  </div>;
  
  if (error) return <div className="p-4 bg-red-100 text-red-800 rounded-lg">Error: {error}</div>;
  
  // Count the total number of tasks (study sessions)
  const taskCount = data?.tasks?.length || 0;
  
  // Get the 3 most recent tasks based on created_at date
  const recentTasks = data?.tasks ? 
    [...data.tasks]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3) : 
    [];
  
  // Find plan titles for each task
  const getTaskPlan = (taskPlanId) => {
    return data?.plans?.find(plan => plan.id === taskPlanId)?.name || "Unnamed Plan";
  };
  
  // Status to progress mapping
  const statusToProgress = {
    'pending': 0,
    'in_progress': 50,
    'completed': 100,
    'cancelled': 0
  };
  
  // Get icon based on task status
  const getTaskIcon = (status) => {
    switch(status) {
      case 'completed': return '✅';
      case 'in_progress': return '🔄';
      case 'pending': return '⏳';
      case 'cancelled': return '❌';
      default: return '📚';
    }
  };
  
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
                <LuChartBar className="h-6 w-6 text-orange-500" />
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
                <h3 className="text-2xl font-bold mt-1 text-gray-800 dark:text-white">{taskCount}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Total tasks</p>
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
          {recentTasks.length > 0 ? (
            recentTasks.map((task) => (
              <motion.div 
                key={task.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden group hover:shadow-md transition-all"
                whileHover={{ y: -5 }}
              >
                <div className="h-40 bg-gradient-to-br from-orange-400/20 to-orange-600/20 relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-gray-900/10 dark:bg-black/20 group-hover:bg-gray-900/0 transition-colors"></div>
                  <span className="text-4xl opacity-50 dark:opacity-30 group-hover:opacity-70 transition-opacity">
                    {getTaskIcon(task.status)}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-center mb-3">
                    <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs rounded-md font-medium">
                      {task.status || "pending"}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {task.duration ? `${task.duration} min` : "No duration set"}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2">{task.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {getTaskPlan(task.plan_id)}
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full" 
                      style={{ width: `${statusToProgress[task.status] || 0}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 flex justify-between items-center text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      {task.status === 'completed' ? "Completed" : `${statusToProgress[task.status] || 0}% complete`}
                    </span>
                    <Link href={`/plan/${task.plan_id}`}>
                      <button className="text-orange-500 hover:text-orange-600 font-medium">View</button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <LuClock className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No tasks yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                Create a study plan and add tasks to get started
              </p>
              <Link href="/plan/create" className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                Create First Plan
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}