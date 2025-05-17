'use client';

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from 'framer-motion';
import { 
  LuCalendar, LuClock, LuBookOpen, LuCheck, 
  LuChartBar, LuDownload, LuExternalLink,
  LuArrowLeft, LuFileText, LuHeadphones, LuChartBarBig, LuVideo
} from 'react-icons/lu';
import Link from 'next/link';

// Content format type
type ContentFormat = 'text' | 'audio' | 'infographic' | 'video';

// Content format configuration
interface FormatConfig {
  id: ContentFormat;
  title: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

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
  const [activeFormat, setActiveFormat] = useState<ContentFormat>('text');
  const [aiContent, setAiContent] = useState<string | null>(null);
  const [generatingContent, setGeneratingContent] = useState(false);

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

  // Function to handle content format change
  const changeContentFormat = async (format: ContentFormat) => {
    setActiveFormat(format);
    await generateAIContent(format);
  };

  // Function to generate AI content based on selected format
  const generateAIContent = async (format: ContentFormat) => {
    if (!studyPlan) return;
    
    setGeneratingContent(true);
    
    try {
      // In a real implementation, this would be an API call to an AI service
      // For now, we'll simulate the response with a timeout
      setTimeout(() => {
        const contents = {
          text: `# ${studyPlan.title} - Text Summary\n\n## Key Concepts\n${studyPlan.content.overview}\n\n## Important Points\n${studyPlan.sessions.slice(0, 3).map(s => `- **${s.title}**: ${s.topics.join(', ')}`).join('\n')}\n\n## Learning Objectives\n1. Understand the fundamentals of ${studyPlan.sessions[0].topics[0]}\n2. Apply ${studyPlan.sessions[1].topics[0]} in practical scenarios\n3. Compare and contrast ${studyPlan.sessions[2].topics.join(' and ')}`,
          
          audio: `# ${studyPlan.title} - Audio Transcript\n\n## Introduction (00:00 - 01:30)\nWelcome to this audio guide on ${studyPlan.title}. In this session, we'll explore ${studyPlan.content.overview.split('.')[0]}.\n\n## Main Concepts (01:30 - 15:45)\n${studyPlan.sessions.slice(0, 3).map((s, i) => `### Part ${i+1}: ${s.title}\n- Key discussion on ${s.topics.join('\n- Analysis of ')}`).join('\n\n')}\n\n## Conclusion (15:45 - 20:00)\nTo summarize what we've learned about ${studyPlan.title}, remember these key points: ${studyPlan.sessions[0].topics[0]} forms the foundation, while ${studyPlan.sessions[1].topics[0]} and ${studyPlan.sessions[2].topics[0]} build upon it.`,
          
          infographic: `# ${studyPlan.title} - Visual Guide\n\n## Central Concept Map\n- **Core: ${studyPlan.title}**\n  - Branch 1: ${studyPlan.sessions[0].title}\n  - Branch 2: ${studyPlan.sessions[1].title}\n  - Branch 3: ${studyPlan.sessions[2].title}\n\n## Key Visual Elements\n1. **Color Coding**:\n   - Blue: Fundamental concepts (${studyPlan.sessions[0].topics[0]})\n   - Green: Implementation techniques (${studyPlan.sessions[1].topics[0]})\n   - Purple: Advanced applications (${studyPlan.sessions[2].topics[0]})\n\n## Learning Flow Diagram\nStart → ${studyPlan.sessions[0].title} → ${studyPlan.sessions[1].title} → ${studyPlan.sessions[2].title} → ${studyPlan.sessions[3].title} → Advanced Topics`,
          
          video: `# ${studyPlan.title} - Video Script\n\n## Opening Shot (0:00 - 0:30)\nVisual: Code editor with ${studyPlan.title} examples\nAudio: "Welcome to this video tutorial on ${studyPlan.title}, where we'll cover essential concepts for modern development."\n\n## Chapter Breakdown\n${studyPlan.sessions.slice(0, 4).map((s, i) => `### Chapter ${i+1}: ${s.title} (${i*5}:00 - ${(i+1)*5}:00)\nVisual: Demonstration of ${s.topics[0]} with code examples\nAudio: "Now let's examine ${s.title} and why it's fundamental to ${studyPlan.title}."`).join('\n\n')}\n\n## Conclusion (20:00 - 22:00)\nVisual: Summary slide with key takeaways\nAudio: "To master ${studyPlan.title}, focus on understanding the relationship between ${studyPlan.sessions[0].topics[0]} and ${studyPlan.sessions[1].topics[0]}."`
        };
        
        setAiContent(contents[format]);
        setGeneratingContent(false);
      }, 1500);
    } catch (error) {
      console.error("Failed to generate AI content:", error);
      setGeneratingContent(false);
      setAiContent("Failed to generate content. Please try again.");
    }
  };

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
          We couldn&apos;t find the study plan you&apos;re looking for. It may have been deleted or doesn&apos;t exist.
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

      {/* Content Format Selector */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <ContentFormatSelector 
          activeFormat={activeFormat} 
          onFormatChange={changeContentFormat} 
        />
      </motion.div>

      {/* AI-generated content section */}
      {(aiContent || generatingContent) && (
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              AI Learning Assistant - {contentFormats.find(f => f.id === activeFormat)?.title} Format
            </h2>
            
            {generatingContent ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-12 h-12 relative">
                  <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-800"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-orange-500 animate-spin"></div>
                </div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Generating content...</p>
              </div>
            ) : (
              <div className="prose dark:prose-invert prose-orange max-w-none">
                {/* Render markdown content */}
                <div dangerouslySetInnerHTML={{ 
                  __html: aiContent ? convertMarkdownToHtml(aiContent) : '' 
                }} />
              </div>
            )}
          </div>
        </motion.div>
      )}

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

// Add this function to convert markdown to HTML
// In a real implementation, you'd use a proper markdown library like marked or remark
function convertMarkdownToHtml(markdown: string): string {
  // This is a very simplified markdown parser for demonstration
  return markdown
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/- (.*)/gim, '<ul><li>$1</li></ul>')
    .replace(/\d\. (.*)/gim, '<ol><li>$1</li></ol>')
    .replace(/\n/gim, '<br>');
}

// Content format configurations
const contentFormats: FormatConfig[] = [
  {
    id: 'text',
    title: 'Text',
    icon: <LuFileText className="h-5 w-5" />,
    description: 'Written study materials',
    color: 'bg-blue-500'
  },
  {
    id: 'audio',
    title: 'Audio',
    icon: <LuHeadphones className="h-5 w-5" />,
    description: 'Audio learning content',
    color: 'bg-green-500'
  },
  {
    id: 'infographic',
    title: 'Infographic',
    icon: <LuChartBarBig className="h-5 w-5" />,
    description: 'Visual learning aids',
    color: 'bg-purple-500'
  },
  {
    id: 'video',
    title: 'Video',
    icon: <LuVideo className="h-5 w-5" />,
    description: 'Video-based tutorials',
    color: 'bg-red-500'
  }
];

// Content Format Selector Component
const ContentFormatSelector = ({ 
  activeFormat, 
  onFormatChange 
}: { 
  activeFormat: ContentFormat;
  onFormatChange: (format: ContentFormat) => void;
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Content Format</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-5">
        Choose your preferred learning format to get AI-generated content tailored to your learning style.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {contentFormats.map((format) => (
          <motion.button
            key={format.id}
            className={`flex flex-col items-center p-4 rounded-lg border ${
              activeFormat === format.id 
                ? `border-${format.color.split('-')[1]}-500 bg-${format.color.split('-')[1]}-50 dark:bg-${format.color.split('-')[1]}-900/20` 
                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onFormatChange(format.id)}
          >
            <div className={`w-12 h-12 rounded-full ${format.color} bg-opacity-20 dark:bg-opacity-30 flex items-center justify-center mb-3`}>
              {format.icon}
            </div>
            <h3 className="font-medium text-gray-800 dark:text-white">{format.title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
              {format.description}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

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
          <span>Keep going! You&apos;re making great progress on your study plan.</span>
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