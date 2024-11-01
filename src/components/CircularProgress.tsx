import React from 'react';

interface CircularProgressProps {
  progress: number;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({ progress }) => {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="absolute inset-0">
      <svg className="w-full h-full -rotate-90">
        <circle
          className="text-green-400/20"
          strokeWidth="2"
          stroke="currentColor"
          fill="none"
          r={radius}
          cx="80"
          cy="80"
        />
        <circle
          className="text-green-400 transition-all duration-500"
          strokeWidth="2"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="none"
          r={radius}
          cx="80"
          cy="80"
        />
      </svg>
    </div>
  );
};
