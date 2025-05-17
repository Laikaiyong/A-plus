'use client';

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from 'framer-motion';
import { 
  LuCalendar, LuClock, LuBookOpen, LuCheck, 
  LuChartBar, LuDownload, LuExternalLink, LuBookmark,
  LuArrowLeft
} from 'react-icons/lu';
import Link from 'next/link';

// Study plan types
interface StudySession {
  id: string;
  title: string;
  duration: number; // in minutes
  date: string;
  completed: boolean;
  topics: string[];
}

interface StudyPlan {
  id: string;
  title: string;
  description: string;
  progress: number;
  totalSessions: number;
  completedSessions: number;
  createdAt: string;
  content: {
    overview: string;
    resources: Array<{
      id: string;
      title: string;
      type: 'pdf' | 'link';
      url: string;
    }>;
  };
  sessions: StudySession[];
}

export default function StudyPlanDetail() {
  const params = useParams();
  const id = params.id as string;
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulating API call to fetch study plan
    const getStudyPlan = async () => {
      try {
        // Replace with actual API call
        setTimeout(() => {
          setStudyPlan(mockStudyPlan);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error("Failed to fetch study plan:", error);
        setLoading(false);
      }
    };

    getStudyPlan();
  }, [id]);

  const toggleSessionCompletion = (sessionId: string) => {
    if (!studyPlan) return;
    
    const updatedSessions = studyPlan.sessions.map(session => 
      session.id === sessionId ? { ...session, completed: !session.completed } : session
    );
    
    const completedCount = updatedSessions.filter(s => s.completed).length;
    const newProgress = (completedCount / studyPlan.totalSessions) * 100;
    
    setStudyPlan({
      ...studyPlan,
      sessions: updatedSessions,
      completedSessions: completedCount,
      progress: newProgress
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-8">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-800"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-orange-500 animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading study plan...</p>
      </div>
    );
  }

  if (!studyPlan) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-8">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <LuBookOpen className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200">Study Plan Not Found</h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400 text-center max-w-md">
          We couldn't find the study plan you're looking for. It may have been deleted or doesn't exist.
        </p>
        <Link href="/plan" className="mt-6 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center">
          <LuArrowLeft className="mr-2" /> Back to Study Plans
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header with back button */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link 
          href="/plan" 
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 mb-4"
        >
          <LuArrowLeft className="mr-2" /> Back to Study Plans
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{studyPlan.title}</h1>
          <div className="mt-2 md:mt-0 bg-orange-100 dark:bg-orange-900/30 px-3 py-1 rounded-full text-orange-600 dark:text-orange-400 text-sm font-medium">
            {studyPlan.completedSessions}/{studyPlan.totalSessions} Sessions Completed
          </div>
        </div>
        <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-3xl">
          {studyPlan.description}
        </p>
      </motion.div>

      {/* Progress section */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <ProgressTracker progress={studyPlan.progress} />
      </motion.div>

      {/* Two column layout for content and calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <ContentPreview content={studyPlan.content} />
          
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Study Sessions</h2>
            <div className="space-y-4">
              {studyPlan.sessions.map((session) => (
                <StudySessionCard 
                  key={session.id} 
                  session={session}
                  onToggleComplete={() => toggleSessionCompletion(session.id)}
                />
              ))}
            </div>
          </div>
        </motion.div>
        
        {/* Right column */}
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <CalendarWidget sessions={studyPlan.sessions} />
        </motion.div>
      </div>
    </div>
  );
}

const ProgressTracker = ({ progress }: { progress: number }) => {
  // Round the progress to nearest integer
  const roundedProgress = Math.round(progress);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Overall Progress</h2>
        <span className="text-lg font-bold text-orange-500">{roundedProgress}%</span>
      </div>
      <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-orange-500 to-orange-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      <div className="flex items-center mt-4 text-sm text-gray-600 dark:text-gray-400">
        <LuChartBar className="mr-2" />
        <span>Keep going! You're making great progress on your study plan.</span>
      </div>
    </div>
  );
};

const ContentPreview = ({ content }: { content: StudyPlan['content'] }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Overview</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        {content.overview}
      </p>
      
      {content.resources.length > 0 && (
        <>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Study Resources</h3>
          <div className="space-y-3">
            {content.resources.map((resource) => (
              <motion.div 
                key={resource.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700"
                whileHover={{ scale: 1.01, backgroundColor: '#f8fafc' }}
              >
                <div className="flex items-center">
                  {resource.type === 'pdf' ? (
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mr-3">
                      <LuDownload className="text-red-500 dark:text-red-400" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3">
                      <LuExternalLink className="text-blue-500 dark:text-blue-400" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-gray-200">{resource.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {resource.type === 'pdf' ? 'PDF Document' : 'External Link'}
                    </p>
                  </div>
                </div>
                <a 
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-300"
                >
                  {resource.type === 'pdf' ? 'Download' : 'Open'}
                </a>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const CalendarWidget = ({ sessions }: { sessions: StudySession[] }) => {
  // Group sessions by date for the calendar view
  const sessionsByDate: Record<string, StudySession[]> = {};
  
  sessions.forEach(session => {
    const dateKey = new Date(session.date).toDateString();
    if (!sessionsByDate[dateKey]) {
      sessionsByDate[dateKey] = [];
    }
    sessionsByDate[dateKey].push(session);
  });

  // Get unique dates
  const dates = Object.keys(sessionsByDate);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Study Schedule</h2>
      
      {dates.length > 0 ? (
        <div className="space-y-4">
          {dates.map((dateKey) => (
            <div key={dateKey} className="border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <LuCalendar className="text-orange-500 dark:text-orange-400" />
                </div>
                <h3 className="ml-3 font-medium text-gray-800 dark:text-gray-200">
                  {new Date(dateKey).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </h3>
              </div>
              
              <div className="ml-13 pl-10 space-y-2">
                {sessionsByDate[dateKey].map((session) => (
                  <div 
                    key={session.id} 
                    className={`px-3 py-2 rounded-lg ${
                      session.completed 
                        ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500'
                        : 'bg-gray-50 dark:bg-gray-700/50'
                    }`}
                  >
                    <p className={`font-medium ${
                      session.completed 
                        ? 'text-green-700 dark:text-green-400' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {session.title}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <LuClock className="mr-1" />
                      <span>{session.duration} minutes</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No scheduled sessions found.</p>
        </div>
      )}
    </div>
  );
};

const StudySessionCard = ({ 
  session, 
  onToggleComplete 
}: { 
  session: StudySession;
  onToggleComplete: () => void;
}) => {
  return (
    <motion.div 
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border ${
        session.completed 
          ? 'border-green-200 dark:border-green-900/30' 
          : 'border-gray-100 dark:border-gray-700'
      }`}
      whileHover={{ y: -4, boxShadow: '0 12px 20px rgba(0,0,0,0.1)' }}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-gray-800 dark:text-white text-lg">{session.title}</h3>
          <div className="flex items-center mt-2 text-gray-600 dark:text-gray-400 text-sm">
            <LuCalendar className="mr-1" />
            <span>{new Date(session.date).toLocaleDateString()}</span>
            <span className="mx-2">•</span>
            <LuClock className="mr-1" />
            <span>{session.duration} minutes</span>
          </div>
          
          <div className="mt-3 flex flex-wrap gap-1">
            {session.topics.map((topic, i) => (
              <span 
                key={i}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
        
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onToggleComplete}
          className={`rounded-full p-2 ${
            session.completed 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
          }`}
        >
          <LuCheck className="w-5 h-5" />
        </motion.button>
      </div>
      
      <div className={`mt-4 pt-4 border-t ${
        session.completed 
          ? 'border-green-100 dark:border-green-900/20' 
          : 'border-gray-100 dark:border-gray-700'
      }`}>
        <button className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 text-sm font-medium">
          View Session Details
        </button>
      </div>
    </motion.div>
  );
};

// Mock data
const mockStudyPlan: StudyPlan = {
  id: "1",
  title: "Advanced JavaScript Concepts",
  description: "Master advanced JavaScript concepts including closures, prototypes, async patterns, and modern ES6+ features.",
  progress: 35,
  totalSessions: 8,
  completedSessions: 3,
  createdAt: "2025-05-10T12:00:00Z",
  content: {
    overview: "This study plan covers advanced JavaScript concepts that are essential for modern web development. You'll learn how JavaScript works under the hood, advanced patterns, and best practices for writing clean, efficient code.",
    resources: [
      {
        id: "r1",
        title: "JavaScript: The Good Parts",
        type: "pdf",
        url: "#"
      },
      {
        id: "r2",
        title: "MDN JavaScript Documentation",
        type: "link",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript"
      },
      {
        id: "r3",
        title: "Advanced JavaScript Patterns",
        type: "pdf",
        url: "#"
      }
    ]
  },
  sessions: [
    {
      id: "s1",
      title: "Closures and Scope",
      duration: 60,
      date: "2025-05-12T10:00:00Z",
      completed: true,
      topics: ["Closures", "Lexical Scope", "Execution Context"]
    },
    {
      id: "s2",
      title: "Prototype Chain and Inheritance",
      duration: 90,
      date: "2025-05-14T14:00:00Z",
      completed: true,
      topics: ["Prototypes", "Inheritance", "Object Creation"]
    },
    {
      id: "s3",
      title: "Async JavaScript",
      duration: 120,
      date: "2025-05-16T09:00:00Z",
      completed: true,
      topics: ["Promises", "Async/Await", "Event Loop"]
    },
    {
      id: "s4",
      title: "Functional Programming Concepts",
      duration: 90,
      date: "2025-05-18T11:00:00Z",
      completed: false,
      topics: ["Pure Functions", "Immutability", "Higher Order Functions"]
    },
    {
      id: "s5",
      title: "ES6+ Features Deep Dive",
      duration: 75,
      date: "2025-05-20T13:00:00Z",
      completed: false,
      topics: ["Destructuring", "Spread Operator", "Modules"]
    },
    {
      id: "s6",
      title: "JavaScript Design Patterns",
      duration: 120,
      date: "2025-05-22T10:00:00Z",
      completed: false,
      topics: ["Singleton", "Factory", "Observer", "Module"]
    },
    {
      id: "s7",
      title: "Performance Optimization",
      duration: 90,
      date: "2025-05-24T09:00:00Z",
      completed: false,
      topics: ["Memory Management", "Efficient DOM", "Debouncing"]
    },
    {
      id: "s8",
      title: "Testing JavaScript Applications",
      duration: 120,
      date: "2025-05-26T14:00:00Z",
      completed: false,
      topics: ["Jest", "Testing React", "TDD Principles"]
    }
  ]
};