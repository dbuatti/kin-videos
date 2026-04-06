"use client";

import React from 'react';
import { useVideoProgress } from '@/hooks/use-video-progress';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2 } from 'lucide-react';

interface VideoProgressIndicatorProps {
  videoId: string;
  className?: string;
}

const VideoProgressIndicator: React.FC<VideoProgressIndicatorProps> = ({ videoId, className }) => {
  const { progress, duration, isLoading } = useVideoProgress(videoId);

  if (isLoading || !duration || duration === 0) return null;

  const percentage = Math.min(Math.round((progress / duration) * 100), 100);
  const isCompleted = percentage > 95;

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
          {isCompleted ? "Completed" : `${percentage}% Watched`}
        </span>
        {isCompleted && <CheckCircle2 className="w-3 h-3 text-green-500" />}
      </div>
      <Progress value={percentage} className="h-1 bg-indigo-100" />
    </div>
  );
};

export default VideoProgressIndicator;