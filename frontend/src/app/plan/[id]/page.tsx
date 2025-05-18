"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  LuCalendar,
  LuClock,
  LuBookOpen,
  LuCheck,
  LuChartBar,
  LuDownload,
  LuExternalLink,
  LuArrowLeft,
  LuFileText,
  LuHeadphones,
  LuChartBarBig,
  LuVideo,
  LuX,
} from "react-icons/lu";
import Link from "next/link";
import VideoGenerator from "../../../components/videoGenerator";
import { marked } from "marked";
import { useAllData } from "../../../hooks/useAllData";

// Content format type
type ContentFormat = "text" | "audio" | "infographic" | "video";

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
      type: "pdf" | "link";
      url: string;
    }>;
  };
  sessions: StudySession[];
}

interface ContentPart {
  id: string;
  text: string;
  imageUrl: string | null;
  imageGenerating: boolean;
  videoUrl: string | null;
  videoGenerating: boolean;
}

export default function StudyPlanDetail() {
  const params = useParams();
  const id = params.id as string;
  const { data, loading, error } = useAllData();
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [activeFormat, setActiveFormat] = useState<ContentFormat>("text");
  const [aiContent, setAiContent] = useState<string | null>(null);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [splitContent, setSplitContent] = useState<ContentPart[]>([]);

  const splitTextContent = (content: string): string[] => {
    // Split by headers (# or ## or ###)
    const parts = content
      .split(/(?=^#{1,3}\s)/m)
      .filter((part) => part.trim().length > 0);
    return parts.length > 0 ? parts : [content];
  };

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Extract study plan data from API response
  useEffect(() => {
    if (!loading && data && id) {
      // Find the plan with matching ID
      const plan = data.plans.find((p) => p.id.toString() === id);

      if (plan) {
        // Find tasks related to this plan
        const planTasks = data.tasks.filter(
          (task) => task.plan_id.toString() === id
        );

        // Calculate progress
        const totalTasks = planTasks.length;
        const completedTasks = planTasks.filter(
          (task) => task.status === "completed"
        ).length;
        const progress =
          totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // Transform tasks to sessions format
        const sessions = planTasks.map((task) => ({
          id: task.id.toString(),
          title: task.title,
          duration: task.duration || 60,
          date: task.start_date
            ? `${task.start_date}T${task.start_time || "09:00:00"}`
            : new Date().toISOString(),
          completed: task.status === "completed",
          topics: task.tags
            ? task.tags.split(",").map((tag) => tag.trim())
            : ["JavaScript"],
        }));

        // Create resources array
        const resources = [
          {
            id: `resource-${plan.id}-1`,
            title: `${plan.name} Documentation`,
            type: "link" as "pdf" | "link",
            url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
          },
          {
            id: `resource-${plan.id}-2`,
            title: `${plan.name} Study Guide`,
            type: "pdf" as "pdf" | "link",
            url: "#",
          },
        ];

        // Create the study plan object
        const formattedPlan: StudyPlan = {
          id: plan.id.toString(),
          title: plan.name,
          description:
            plan.description ||
            `Master advanced ${plan.name} concepts and techniques`,
          progress,
          totalSessions: totalTasks,
          completedSessions: completedTasks,
          createdAt: plan.created_at || new Date().toISOString(),
          content: {
            overview:
              plan.description ||
              `This study plan covers advanced ${plan.name} concepts that are essential for modern development. You'll learn how ${plan.name} works under the hood, advanced patterns, and best practices.`,
            resources,
          },
          sessions,
        };

        setStudyPlan(formattedPlan);
      } else {
        // If the plan ID is 0 (special case for demo), use mock data
        if (id === "0") {
          setStudyPlan(mockStudyPlan);
        }
      }
    }
  }, [loading, data, id]);

  const generateAIContent = async (format: ContentFormat) => {
    if (!studyPlan) return;

    setGeneratingContent(true);
    setSplitContent([]); // Reset split content

    try {
      // In a real implementation, this would be an API call to an AI service
      // For now, we'll simulate the response with a timeout
      setTimeout(() => {
        const contents = {
          text: `# ${studyPlan.title} - Text Summary\n\n## Key Concepts\n${
            studyPlan.content.overview
          }\n\n## Important Points\n${studyPlan.sessions
            .slice(0, 3)
            .map((s) => `- **${s.title}**: ${s.topics.join(", ")}`)
            .join(
              "\n"
            )}\n\n## Learning Objectives\n1. Understand the fundamentals of ${
            studyPlan.sessions[0]?.topics[0] || "this subject"
          }\n2. Apply ${
            studyPlan.sessions[1]?.topics[0] || "key concepts"
          } in practical scenarios\n3. Compare and contrast ${
            studyPlan.sessions[2]?.topics?.join(" and ") ||
            "different approaches"
          }`,

          audio: `# ${
            studyPlan.title
          } - Audio Transcript\n\n## Introduction (00:00 - 01:30)\nWelcome to this audio guide on ${
            studyPlan.title
          }. In this session, we'll explore ${
            studyPlan.content.overview.split(".")[0]
          }.\n\n## Main Concepts (01:30 - 15:45)\n${studyPlan.sessions
            .slice(0, 3)
            .map(
              (s, i) =>
                `### Part ${i + 1}: ${
                  s.title
                }\n- Key discussion on ${s.topics.join("\n- Analysis of ")}`
            )
            .join(
              "\n\n"
            )}\n\n## Conclusion (15:45 - 20:00)\nTo summarize what we've learned about ${
            studyPlan.title
          }, remember these key points: ${
            studyPlan.sessions[0]?.topics[0] || "first concept"
          } forms the foundation, while ${
            studyPlan.sessions[1]?.topics[0] || "second concept"
          } and ${
            studyPlan.sessions[2]?.topics[0] || "third concept"
          } build upon it.`,

          infographic: `# ${
            studyPlan.title
          } - Visual Guide\n\n## Central Concepts\nThis is a visual representation of ${
            studyPlan.title
          } key concepts.\n\n## Topic Relationships\nExplore how ${
            studyPlan.sessions[0]?.topics[0] || "first topic"
          } connects with ${
            studyPlan.sessions[1]?.topics[0] || "second topic"
          }.\n\n## Learning Pathways\nFollow the recommended learning sequence for mastering these advanced topics.`,

          video: `# ${studyPlan.title} - Video Content\n\n## Introduction to ${
            studyPlan.title
          }\nThis video provides an overview of the core concepts.\n\n## Deep Dive: ${
            studyPlan.sessions[0]?.title || "Key Concepts"
          }\nExplore the intricacies of ${
            studyPlan.sessions[0]?.topics.join(" and ") || "the subject matter"
          }.\n\n## Advanced Applications\nLearn how to apply ${
            studyPlan.sessions[1]?.topics[0] || "these concepts"
          } in real-world scenarios.`,
        };

        const rawContent = contents[format];
        setAiContent(rawContent);

        // Split content into parts except for audio format
        if (format !== "audio") {
          const parts = splitTextContent(rawContent);

          // Create content parts with unique IDs
          const contentParts: ContentPart[] = parts.map((text, index) => ({
            id: `part-${Date.now()}-${index}`,
            text,
            imageUrl: null,
            imageGenerating: false,
            videoUrl: null,
            videoGenerating: false,
          }));

          setSplitContent(contentParts);
        }

        setGeneratingContent(false);
      }, 1500);
    } catch (error) {
      console.error("Failed to generate AI content:", error);
      setGeneratingContent(false);
      setAiContent("Failed to generate content. Please try again.");
    }
  };

  // Function to generate an image for a specific content part
  const generateImageForPart = async (partId: string) => {
    try {
      // Find the part in the state
      const partIndex = splitContent.findIndex((part) => part.id === partId);
      if (partIndex === -1) return;

      const part = splitContent[partIndex];

      // Update state to show loading
      setSplitContent((prev) => {
        const updated = [...prev];
        updated[partIndex] = { ...updated[partIndex], imageGenerating: true };
        return updated;
      });

      // Extract prompt from the content part
      const headerMatch = part.text.match(/^#+ (.+)$/m);
      const prompt = headerMatch
        ? headerMatch[1]
        : part.text.split("\n")[0].substring(0, 100);

      // Create form data for image generation
      const formData = new FormData();
      formData.append("prompt", `Educational illustration about: ${prompt}`);
      formData.append("guidance_scale", "7.5");
      formData.append("num_inference_steps", "4");

      // Call the image generation API
      const response = await fetch("/api/gen/img", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      // Get the generated image as a blob and create URL
      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);

      // Update the content part with the generated image
      setSplitContent((prev) => {
        const updated = [...prev];
        updated[partIndex] = {
          ...updated[partIndex],
          imageUrl,
          imageGenerating: false,
        };
        return updated;
      });
    } catch (error) {
      console.error("Error generating image:", error);

      // Update state to show error
      setSplitContent((prev) => {
        const partIndex = prev.findIndex((p) => p.id === partId);
        if (partIndex === -1) return prev;

        const updated = [...prev];
        updated[partIndex] = {
          ...updated[partIndex],
          imageGenerating: false,
        };
        return updated;
      });
    }
  };

  // Render function for split content sections
  const renderContentPart = (part: ContentPart, index: number) => {
    return (
      <div
        key={part.id}
        className="border-b border-gray-100 dark:border-gray-700 pb-6 last:border-b-0 mb-6 last:mb-0">
        {/* Text content - always shown for all formats */}
        <div className="prose dark:prose-invert prose-orange max-w-none mb-4">
          <div dangerouslySetInnerHTML={{ __html: marked(part.text) }} />
        </div>

        {/* Media section - conditionally shown based on format */}
        {activeFormat !== "text" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {/* Image section - only shown for infographic format */}
            {activeFormat === "infographic" && (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Visual Illustration
                </h4>

                {part.imageGenerating ? (
                  <div className="flex flex-col items-center justify-center h-40 bg-gray-100 dark:bg-gray-700/30 rounded-lg">
                    <div className="w-8 h-8 relative">
                      <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-t-orange-500 animate-spin"></div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Generating image...
                    </p>
                  </div>
                ) : part.imageUrl ? (
                  <img
                    src={part.imageUrl}
                    alt={`Illustration for ${part.text.split("\n")[0]}`}
                    className="w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 bg-gray-100 dark:bg-gray-700/30 rounded-lg">
                    <button
                      onClick={() => generateImageForPart(part.id)}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center">
                      <LuChartBarBig className="mr-2" />
                      Generate Visual
                    </button>
                    <p className="mt-2 text-xs text-gray-500">
                      Create an AI illustration for this section
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Video section - only shown for video format */}
            {activeFormat === "video" && (
              <div className="col-span-1 md:col-span-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Video Content
                </h4>

                <VideoGenerator
                  prompt={`Create a short educational video explaining: ${part.text
                    .split("\n")[0]
                    .replace(/^#+ /, "")} for ${studyPlan?.title}`}
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Update the generateAudioFromText function
  const generateAudioFromText = async (text: string) => {
    try {
      setIsGeneratingAudio(true);
      setAudioError(null);

      const response = await fetch("/api/nlp/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      // Check if the response is JSON (error) or binary (audio)
      const contentType = response.headers.get("content-type");

      if (!response.ok) {
        if (contentType?.includes("application/json")) {
          // It's an error response in JSON format
          const errorData = await response.json();
          throw new Error(
            errorData.error || errorData.details || "Failed to generate audio"
          );
        } else {
          throw new Error("Failed to generate audio");
        }
      }

      if (contentType?.includes("application/json")) {
        // It's an error response in JSON format despite 200 status
        const errorData = await response.json();
        throw new Error(
          errorData.error || errorData.details || "Failed to generate audio"
        );
      }

      // It's audio data
      const audioData = await response.arrayBuffer();
      const blob = new Blob([audioData], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);

      setAudioUrl(url);
      setIsGeneratingAudio(false);
    } catch (error) {
      console.error("Error generating audio:", error);
      setAudioError(
        error instanceof Error
          ? error.message
          : "Failed to generate audio. Please try again."
      );
      setIsGeneratingAudio(false);
    }
  };

  // Function to handle content format change
  const changeContentFormat = async (format: ContentFormat) => {
    setActiveFormat(format);

    // Reset audio URL when changing formats
    setAudioUrl(null);

    if (format === "audio") {
      // For audio format, first generate the text content
      await generateAIContent("text");
      // And then use that to generate the audio
      if (aiContent) {
        await generateAudioFromText(aiContent);
      }
    } else {
      await generateAIContent(format);
    }
  };

  // Updated to work with actual data
  const toggleSessionCompletion = async (sessionId: string) => {
    if (!studyPlan || !data) return;

    try {
      // Find the task in the API data
      const taskIndex = data.tasks.findIndex(
        (task) => task.id.toString() === sessionId
      );

      if (taskIndex === -1) {
        console.error(`Task with ID ${sessionId} not found`);
        return;
      }

      // Update the session in the studyPlan state
      const updatedSessions = studyPlan.sessions.map((session) =>
        session.id === sessionId
          ? { ...session, completed: !session.completed }
          : session
      );

      // Calculate new progress
      const completedCount = updatedSessions.filter((s) => s.completed).length;
      const newProgress = Math.round(
        (completedCount / studyPlan.totalSessions) * 100
      );

      // Update the study plan state
      setStudyPlan({
        ...studyPlan,
        sessions: updatedSessions,
        completedSessions: completedCount,
        progress: newProgress,
      });

      // In a real implementation, we would make an API call to update the task status
      // Example: await updateTaskStatus(sessionId, newStatus);

      // For now, just log the change
      console.log(
        `Task ${sessionId} status updated to ${!data.tasks[taskIndex].status}`
      );
    } catch (error) {
      console.error("Error toggling session completion:", error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-800"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-orange-500 animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Loading study plan...
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
          <LuX className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200">
          Error Loading Study Plan
        </h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400 text-center max-w-md">
          {error}
        </p>
        <Link
          href="/plan"
          className="mt-6 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center">
          <LuArrowLeft className="mr-2" /> Back to Study Plans
        </Link>
      </div>
    );
  }

  // No study plan found
  if (!studyPlan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <LuBookOpen className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200">
          Study Plan Not Found
        </h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400 text-center max-w-md">
          We couldn&apos;t find the study plan you&apos;re looking for. It may
          have been deleted or doesn&apos;t exist.
        </p>
        <Link
          href="/plan"
          className="mt-6 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center">
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
        transition={{ duration: 0.5 }}>
        <Link
          href="/plan"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 mb-4">
          <LuArrowLeft className="mr-2" /> Back to Study Plans
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            {studyPlan.title}
          </h1>
          <div className="mt-2 md:mt-0 bg-orange-100 dark:bg-orange-900/30 px-3 py-1 rounded-full text-orange-600 dark:text-orange-400 text-sm font-medium">
            {studyPlan.completedSessions}/{studyPlan.totalSessions} Sessions
            Completed
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
        transition={{ duration: 0.5, delay: 0.2 }}>
        <ProgressTracker progress={studyPlan.progress} />
      </motion.div>

      {/* Content Format Selector */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}>
        <ContentFormatSelector
          activeFormat={activeFormat}
          onFormatChange={changeContentFormat}
        />
      </motion.div>

      {/* AI-generated Content Section */}
      {(activeFormat === "audio"
        ? audioUrl || isGeneratingAudio
        : splitContent.length > 0 || generatingContent) && (
        <motion.div
          className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
            {activeFormat === "text" && <LuFileText className="mr-2" />}
            {activeFormat === "audio" && <LuHeadphones className="mr-2" />}
            {activeFormat === "infographic" && (
              <LuChartBarBig className="mr-2" />
            )}
            {activeFormat === "video" && <LuVideo className="mr-2" />}
            {activeFormat.charAt(0).toUpperCase() + activeFormat.slice(1)}{" "}
            Content
          </h2>

          {/* Loading state */}
          {(generatingContent || isGeneratingAudio) && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 relative">
                <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-orange-500 animate-spin"></div>
              </div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Generating {activeFormat} content...
              </p>
            </div>
          )}

          {/* Audio player */}
          {activeFormat === "audio" && audioUrl && !isGeneratingAudio && (
            <div className="w-full max-w-2xl mx-auto my-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
                  Audio Summary for {studyPlan.title}
                </h3>
                <audio controls className="w-full" src={audioUrl}>
                  Your browser does not support the audio element.
                </audio>
              </div>

              {audioError && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
                  {audioError}
                </div>
              )}
            </div>
          )}

          {/* Rendered content parts for other formats */}
          {activeFormat !== "audio" && !generatingContent && (
            <div className="space-y-8">
              {splitContent.map((part, index) =>
                renderContentPart(part, index)
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Two column layout for content and calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}>
          <ContentPreview content={studyPlan.content} />

          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Study Sessions
            </h2>
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
          transition={{ duration: 0.5, delay: 0.4 }}>
          <CalendarWidget sessions={studyPlan.sessions} />
        </motion.div>
      </div>
    </div>
  );
}

// Content format configurations
const contentFormats: FormatConfig[] = [
  {
    id: "text",
    title: "Text",
    icon: <LuFileText className="h-5 w-5" />,
    description: "Written study materials",
    color: "bg-blue-500",
  },
  {
    id: "audio",
    title: "Audio",
    icon: <LuHeadphones className="h-5 w-5" />,
    description: "Audio learning content",
    color: "bg-green-500",
  },
  {
    id: "infographic",
    title: "Infographic",
    icon: <LuChartBarBig className="h-5 w-5" />,
    description: "Visual learning aids",
    color: "bg-purple-500",
  },
  {
    id: "video",
    title: "Video",
    icon: <LuVideo className="h-5 w-5" />,
    description: "Video-based tutorials",
    color: "bg-red-500",
  },
];

// Content Format Selector Component
const ContentFormatSelector = ({
  activeFormat,
  onFormatChange,
}: {
  activeFormat: ContentFormat;
  onFormatChange: (format: ContentFormat) => void;
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
        Content Format
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-5">
        Choose your preferred learning format to get AI-generated content
        tailored to your learning style.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {contentFormats.map((format) => (
          <motion.button
            key={format.id}
            className={`flex flex-col items-center p-4 rounded-lg border ${
              activeFormat === format.id
                ? `border-${format.color.split("-")[1]}-500 bg-${
                    format.color.split("-")[1]
                  }-50 dark:bg-${format.color.split("-")[1]}-900/20`
                : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onFormatChange(format.id)}>
            <div
              className={`w-12 h-12 rounded-full ${format.color} bg-opacity-20 dark:bg-opacity-30 flex items-center justify-center mb-3`}>
              {format.icon}
            </div>
            <h3 className="font-medium text-gray-800 dark:text-white">
              {format.title}
            </h3>
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
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Overall Progress
        </h2>
        <span className="text-lg font-bold text-orange-500">
          {roundedProgress}%
        </span>
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
        <span>
          Keep going! You&apos;re making great progress on your study plan.
        </span>
      </div>
    </div>
  );
};

const ContentPreview = ({ content }: { content: StudyPlan["content"] }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
        Overview
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        {content.overview}
      </p>

      {content.resources.length > 0 && (
        <>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
            Study Resources
          </h3>
          <div className="space-y-3">
            {content.resources.map((resource) => (
              <motion.div
                key={resource.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700"
                whileHover={{ scale: 1.01, backgroundColor: "#f8fafc" }}>
                <div className="flex items-center">
                  {resource.type === "pdf" ? (
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mr-3">
                      <LuDownload className="text-red-500 dark:text-red-400" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3">
                      <LuExternalLink className="text-blue-500 dark:text-blue-400" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-gray-200">
                      {resource.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {resource.type === "pdf"
                        ? "PDF Document"
                        : "External Link"}
                    </p>
                  </div>
                </div>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-300">
                  {resource.type === "pdf" ? "Download" : "Open"}
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

  sessions.forEach((session) => {
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
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
        Study Schedule
      </h2>

      {dates.length > 0 ? (
        <div className="space-y-4">
          {dates.map((dateKey) => (
            <div
              key={dateKey}
              className="border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <LuCalendar className="text-orange-500 dark:text-orange-400" />
                </div>
                <h3 className="ml-3 font-medium text-gray-800 dark:text-gray-200">
                  {new Date(dateKey).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </h3>
              </div>

              <div className="ml-13 pl-10 space-y-2">
                {sessionsByDate[dateKey].map((session) => (
                  <div
                    key={session.id}
                    className={`px-3 py-2 rounded-lg ${
                      session.completed
                        ? "bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500"
                        : "bg-gray-50 dark:bg-gray-700/50"
                    }`}>
                    <p
                      className={`font-medium ${
                        session.completed
                          ? "text-green-700 dark:text-green-400"
                          : "text-gray-700 dark:text-gray-300"
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
          <p className="text-gray-500 dark:text-gray-400">
            No scheduled sessions found.
          </p>
        </div>
      )}
    </div>
  );
};

const StudySessionCard = ({
  session,
  onToggleComplete,
}: {
  session: StudySession;
  onToggleComplete: () => void;
}) => {
  return (
    <motion.div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border ${
        session.completed
          ? "border-green-200 dark:border-green-900/30"
          : "border-gray-100 dark:border-gray-700"
      }`}
      whileHover={{ y: -4, boxShadow: "0 12px 20px rgba(0,0,0,0.1)" }}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-gray-800 dark:text-white text-lg">
            {session.title}
          </h3>
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
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
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
              ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
              : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
          }`}>
          <LuCheck className="w-5 h-5" />
        </motion.button>
      </div>

      <div
        className={`mt-4 pt-4 border-t ${
          session.completed
            ? "border-green-100 dark:border-green-900/20"
            : "border-gray-100 dark:border-gray-700"
        }`}>
        <button className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 text-sm font-medium">
          View Session Details
        </button>
      </div>
    </motion.div>
  );
};

// Keep the mock study plan for JavaScript (ID 0)
const mockStudyPlan: StudyPlan = {
  id: "0",
  title: "Advanced JavaScript Concepts",
  description:
    "Master advanced JavaScript concepts including closures, prototypes, async patterns, and modern ES6+ features.",
  progress: 35,
  totalSessions: 8,
  completedSessions: 3,
  createdAt: "2025-05-10T12:00:00Z",
  content: {
    overview:
      "This study plan covers advanced JavaScript concepts that are essential for modern web development. You'll learn how JavaScript works under the hood, advanced patterns, and best practices for writing clean, efficient code.",
    resources: [
      {
        id: "r1",
        title: "JavaScript: The Good Parts",
        type: "pdf",
        url: "#",
      },
      {
        id: "r2",
        title: "MDN JavaScript Documentation",
        type: "link",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
      },
      {
        id: "r3",
        title: "Advanced JavaScript Patterns",
        type: "pdf",
        url: "#",
      },
    ],
  },
  sessions: [
    {
      id: "s1",
      title: "Closures and Scope",
      duration: 60,
      date: "2025-05-12T10:00:00Z",
      completed: true,
      topics: ["Closures", "Lexical Scope", "Execution Context"],
    },
    {
      id: "s2",
      title: "Prototype Chain and Inheritance",
      duration: 90,
      date: "2025-05-14T14:00:00Z",
      completed: true,
      topics: ["Prototypes", "Inheritance", "Object Creation"],
    },
    {
      id: "s3",
      title: "Async JavaScript",
      duration: 120,
      date: "2025-05-16T09:00:00Z",
      completed: true,
      topics: ["Promises", "Async/Await", "Event Loop"],
    },
    {
      id: "s4",
      title: "Functional Programming Concepts",
      duration: 90,
      date: "2025-05-18T11:00:00Z",
      completed: false,
      topics: ["Pure Functions", "Immutability", "Higher Order Functions"],
    },
    {
      id: "s5",
      title: "ES6+ Features Deep Dive",
      duration: 75,
      date: "2025-05-20T13:00:00Z",
      completed: false,
      topics: ["Destructuring", "Spread Operator", "Modules"],
    },
    {
      id: "s6",
      title: "JavaScript Design Patterns",
      duration: 120,
      date: "2025-05-22T10:00:00Z",
      completed: false,
      topics: ["Singleton", "Factory", "Observer", "Module"],
    },
    {
      id: "s7",
      title: "Performance Optimization",
      duration: 90,
      date: "2025-05-24T09:00:00Z",
      completed: false,
      topics: ["Memory Management", "Efficient DOM", "Debouncing"],
    },
    {
      id: "s8",
      title: "Testing JavaScript Applications",
      duration: 120,
      date: "2025-05-26T14:00:00Z",
      completed: false,
      topics: ["Jest", "Testing React", "TDD Principles"],
    },
  ],
};
