'use client';

import React from 'react';

interface ProgressWheelProps {
  progress: number; // Progress value between 0 and 100
  size?: number; // Size of the wheel
  strokeWidth?: number; // Width of the stroke
}

const ProgressWheel: React.FC<ProgressWheelProps> = ({
  progress,
  size = 100,
  strokeWidth = 10,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size}>
      <circle
        stroke="#e6e6e6"
        fill="transparent"
        strokeWidth={strokeWidth}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        stroke="#FF6900" // Primary accent color
        fill="transparent"
        strokeWidth={strokeWidth}
        r={radius}
        cx={size / 2}
        cy={size / 2}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{
          transition: 'stroke-dashoffset 0.5s ease-in-out',
        }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#171717" // Foreground color
        fontSize="1.5em"
        fontFamily="var(--font-geist-sans)"
      >
        {progress}%
      </text>
    </svg>
  );
};

export default ProgressWheel;