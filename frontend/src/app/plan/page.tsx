'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { LuPlus, LuCalendarDays, LuList, LuFilter, LuMessageSquare, LuSearch, LuLayoutGrid } from 'react-icons/lu';
import { useAllData } from '../../hooks/useAllData';

// Animation variants
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

const PlanPage = () => {
  const { data, loading, error } = useAllData();
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState(null);
  
  // Generate a consistent color based on plan ID
  const getPlanColor = (planId) => {
    // Predefined color palette for better UI
    const colorPalette = [
      { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
      { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', dot: 'bg-purple-500' },
      { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', dot: 'bg-green-500' },
      { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-700 dark:text-pink-300', dot: 'bg-pink-500' },
      { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', dot: 'bg-yellow-500' },
      { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-300', dot: 'bg-indigo-500' },
      { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-500' },
      { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', dot: 'bg-orange-500' },
    ];
    
    // Use the plan ID to select a color from the palette
    return colorPalette[planId % colorPalette.length];
  };
  
  // Convert tasks to calendar events
  const tasksAsEvents = data?.tasks ? data.tasks.map(task => {
    const taskDate = task.start_date && task.start_time ? 
      new Date(`${task.start_date}T${task.start_time}`) : 
      new Date();
      
    // Find the associated plan
    const associatedPlan = data.plans.find(plan => plan.id === task.plan_id);
    const planName = associatedPlan?.name || "Unnamed Plan";
    
    // Get color based on plan ID
    const planColor = getPlanColor(task.plan_id);
    
    return {
      id: task.id,
      title: task.title,
      date: taskDate,
      duration: task.duration || 60,
      planName: planName,
      plan_id: task.plan_id,
      status: task.status,
      color: planColor
    };
  }) : [];
  
  // Filter events by selected plan if needed
  const filteredEvents = selectedPlanFilter 
    ? tasksAsEvents.filter(event => event.plan_id === selectedPlanFilter)
    : tasksAsEvents;
    
  // Get plans with tasks count and progress calculations
  const plansWithMetrics = data?.plans ? data.plans.map(plan => {
    // Find tasks for this plan
    const planTasks = data.tasks.filter(task => task.plan_id === plan.id);
    const totalTasks = planTasks.length;
    const completedTasks = planTasks.filter(task => task.status === 'completed').length;
    
    // Calculate progress
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Find the next upcoming task
    const upcomingTasks = planTasks
      .filter(task => task.status !== 'completed' && task.status !== 'cancelled' && task.start_date)
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
    
    const nextSession = upcomingTasks.length > 0 ? 
      formatNextSession(upcomingTasks[0].start_date, upcomingTasks[0].start_time) :
      "No upcoming sessions";
    
    // Get color for this plan
    const color = getPlanColor(plan.id);
    
    return {
      ...plan,
      totalSessions: totalTasks,
      completedSessions: completedTasks,
      nextSession,
      progress,
      color
    };
  })
  .filter(plan => plan.name.toLowerCase().includes(searchTerm.toLowerCase()))
  : [];
  
  // Format next session date
  function formatNextSession(dateStr, timeStr) {
    if (!dateStr) return "Not scheduled";
    
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${timeStr ? formatTimeDisplay(timeStr) : ''}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${timeStr ? formatTimeDisplay(timeStr) : ''}`;
    } else {
      return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${timeStr ? formatTimeDisplay(timeStr) : ''}`;
    }
  }
  
  // Format time for display (convert "13:00:00" to "1:00 PM")
  function formatTimeDisplay(timeStr) {
    if (!timeStr) return '';
    
    try {
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch (e) {
      return timeStr;
    }
  }
  
  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay();
    
    // Total days in current month
    const daysInMonth = lastDay.getDate();
    
    // Generate array of day objects
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ day: new Date(year, month, -firstDayOfWeek + i + 1), isCurrentMonth: false });
    }
    
    // Add days of the current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: new Date(year, month, i), isCurrentMonth: true });
    }
    
    // Add empty cells for days after the last day of the month (to complete the grid)
    const remainingCells = 42 - days.length; // 6 rows * 7 columns
    for (let i = 1; i <= remainingCells; i++) {
      days.push({ day: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    
    return days;
  };
  
  const days = generateCalendarDays();
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const getEventsForDay = (date) => {
    return filteredEvents.filter(event => 
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
  };
  
  const formatMonth = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
  
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };
  
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };
  
  const isSelected = (date) => {
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
    </div>
  );

  if (error) return (
    <div className="p-4 bg-red-100 text-red-800 rounded-lg">
      Error loading data: {error}
    </div>
  );

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={item} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Study Plans</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Organize and track your learning journey</p>
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LuSearch className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            />
          </div>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/plan/create" className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-lg shadow-md shadow-orange-200 dark:shadow-orange-900/20 hover:from-orange-600 hover:to-orange-700 transition-all">
              <LuPlus className="mr-2 h-5 w-5" />
              New Study Plan
            </Link>
          </motion.div>
        </div>
      </motion.div>
      
      <motion.div variants={item} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1.5 rounded-md flex items-center ${
              viewMode === 'calendar' 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <LuCalendarDays className="mr-1.5 h-4 w-4" />
            Calendar
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-md flex items-center ${
              viewMode === 'list' 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <LuList className="mr-1.5 h-4 w-4" />
            List
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Plan filter dropdown */}
          <select 
            className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
            value={selectedPlanFilter || ''}
            onChange={(e) => setSelectedPlanFilter(e.target.value ? parseInt(e.target.value) : null)}
          >
            <option value="">All Plans</option>
            {data?.plans?.map(plan => (
              <option key={plan.id} value={plan.id}>{plan.name}</option>
            ))}
          </select>
          
          <button className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">
            <LuFilter className="h-5 w-5" />
          </button>
        </div>
      </motion.div>
      
      {viewMode === 'calendar' ? (
        <motion.div variants={item} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{formatMonth(currentMonth)}</h2>
            <div className="flex space-x-2">
              <button 
                onClick={prevMonth}
                className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                &larr;
              </button>
              <button 
                onClick={nextMonth}
                className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                &rarr;
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {weekdays.map(day => (
              <div key={day} className="text-center font-medium text-gray-500 dark:text-gray-400 py-2">
                {day}
              </div>
            ))}
            
            {days.map((dayObj, index) => {
              const eventsForDay = getEventsForDay(dayObj.day);
              const hasEvents = eventsForDay.length > 0;
              
              return (
                <div 
                  key={index}
                  onClick={() => dayObj.isCurrentMonth && setSelectedDate(dayObj.day)}
                  className={`
                    cursor-pointer min-h-[90px] border rounded-lg p-2 relative
                    ${dayObj.isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-850 text-gray-400 dark:text-gray-600'}
                    ${isToday(dayObj.day) ? 'ring-2 ring-orange-500' : 'border-gray-100 dark:border-gray-700'}
                    ${isSelected(dayObj.day) ? 'ring-2 ring-orange-500 shadow-md' : ''}
                    hover:shadow-sm transition-shadow
                  `}
                >
                  <div className="text-right mb-1">
                    <span className={`
                      text-sm font-medium 
                      ${isToday(dayObj.day) ? 'text-orange-500 dark:text-orange-400' : 
                        dayObj.isCurrentMonth ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-600'}
                    `}>
                      {dayObj.day.getDate()}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    {hasEvents && eventsForDay.slice(0, 2).map(event => (
                      <Link href={`/plan/${event.plan_id}`} key={event.id}>
                        <div 
                          className={`
                            text-xs p-1 rounded-md truncate cursor-pointer
                            ${event.color.bg} ${event.color.text}
                          `}
                        >
                          {event.title}
                        </div>
                      </Link>
                    ))}
                    
                    {eventsForDay.length > 2 && (
                      <div className="text-xs text-center mt-1 text-gray-500 dark:text-gray-400">
                        +{eventsForDay.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      ) : (
        <motion.div variants={item} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
          {plansWithMetrics.length > 0 ? (
            plansWithMetrics.map(plan => (
              <div key={plan.id} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <Link href={`/plan/${plan.id}`} className="block">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white hover:text-orange-500 dark:hover:text-orange-400 transition-colors">{plan.name}</h3>
                    </Link>
                    <div className="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>Next session: <span className="font-medium text-gray-800 dark:text-gray-200">{plan.nextSession}</span></span>
                      <span className="mx-2">•</span>
                      <span>{plan.completedSessions} of {plan.totalSessions} sessions completed</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <div className="relative h-9 w-9">
                        <svg className="w-full h-full" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="16" fill="none" strokeWidth="3" stroke="#E5E7EB" className="dark:stroke-gray-700" />
                          <circle
                            cx="18" cy="18" r="16"
                            fill="none" strokeWidth="3"
                            stroke="#FF6900"
                            strokeDasharray={`${plan.progress} ${100 - plan.progress}`}
                            strokeDashoffset="25"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                          {plan.progress}%
                        </div>
                      </div>
                    </div>
                    
                    <Link href={`/chat?planId=${plan.id}`}>
                      <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <LuMessageSquare className="h-5 w-5" />
                      </button>
                    </Link>
                  </div>
                </div>
                
                <div className="mt-3 bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-500"
                    style={{ width: `${plan.progress}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">No plans found matching your criteria.</p>
              <Link href="/plan/create" className="mt-4 inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                Create a Plan
              </Link>
            </div>
          )}
        </motion.div>
      )}
      
      {selectedDate && viewMode === 'calendar' && getEventsForDay(selectedDate).length > 0 && (
        <motion.div 
          variants={item}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5"
        >
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
            Sessions on {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h3>
          
          <div className="space-y-3">
            {getEventsForDay(selectedDate).map(event => (
              <Link href={`/plan/${event.plan_id}`} key={event.id}>
                <div 
                  className="p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:shadow-md transition-all flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-white">{event.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {event.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {event.duration} min
                    </p>
                  </div>
                  
                  <div className="flex items-center">
                    <span className={`
                      inline-block w-3 h-3 rounded-full mr-2
                      ${event.color.dot}
                    `} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {event.planName}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default PlanPage;