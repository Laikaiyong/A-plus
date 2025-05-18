"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LuSend,
  LuPaperclip,
  LuPlus,
  LuLoader,
  LuCalendar,
  LuBookOpen,
  LuArrowRight,
  LuX,
  LuBrainCircuit,
  LuSquareCheck,
  LuClock,
  LuPanelLeft,
  LuChartBar,
  LuList,
  LuChevronDown,
} from "react-icons/lu";
import Link from "next/link";
import Image from "next/image";
import Recorder from "recorder-js";
import { marked } from "marked";
import { useAllData } from "../../hooks/useAllData";

// Mock data for initial messages
const initialMessages = [
  {
    id: 1,
    sender: "ai",
    text: "Hello! I'm your A+ learning assistant. How can I help with your studies today?",
    timestamp: new Date(Date.now() - 60000),
  },
];

// Mock study plans
const mockStudyPlans = [
  {
    id: "plan-1",
    title: "Advanced JavaScript Concepts",
    progress: 35,
    totalSessions: 8,
    completedSessions: 3,
    nextSession: {
      title: "Functional Programming Concepts",
      date: new Date(Date.now() + 86400000),
      duration: 90,
    },
    topics: ["Closures", "Prototypes", "Async Patterns"],
  },
  {
    id: "plan-2",
    title: "Introduction to Machine Learning",
    progress: 25,
    totalSessions: 12,
    completedSessions: 3,
    nextSession: {
      title: "Linear Regression",
      date: new Date(Date.now() + 86400000 * 2),
      duration: 75,
    },
    topics: ["Data Preprocessing", "Feature Selection", "Model Evaluation"],
  },
  {
    id: "plan-3",
    title: "React State Management",
    progress: 55,
    totalSessions: 5,
    completedSessions: 3,
    nextSession: {
      title: "Redux Middleware",
      date: new Date(Date.now() + 86400000 * 3),
      duration: 60,
    },
    topics: ["Context API", "Redux", "Zustand"],
  },
];

// Mock study tasks
const mockStudyTasks = [
  {
    id: "task-1",
    title: "Review React Hooks",
    dueDate: new Date(Date.now() + 86400000),
    completed: false,
    planId: "plan-3",
  },
  {
    id: "task-2",
    title: "Complete JavaScript exercises",
    dueDate: new Date(Date.now() + 86400000 * 2),
    completed: false,
    planId: "plan-1",
  },
  {
    id: "task-3",
    title: "Train Python model",
    dueDate: new Date(Date.now() + 86400000 * 3),
    completed: true,
    planId: "plan-2",
  },
];

export default function ChatPage() {
  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<unknown[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Study plans integration features
  const [showStudyPlansPanel, setShowStudyPlansPanel] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [showInsightsPanel, setShowInsightsPanel] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [detectedTopics, setDetectedTopics] = useState<string[]>([]);
  const [relevantFocusAreas, setRelevantFocusAreas] = useState<
    { name: string; progress: number }[]
  >([]);
  const [recommendedSteps, setRecommendedSteps] = useState<
    { icon: string; color: string; text: string }[]
  >([]);

  // Get real data using the hook
  const { data, loading, error } = useAllData();

  // Transform real data to match the existing expected format
  const studyPlans = React.useMemo(() => {
    if (!data?.plans || !data?.tasks) return mockStudyPlans;

    return data.plans.map((plan) => {
      // Find tasks for this plan
      const planTasks = data.tasks.filter((task) => task.plan_id === plan.id);
      const totalTasks = planTasks.length;
      const completedTasks = planTasks.filter(
        (task) => task.status === "completed"
      ).length;

      // Calculate progress
      const progress =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Find the next upcoming task
      const upcomingTasks = planTasks
        .filter(
          (task) =>
            task.status !== "completed" &&
            task.status !== "cancelled" &&
            task.start_date
        )
        .sort(
          (a, b) =>
            new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
        );

      const nextSession =
        upcomingTasks.length > 0
          ? {
              title: upcomingTasks[0].title,
              date: new Date(upcomingTasks[0].start_date),
              duration: upcomingTasks[0].duration || 60,
            }
          : {
              title: "No upcoming session",
              date: new Date(),
              duration: 0,
            };

      return {
        id: `plan-${plan.id}`,
        title: plan.name,
        progress,
        totalSessions: totalTasks,
        completedSessions: completedTasks,
        nextSession,
        topics: plan.tags ? plan.tags.split(",").map((tag) => tag.trim()) : [],
      };
    });
  }, [data?.plans, data?.tasks]);

  const studyTasks = React.useMemo(() => {
    if (!data?.tasks) return mockStudyTasks;

    return data.tasks
      .filter(
        (task) => task.status !== "completed" && task.status !== "cancelled"
      )
      .slice(0, 5) // Limit to 5 upcoming tasks
      .map((task) => ({
        id: `task-${task.id}`,
        title: task.title,
        dueDate: new Date(task.start_date || Date.now()),
        completed: task.status === "completed",
        planId: `plan-${task.plan_id}`,
      }));
  }, [data?.tasks]);

  // Function to analyze message content and update insights
  const analyzeMessageContent = (message: string) => {
    // Convert message to lowercase for easier matching
    const lowerMessage = message.toLowerCase();

    // Extract topics based on keyword matching and available plans/topics
    const topics: string[] = [];

    // Check for topics from user's actual study plans
    studyPlans.forEach((plan) => {
      // Check plan title
      if (lowerMessage.includes(plan.title.toLowerCase())) {
        topics.push(plan.title);
      }

      // Check plan topics/tags
      plan.topics?.forEach((topic) => {
        if (lowerMessage.includes(topic.toLowerCase())) {
          topics.push(topic);
        }
      });
    });

    // Additional topic detection logic
    if (
      lowerMessage.includes("javascript") ||
      lowerMessage.includes("js") ||
      lowerMessage.includes("react") ||
      lowerMessage.includes("node")
    ) {
      topics.push("JavaScript");
      if (lowerMessage.includes("react")) topics.push("React");
      if (lowerMessage.includes("node")) topics.push("Node.js");
    }

    if (
      lowerMessage.includes("math") ||
      lowerMessage.includes("algebra") ||
      lowerMessage.includes("equation") ||
      lowerMessage.includes("formula")
    ) {
      topics.push("Math");
      if (lowerMessage.includes("quadratic"))
        topics.push("Quadratic Equations");
      if (lowerMessage.includes("algebra")) topics.push("Algebra");
    }

    if (
      lowerMessage.includes("machine learning") ||
      lowerMessage.includes("ai") ||
      lowerMessage.includes("ml") ||
      lowerMessage.includes("algorithm")
    ) {
      topics.push("Machine Learning");
      if (lowerMessage.includes("neural")) topics.push("Neural Networks");
    }

    // If no specific topics detected, use general learning topics
    if (topics.length === 0) {
      topics.push("Learning Strategies", "Study Skills");
    }

    // Remove duplicates
    const uniqueTopics = [...new Set(topics)];
    setDetectedTopics(uniqueTopics);

    // Generate focus areas based on detected topics
    const focusAreas: { name: string; progress: number }[] = [];

    // Use actual study plans for focus areas if available
    studyPlans.forEach((plan) => {
      if (
        topics.includes(plan.title) ||
        plan.topics?.some((topic) => topics.includes(topic))
      ) {
        focusAreas.push({
          name: plan.title,
          progress: plan.progress,
        });
      }
    });

    // Add some default areas if needed
    if (
      topics.includes("JavaScript") &&
      !focusAreas.find((a) => a.name.includes("JavaScript"))
    ) {
      focusAreas.push({ name: "JavaScript", progress: 65 });
    }
    if (
      topics.includes("Math") &&
      !focusAreas.find((a) => a.name.includes("Math"))
    ) {
      focusAreas.push({ name: "Math", progress: 40 });
    }
    if (
      (topics.includes("Machine Learning") || topics.includes("AI")) &&
      !focusAreas.find((a) => a.name.includes("Machine Learning"))
    ) {
      focusAreas.push({ name: "Machine Learning", progress: 25 });
    }

    // Limit to top 3 focus areas
    setRelevantFocusAreas(focusAreas.slice(0, 3));

    // Generate recommended next steps based on detected topics and real plans/tasks
    const recommendations: { icon: string; color: string; text: string }[] = [];

    // Add recommendations based on upcoming tasks that match detected topics
    studyTasks.forEach((task) => {
      const relatedPlan = studyPlans.find((p) => p.id === task.planId);

      if (
        relatedPlan &&
        (topics.includes(relatedPlan.title) ||
          relatedPlan.topics?.some((topic) => topics.includes(topic)))
      ) {
        recommendations.push({
          icon: "check",
          color: "green",
          text: `Complete "${task.title}" task`,
        });
      }
    });

    // Add general topic-based recommendations
    if (uniqueTopics.includes("JavaScript") || uniqueTopics.includes("React")) {
      recommendations.push({
        icon: "book",
        color: "blue",
        text: "Review JavaScript fundamentals",
      });
    }

    if (
      uniqueTopics.includes("Math") ||
      uniqueTopics.includes("Algebra") ||
      uniqueTopics.includes("Quadratic Equations")
    ) {
      recommendations.push({
        icon: "book",
        color: "blue",
        text: "Practice solving equations",
      });
    }

    if (uniqueTopics.includes("Machine Learning")) {
      recommendations.push({
        icon: "calendar",
        color: "purple",
        text: "Schedule model training session",
      });
    }

    // Add general recommendation if needed
    if (recommendations.length < 2) {
      recommendations.push({
        icon: "calendar",
        color: "purple",
        text: "Schedule a study session for this topic",
      });
    }

    // Limit to 3 recommendations
    setRecommendedSteps(recommendations.slice(0, 3));
  };

  // Enhanced message sending function
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    // Analyze the message content to update insights
    analyzeMessageContent(inputText);

    const newUserMessage = {
      id: messages.length + 1,
      sender: "user",
      text: inputText,
      timestamp: new Date(),
    };

    // Add user message and a blank AI message for streaming
    setMessages((prev) => [
      ...prev,
      newUserMessage,
      {
        id: newUserMessage.id + 1,
        sender: "ai",
        text: "",
        timestamp: new Date(),
      },
    ]);
    setInputText("");
    setIsProcessing(true);

    // Rest of the existing handleSendMessage function
    try {
      const res = await fetch("/api/gen/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: inputText }),
      });

      // Stream NDJSON response
      console.log(res);
      if (!res.ok) {
        throw new Error(`API returned status code ${res.status}`);
      }

      const data = await res.json();
      console.log("API response:", data);

      if (
        data.choices &&
        data.choices[0] &&
        data.choices[0].message &&
        data.choices[0].message.content
      ) {
        setMessages((prev) => [
          ...prev.slice(0, -1),
          {
            ...prev[prev.length - 1],
            text: data.choices[0].message.content,
          },
        ]);
      } else {
        throw new Error("Unexpected response format from API");
      }
    } catch (err: unknown) {
      console.error("AI API error:", err);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          ...prev[prev.length - 1],
          text: `Sorry, there was an error generating a response. ${
            err?.message ? err.message : ""
          }`,
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  function convertMarkdownToHtml(markdown: string): string {
    if (!markdown) return "";

    // Configure marked options if needed
    marked.setOptions({
      breaks: true, // Convert line breaks to <br>
      gfm: true, // GitHub flavored markdown
      sanitize: false, // Allow HTML
    });

    return marked.parse(markdown);
  }

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Effect to set initial height (full screen)
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.style.height = `calc(100vh - 180px)`;
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  interface RecorderJs {
    init(stream: MediaStream): void;
    start(): Promise<void>;
    stop(): Promise<{ blob: Blob }>;
    stream: MediaStream;
  }

  // Then add this effect to initialize audio functionality only on the client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Initialize AudioContext
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;
      const newAudioContext = new AudioContextClass();
      // setAudioContext(newAudioContext);

      // Initialize recorder
      const newRecorder = new Recorder(newAudioContext, {
        // Options here
      });
      // setRecorder(newRecorder);
    }
  }, []);

  const processAudioToText = async (audioBlob: Blob) => {
    setIsProcessing(true);

    try {
      const res = await fetch("/api/nlp/stt", {
        method: "POST",
        headers: { "Content-Type": "audio/wav" }, // Now sending WAV/PCM
        body: audioBlob,
      });

      const data = await res.json();
      console.log(data);
      if (data && data.result) {
        setInputText(data.result);
      } else {
        console.warn("Unexpected response:", data);
        alert("Speech recognition failed.");
      }
    } catch (err) {
      console.error("Error sending audio:", err);
      alert("Failed to transcribe audio.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);

      // Process each file
      const files = Array.from(e.target.files).map((file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
      }));

      // Simulate upload delay
      setTimeout(() => {
        setUploadedFiles((prev) => [...prev, ...files]);
        setIsUploading(false);
      }, 1000);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((files) => files.filter((_, i) => i !== index));
  };

  // Simple mock response generat

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 500, damping: 30 },
    },
  };

  return (
    <motion.div
      className="h-full flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center">
            <LuBrainCircuit className="mr-2 text-orange-500 h-8 w-8" />
            A+ Assistant
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Ask questions about your study materials or get help with concepts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowStudyPlansPanel(!showStudyPlansPanel)}
            className={`inline-flex items-center px-4 py-2 bg-gradient-to-r ${
              showStudyPlansPanel
                ? "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                : "from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 dark:from-gray-700 dark:to-gray-800 dark:hover:from-gray-600 dark:hover:to-gray-700"
            } font-medium rounded-lg transition-all ${
              showStudyPlansPanel
                ? "text-white shadow-md shadow-blue-200 dark:shadow-blue-900/20"
                : "text-gray-700 dark:text-gray-300"
            }`}>
            <LuPanelLeft className="mr-2 h-5 w-5" />
            Study Plans
          </motion.button>
        </div>
      </div>

      <div className="flex flex-grow h-full gap-4" ref={chatContainerRef}>
        {/* Study Plans Panel */}
        <AnimatePresence>
          {showStudyPlansPanel && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "300px" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-[300px] bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                <h3 className="font-bold text-gray-800 dark:text-white flex items-center">
                  <LuList className="mr-2 text-orange-500" />
                  My Study Plans
                </h3>
              </div>

              {/* Plans List - Now uses the real data */}
              <div className="flex-grow overflow-y-auto p-3 space-y-3">
                {loading ? (
                  <div className="flex items-center justify-center h-20">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-orange-500"></div>
                  </div>
                ) : error ? (
                  <div className="text-red-500 text-sm p-3">
                    Error loading plans: {error}
                  </div>
                ) : (
                  <>
                    {studyPlans.map((plan) => (
                      <div
                        key={plan.id}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          selectedPlan === plan.id
                            ? "border-orange-200 bg-orange-50 dark:border-orange-900/50 dark:bg-orange-900/20"
                            : "border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750"
                        }`}
                        onClick={() => {
                          setSelectedPlan(
                            selectedPlan === plan.id ? null : plan.id
                          );
                          setSelectedTask(null);
                        }}>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-800 dark:text-white">
                            {plan.title}
                          </h4>
                          <span className="text-xs px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                            {plan.completedSessions}/{plan.totalSessions}
                          </span>
                        </div>

                        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 to-orange-600"
                            style={{ width: `${plan.progress}%` }}
                          />
                        </div>

                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <LuCalendar className="w-3.5 h-3.5 mr-1" />
                          <span>Next: {plan.nextSession.title}</span>
                        </div>

                        {/* Attach button */}
                        {selectedPlan === plan.id && (
                          <button
                            className="mt-2 w-full px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-medium rounded"
                            onClick={(e) => {
                              e.stopPropagation();
                              setInputText((prev) =>
                                prev
                                  ? `${prev} (Regarding my "${plan.title}" study plan)`
                                  : `I need help with my "${plan.title}" study plan`
                              );
                            }}>
                            Attach to Message
                          </button>
                        )}
                      </div>
                    ))}

                    <h4 className="font-medium text-gray-700 dark:text-gray-300 text-sm mt-4 mb-2 px-1">
                      Upcoming Tasks
                    </h4>

                    {studyTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          selectedTask === task.id
                            ? "border-orange-200 bg-orange-50 dark:border-orange-900/50 dark:bg-orange-900/20"
                            : "border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750"
                        }`}
                        onClick={() => {
                          setSelectedTask(
                            selectedTask === task.id ? null : task.id
                          );
                          setSelectedPlan(null);
                        }}>
                        <div className="flex items-start mb-1">
                          <div
                            className={`p-1 rounded ${
                              task.completed
                                ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                            }`}>
                            {task.completed ? (
                              <LuSquareCheck className="w-4 h-4" />
                            ) : (
                              <LuClock className="w-4 h-4" />
                            )}
                          </div>
                          <div className="ml-2">
                            <h4
                              className={`font-medium ${
                                task.completed
                                  ? "text-green-600 dark:text-green-400 line-through"
                                  : "text-gray-800 dark:text-white"
                              }`}>
                              {task.title}
                            </h4>
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <LuCalendar className="w-3.5 h-3.5 mr-1" />
                              <span>
                                Due: {task.dueDate.toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Attach button - same as before */}
                        {selectedTask === task.id && (
                          <button
                            className="mt-2 w-full px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-medium rounded"
                            onClick={(e) => {
                              e.stopPropagation();
                              setInputText((prev) =>
                                prev
                                  ? `${prev} (About my task: "${task.title}")`
                                  : `I need help with my task: "${task.title}"`
                              );
                            }}>
                            Attach to Message
                          </button>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main chat area */}
        <div className="flex-grow flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Messages container */}
          <div className="flex-grow overflow-y-auto p-6 space-y-4">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  variants={itemVariants}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}>
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 ${
                      message.sender === "user"
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                        : "bg-white dark:bg-gray-750 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200"
                    }`}>
                    {message.sender === "ai" ? (
                      <div
                        className="text-sm md:text-base prose dark:prose-invert prose-sm max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: convertMarkdownToHtml(message.text),
                        }}
                      />
                    ) : (
                      <div className="text-sm md:text-base">{message.text}</div>
                    )}
                    {/* Display uploaded files if any */}
                    {message.files && message.files.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.files.map((file: unknown, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center p-2 rounded-lg bg-black/10 dark:bg-white/10">
                            {file.type.startsWith("image/") ? (
                              <div className="w-10 h-10 rounded bg-white/20 overflow-hidden mr-2">
                                <Image
                                  src={file.url}
                                  alt="Uploaded"
                                  width={40}
                                  height={40}
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded bg-white/20 flex items-center justify-center mr-2">
                                <LuPaperclip className="w-5 h-5" />
                              </div>
                            )}
                            <div className="text-xs line-clamp-1">
                              {file.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Display attached plan if any */}
                    {message.attachedPlan && (
                      <div className="mt-3 bg-black/10 dark:bg-white/10 rounded-lg p-2">
                        <div className="flex items-center mb-1">
                          <LuList className="w-4 h-4 mr-1" />
                          <span className="text-xs font-medium">
                            Attached Study Plan:
                          </span>
                        </div>
                        <div className="text-xs">
                          {message.attachedPlan.title} (
                          {message.attachedPlan.progress}% complete)
                        </div>
                      </div>
                    )}

                    {/* Display attached task if any */}
                    {message.attachedTask && (
                      <div className="mt-3 bg-black/10 dark:bg-white/10 rounded-lg p-2">
                        <div className="flex items-center mb-1">
                          <LuSquareCheck className="w-4 h-4 mr-1" />
                          <span className="text-xs font-medium">
                            Attached Task:
                          </span>
                        </div>
                        <div className="text-xs">
                          {message.attachedTask.title} (Due:{" "}
                          {message.attachedTask.dueDate.toLocaleDateString()})
                        </div>
                      </div>
                    )}

                    {/* Study material references */}
                    {message.references && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          Referenced materials:
                        </p>
                        <div className="space-y-2">
                          {message.references.map((ref: unknown) => (
                            <Link href={`/plan/${ref.id}`} key={ref.id}>
                              <div className="flex items-center p-2 rounded-md bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-xs hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
                                {ref.type === "pdf" ? (
                                  <LuBookOpen className="w-4 h-4 mr-2" />
                                ) : (
                                  <LuBookOpen className="w-4 h-4 mr-2" />
                                )}
                                <span className="line-clamp-1">
                                  {ref.title}
                                </span>
                                <LuArrowRight className="w-3 h-3 ml-auto" />
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Calendar suggestion */}
                    {message.calendarSuggestion && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <Link href="/plan">
                          <div className="flex items-center p-2 rounded-md bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-xs hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
                            <LuCalendar className="w-4 h-4 mr-2" />
                            <div>
                              <p className="font-medium">
                                {message.calendarSuggestion.title}
                              </p>
                              <p>
                                {message.calendarSuggestion.date.toLocaleDateString()}
                              </p>
                            </div>
                            <LuArrowRight className="w-3 h-3 ml-auto" />
                          </div>
                        </Link>
                      </div>
                    )}

                    <div className="mt-1 text-right">
                      <span
                        className={`text-xs ${
                          message.sender === "user"
                            ? "text-orange-200"
                            : "text-gray-400 dark:text-gray-500"
                        }`}>
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Processing indicator */}
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start">
                  <div className="bg-white dark:bg-gray-750 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 flex items-center">
                    <LuLoader className="animate-spin w-5 h-5 mr-2 text-orange-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Processing...
                    </span>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Anchor for scrolling to the latest message */}
            <div ref={chatEndRef} />
          </div>

          {/* Input area for typing and uploading */}
          <div className="border-t border-gray-100 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/80">
            {/* Attachments preview area */}
            {(uploadedFiles.length > 0 || selectedPlan || selectedTask) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-3 flex flex-wrap gap-2">
                {/* Show selected plan if any */}
                {selectedPlan && (
                  <div className="bg-orange-100 dark:bg-orange-900/30 rounded-lg pl-3 pr-1 py-1 flex items-center">
                    <LuList className="w-4 h-4 text-orange-600 dark:text-orange-400 mr-1" />
                    <span className="text-sm text-orange-700 dark:text-orange-300 line-clamp-1 max-w-[200px]">
                      {mockStudyPlans.find((p) => p.id === selectedPlan)?.title}
                    </span>
                    <button
                      onClick={() => setSelectedPlan(null)}
                      className="ml-2 p-1 hover:bg-orange-200 dark:hover:bg-orange-800/20 rounded-full">
                      <LuX className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                    </button>
                  </div>
                )}

                {/* Show selected task if any */}
                {selectedTask && (
                  <div className="bg-orange-100 dark:bg-orange-900/30 rounded-lg pl-3 pr-1 py-1 flex items-center">
                    <LuSquareCheck className="w-4 h-4 text-orange-600 dark:text-orange-400 mr-1" />
                    <span className="text-sm text-orange-700 dark:text-orange-300 line-clamp-1 max-w-[200px]">
                      {mockStudyTasks.find((t) => t.id === selectedTask)?.title}
                    </span>
                    <button
                      onClick={() => setSelectedTask(null)}
                      className="ml-2 p-1 hover:bg-orange-200 dark:hover:bg-orange-800/20 rounded-full">
                      <LuX className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                    </button>
                  </div>
                )}

                {/* Show uploaded files */}
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="bg-gray-100 dark:bg-gray-700 rounded-lg pl-3 pr-1 py-1 flex items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1 max-w-[150px]">
                      {file.name}
                    </span>
                    <button
                      onClick={() => removeFile(index)}
                      className="ml-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full">
                      <LuX className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Text input and buttons */}
            <div className="relative flex items-center">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message or question..."
                className="flex-grow rounded-l-xl rounded-r-none py-3 px-4 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-750 text-gray-800 dark:text-gray-200 resize-none h-[50px]"
                style={{ maxHeight: "150px", minHeight: "50px" }}
              />

              <div className="flex rounded-r-xl bg-white dark:bg-gray-750 border border-l-0 border-gray-200 dark:border-gray-700 pr-3">
                {/* File upload button */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  multiple
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-3 text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors ${
                    isUploading ? "animate-pulse text-orange-500" : ""
                  }`}
                  disabled={isUploading}>
                  {isUploading ? (
                    <LuLoader className="w-6 h-6 animate-spin" />
                  ) : (
                    <LuPaperclip className="w-6 h-6" />
                  )}
                </button>

                {/* Send button */}
                <button
                  onClick={handleSendMessage}
                  className="p-3 text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-r-xl hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50"
                  disabled={
                    (!inputText.trim() &&
                      uploadedFiles.length === 0 &&
                      !selectedPlan &&
                      !selectedTask) ||
                    isProcessing
                  }>
                  <LuSend className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Suggestions panel (conditionally shown) */}
        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "300px" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="ml-4 w-[300px] bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800 dark:text-white">
                  Suggested Actions
                </h3>
                <button
                  onClick={() => setShowSuggestions(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                  <LuX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <div className="space-y-2">
                <Link href="/plan/create">
                  <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <div className="flex items-center mb-1">
                      <div className="w-8 h-8 rounded bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mr-2">
                        <LuPlus className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <h4 className="font-medium text-gray-800 dark:text-white">
                        Create Study Plan
                      </h4>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Generate a study plan based on this conversation
                    </p>
                  </div>
                </Link>

                <Link href="/plan">
                  <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <div className="flex items-center mb-1">
                      <div className="w-8 h-8 rounded bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mr-2">
                        <LuCalendar className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <h4 className="font-medium text-gray-800 dark:text-white">
                        Schedule Study Session
                      </h4>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Add this topic to your study calendar
                    </p>
                  </div>
                </Link>

                <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer">
                  <div className="flex items-center mb-1">
                    <div className="w-8 h-8 rounded bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mr-2">
                      <LuBookOpen className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h4 className="font-medium text-gray-800 dark:text-white">
                      Find Related Materials
                    </h4>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Discover content related to this topic
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Cool Insights Panel Below Chat */}
      <AnimatePresence>
        {showInsightsPanel && (
          <motion.div
            className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 dark:text-white flex items-center">
                <LuChartBar className="mr-2 text-orange-500" />
                Learning Insights
              </h3>

              <button
                onClick={() => setShowInsightsPanel(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <LuChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Topics in conversation */}
              <div className="bg-gray-50 dark:bg-gray-750 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Topics Detected
                </h4>
                <div className="flex flex-wrap gap-2">
                  {detectedTopics.length > 0 ? (
                    detectedTopics.map((topic) => (
                      <span
                        key={topic}
                        className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs rounded-full">
                        {topic}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Ask a question to see related topics
                    </span>
                  )}
                </div>
              </div>

              {/* Learning Progress */}
              <div className="bg-gray-50 dark:bg-gray-750 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Current Focus Areas
                </h4>
                <div className="space-y-2">
                  {relevantFocusAreas.length > 0 ? (
                    relevantFocusAreas.map((area) => (
                      <div key={area.name}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600 dark:text-gray-400">
                            {area.name}
                          </span>
                          <span className="text-orange-600 dark:text-orange-400">
                            {area.progress}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-orange-500"
                            style={{ width: `${area.progress}%` }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Ask a question to see relevant focus areas
                    </span>
                  )}
                </div>
              </div>

              {/* Recommended resources */}
              <div className="bg-gray-50 dark:bg-gray-750 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Recommended Next Steps
                </h4>
                <div className="space-y-2">
                  {recommendedSteps.map((step, index) => (
                    <div
                      key={index}
                      className="flex items-center text-xs text-gray-700 dark:text-gray-300">
                      <div
                        className={`w-6 h-6 rounded bg-${step.color}-100 dark:bg-${step.color}-900/30 flex items-center justify-center mr-2 text-${step.color}-600 dark:text-${step.color}-400`}>
                        {step.icon === "check" && (
                          <LuSquareCheck className="w-3 h-3" />
                        )}
                        {step.icon === "book" && (
                          <LuBookOpen className="w-3 h-3" />
                        )}
                        {step.icon === "calendar" && (
                          <LuCalendar className="w-3 h-3" />
                        )}
                      </div>
                      <span>{step.text}</span>
                    </div>
                  ))}
                  {recommendedSteps.length === 0 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Ask a question to see recommendations
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-center">
              <button className="px-4 py-2 text-sm text-orange-600 dark:text-orange-400 hover:underline flex items-center">
                View full learning analytics
                <LuArrowRight className="ml-1 w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
