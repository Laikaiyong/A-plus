'use client';

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  LuBookOpen, LuCalendar, LuClock, LuUpload, LuTrash, 
  LuLink, LuPlus, LuCheck, LuArrowLeft, LuX
} from 'react-icons/lu';

type StudyResource = {
  id: string;
  title: string;
  type: 'pdf' | 'link';
  url: string;
  file?: File;
};

type StudySession = {
  id: string;
  title: string;
  date: string;
  duration: number;
  topics: string[];
};

export default function CreateStudyPlan() {
  // Plan basic info
  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  
  // Resources
  const [resources, setResources] = useState<StudyResource[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Sessions
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [isAddingSession, setIsAddingSession] = useState(false);
  const [newSession, setNewSession] = useState<Partial<StudySession>>({
    title: '',
    date: '',
    duration: 60,
    topics: []
  });
  const [newTopic, setNewTopic] = useState('');

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (file.type !== 'application/pdf') {
        alert('Please upload a PDF file');
        return;
      }
      
      const newResource: StudyResource = {
        id: `pdf-${Date.now()}`,
        title: file.name.replace('.pdf', ''),
        type: 'pdf',
        url: URL.createObjectURL(file),
        file: file
      };
      
      setResources([...resources, newResource]);
    }
  };
  
  // Add link resource
  const [newLink, setNewLink] = useState({ title: '', url: '' });
  
  const addLinkResource = () => {
    if (!newLink.title.trim() || !newLink.url.trim()) return;
    
    // Basic URL validation
    let url = newLink.url;
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    
    const newResource: StudyResource = {
      id: `link-${Date.now()}`,
      title: newLink.title,
      type: 'link',
      url: url
    };
    
    setResources([...resources, newResource]);
    setNewLink({ title: '', url: '' });
  };
  
  // Remove resource
  const removeResource = (id: string) => {
    setResources(resources.filter(resource => resource.id !== id));
  };
  
  // Add study session
  const addSession = () => {
    if (!newSession.title || !newSession.date) return;
    
    const session: StudySession = {
      id: `session-${Date.now()}`,
      title: newSession.title!,
      date: newSession.date!,
      duration: newSession.duration || 60,
      topics: newSession.topics || []
    };
    
    setSessions([...sessions, session]);
    setIsAddingSession(false);
    setNewSession({
      title: '',
      date: '',
      duration: 60,
      topics: []
    });
  };
  
  // Remove session
  const removeSession = (id: string) => {
    setSessions(sessions.filter(session => session.id !== id));
  };
  
  // Add topic to new session
  const addTopic = () => {
    if (!newTopic.trim()) return;
    
    setNewSession({
      ...newSession,
      topics: [...(newSession.topics || []), newTopic]
    });
    
    setNewTopic('');
  };
  
  // Remove topic from new session
  const removeTopic = (index: number) => {
    setNewSession({
      ...newSession,
      topics: (newSession.topics || []).filter((_, i) => i !== index)
    });
  };
  
  // Handle form submission
  const handleCreatePlan = () => {
    // Basic validation
    if (!planName.trim()) {
      alert('Please enter a study plan name');
      return;
    }
    
    // Logic to create a new study plan
    console.log("Creating study plan:", {
      name: planName,
      description: planDescription,
      resources,
      sessions
    });
    
    // In a real app, you would submit this to your backend
    alert('Study plan created successfully!');
    
    // Redirect to plans page
    // router.push('/plan');
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <motion.div 
        className="mb-8"
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
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Create Study Plan</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Design your personalized study plan with resources and sessions
        </p>
      </motion.div>
      
      {/* Progress steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((step) => (
            <div 
              key={step} 
              className="flex-1 flex flex-col items-center"
              onClick={() => step <= Math.max(1, currentStep) && setCurrentStep(step)}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                step === currentStep 
                  ? 'bg-orange-500 text-white' 
                  : step < currentStep 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {step < currentStep ? (
                  <LuCheck className="w-5 h-5" />
                ) : (
                  <span>{step}</span>
                )}
              </div>
              <span className={`text-sm font-medium ${
                step === currentStep 
                  ? 'text-orange-600 dark:text-orange-400' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                {step === 1 ? 'Basic Info' : step === 2 ? 'Resources' : 'Sessions'}
              </span>
            </div>
          ))}
          
          <div className="w-full absolute left-0 right-0 flex items-center justify-center z-[-1]">
            <div className="w-4/5 h-1 bg-gray-200 dark:bg-gray-700">
              <div 
                className="h-full bg-orange-500"
                style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Step content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6 mb-8">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Plan Information</h2>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="planName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Study Plan Name*
                  </label>
                  <input
                    id="planName"
                    type="text"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    placeholder="e.g., Advanced JavaScript Concepts"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="planDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    id="planDescription"
                    value={planDescription}
                    onChange={(e) => setPlanDescription(e.target.value)}
                    placeholder="Describe what this study plan is about..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                  />
                </div>
                
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <LuBookOpen className="w-5 h-5 mr-2 text-orange-500" />
                  Creating a detailed study plan can help you stay organized and track your progress more effectively.
                </div>
              </div>
            </motion.div>
          )}
          
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Study Resources</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* PDF Upload */}
                <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-3">
                    <LuUpload className="w-7 h-7 text-orange-500 dark:text-orange-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Upload PDF</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Upload PDF files for study materials (max 10MB)
                  </p>
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="application/pdf"
                    className="hidden"
                    id="pdfUpload"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/50 text-orange-600 dark:text-orange-400 rounded-lg font-medium transition"
                  >
                    Select PDF
                  </button>
                </div>
                
                {/* Link Resource */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">Add External Link</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="linkTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Title
                      </label>
                      <input
                        id="linkTitle"
                        type="text"
                        value={newLink.title}
                        onChange={(e) => setNewLink({...newLink, title: e.target.value})}
                        placeholder="e.g., MDN JavaScript Documentation"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="linkUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        URL
                      </label>
                      <input
                        id="linkUrl"
                        type="text"
                        value={newLink.url}
                        onChange={(e) => setNewLink({...newLink, url: e.target.value})}
                        placeholder="e.g., https://developer.mozilla.org"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                      />
                    </div>
                    
                    <div>
                      <button
                        onClick={addLinkResource}
                        disabled={!newLink.title || !newLink.url}
                        className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add Link
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Added resources */}
              {resources.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">Added Resources ({resources.length})</h3>
                  
                  <div className="space-y-3">
                    {resources.map((resource) => (
                      <div 
                        key={resource.id} 
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700"
                      >
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                            resource.type === 'pdf' 
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400' 
                              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400'
                          }`}>
                            {resource.type === 'pdf' ? <LuUpload /> : <LuLink />}
                          </div>
                          <div className="mr-4">
                            <h4 className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[200px]">{resource.title}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {resource.type === 'pdf' ? 'PDF Document' : 'External Link'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeResource(resource.id)}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
                          aria-label="Remove resource"
                        >
                          <LuTrash className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
          
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Study Sessions</h2>
                <button
                  onClick={() => setIsAddingSession(true)}
                  className="flex items-center px-4 py-2 bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/50 text-orange-600 dark:text-orange-400 rounded-lg font-medium"
                >
                  <LuPlus className="mr-1" /> Add Session
                </button>
              </div>
              
              {/* Session list */}
              {sessions.length === 0 && !isAddingSession && (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                  <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                    <LuCalendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No Sessions Added</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                    Create study sessions to organize your learning schedule and track progress
                  </p>
                  <button
                    onClick={() => setIsAddingSession(true)}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium"
                  >
                    Create First Session
                  </button>
                </div>
              )}
              
              {sessions.length > 0 && !isAddingSession && (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div 
                      key={session.id}
                      className="bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700 p-4"
                    >
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">{session.title}</h3>
                          <div className="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center mr-4">
                              <LuCalendar className="w-4 h-4 mr-1" />
                              <span>{new Date(session.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center">
                              <LuClock className="w-4 h-4 mr-1" />
                              <span>{session.duration} minutes</span>
                            </div>
                          </div>
                          
                          {session.topics.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {session.topics.map((topic, index) => (
                                <span 
                                  key={index}
                                  className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-xs"
                                >
                                  {topic}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={() => removeSession(session.id)}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full h-fit"
                          aria-label="Remove session"
                        >
                          <LuTrash className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Add session form */}
              {isAddingSession && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Add New Session</h3>
                    <button
                      onClick={() => setIsAddingSession(false)}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
                    >
                      <LuX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="sessionTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Session Title*
                      </label>
                      <input
                        id="sessionTitle"
                        type="text"
                        value={newSession.title}
                        onChange={(e) => setNewSession({...newSession, title: e.target.value})}
                        placeholder="e.g., JavaScript Closures"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="sessionDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Date*
                        </label>
                        <input
                          id="sessionDate"
                          type="date"
                          value={newSession.date}
                          onChange={(e) => setNewSession({...newSession, date: e.target.value})}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="sessionDuration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Duration (minutes)
                        </label>
                        <input
                          id="sessionDuration"
                          type="number"
                          min="15"
                          step="15"
                          value={newSession.duration}
                          onChange={(e) => setNewSession({...newSession, duration: parseInt(e.target.value) || 60})}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Topics
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          value={newTopic}
                          onChange={(e) => setNewTopic(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addTopic()}
                          placeholder="Add topic and press Enter"
                          className="flex-grow px-3 py-2 rounded-l-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <button
                          onClick={addTopic}
                          className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-r-lg border-t border-r border-b border-gray-200 dark:border-gray-700"
                        >
                          Add
                        </button>
                      </div>
                      
                      {(newSession.topics?.length || 0) > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {newSession.topics?.map((topic, index) => (
                            <span 
                              key={index}
                              className="inline-flex items-center px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-xs"
                            >
                              {topic}
                              <button
                                onClick={() => removeTopic(index)}
                                className="ml-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                              >
                                <LuX className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={() => setIsAddingSession(false)}
                        className="px-4 py-2 mr-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={addSession}
                        disabled={!newSession.title || !newSession.date}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add Session
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Navigation buttons */}
      <div className="flex justify-between mt-8">
        {currentStep > 1 ? (
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            className="px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium flex items-center"
          >
            <LuArrowLeft className="mr-2" /> Previous
          </button>
        ) : (
          <div></div>
        )}
        
        {currentStep < 3 ? (
          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-medium flex items-center shadow-md shadow-orange-200 dark:shadow-orange-900/20"
          >
            Next Step
          </button>
        ) : (
          <button
            onClick={handleCreatePlan}
            disabled={!planName.trim()}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-medium flex items-center shadow-md shadow-orange-200 dark:shadow-orange-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Study Plan
          </button>
        )}
      </div>
    </div>
  );
}