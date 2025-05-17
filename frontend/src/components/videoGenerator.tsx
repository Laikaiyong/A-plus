'use client';

import React, { useState, useEffect } from 'react';

const VideoGenerator = ({ prompt }: { prompt: string }) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Function to start video generation
  const generateVideo = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      setVideoUrl(null);
      
      const response = await fetch('/api/gen/video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || 'Failed to start video generation');
      }
      
      const data = await response.json();
      setTaskId(data.taskId);
      setStatus('processing');
      
      // Start polling for status
      checkStatus(data.taskId);
      
    } catch (error) {
      console.error('Error generating video:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate video');
      setIsGenerating(false);
    }
  };

  // Function to check generation status
  const checkStatus = async (id: string) => {
    try {
      const response = await fetch(`/api/gen/video/status?taskId=${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check video status');
      }
      
      const data = await response.json();
      setStatus(data.output?.status);
      
      if (data.output?.task_status === 'SUCCEEDED') {
        // Video is ready
        setVideoUrl(data.output.video_url);
        setIsGenerating(false);
      } else if (data.output?.task_status === 'FAILED') {
        // Video generation failed
        setError('Video generation failed: ' + (data.output?.message || 'Unknown error'));
        setIsGenerating(false);
      } else {
        // Still processing, check again after a delay
        setTimeout(() => checkStatus(id), 5000); // Poll every 5 seconds
      }
      
    } catch (error) {
      console.error('Error checking video status:', error);
      setError(error instanceof Error ? error.message : 'Failed to check video status');
      setIsGenerating(false);
    }
  };

  return (
    <div className="mt-4">
      <button 
        onClick={generateVideo}
        disabled={isGenerating} 
        className={`flex items-center px-4 py-2 rounded-lg ${
          isGenerating ? 'bg-gray-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 text-white'
        }`}
      >
        {isGenerating ? 'Generating Video...' : 'Generate Video'}
      </button>
      
      {error && (
        <div className="mt-3 text-red-500">{error}</div>
      )}
      
      {status && status !== 'SUCCEEDED' && !error && (
        <div className="mt-3 text-blue-500">
          Video status: {status}
        </div>
      )}
      
      {videoUrl && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Generated Video:</h3>
          <video 
            controls
            className="w-full rounded-lg" 
            src={videoUrl}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
};

export default VideoGenerator;