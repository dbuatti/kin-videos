"use client";

import React from 'react';
import { useVideoProgress } from '@/hooks/use-video-progress';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoProgressIndicatorProps {
  videoId: string;
  className?: string;
  showText?: boolean;
}

const VideoProgressIndicator: React.FC<VideoProgressIndicatorProps> = ({ 
  videoId, 
  className,
  showText = true
}) => {
  const { progress, duration, isLoading } = useVideoProgress(videoId);

  if (isLoading || !duration || duration === 0) return null;

  const percentage = Math.min(Math.round((progress / duration) * 100), 100);
  const isCompleted = percentage > 95;

  return (
    <div className={className}>
      {showText && (
        <div className="flex justify-between items-center mb-1.5">
          <span className={cn(
            "text-[10px] font-black uppercase tracking-widest",
            isCompleted ? "text-emerald-400" : "text-indigo-400"
          )}>
            {isCompleted ? "Completed" : `${percentage}% Watched`}
          </span>
          {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
        </div>
      )}
      <Progress 
        value={percentage} 
        className={cn(
          "h-2 rounded-full transition-all",
          isCompleted ? "bg-emerald-950/30" : "bg-indigo-950/30"
        )} 
      />
    </div>
  );
};

export default VideoProgressIndicator;