"use client";

import React from 'react';
import { useVideoProgress } from '@/hooks/use-video-progress';
import { useAllProgress } from '@/hooks/use-all-progress';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoProgressIndicatorProps {
  videoId: string;
  className?: string;
  showText?: boolean;
  // Optional: if provided, we use this instead of fetching
  data?: {
    playback_time: number;
    duration: number;
    watch_count: number;
  };
}

const VideoProgressIndicator: React.FC<VideoProgressIndicatorProps> = ({ 
  videoId, 
  className,
  showText = true,
  data: providedData
}) => {
  // If no data provided, we use the optimized global hook
  const { data: allProgress } = useAllProgress();
  const { progress: individualProgress, duration: individualDuration, watchCount: individualWatchCount } = useVideoProgress(videoId);

  const data = providedData || allProgress?.[videoId] || {
    playback_time: individualProgress,
    duration: individualDuration,
    watch_count: individualWatchCount
  };

  const { playback_time: progress, duration, watch_count: watchCount } = data;

  if (!duration || duration === 0) return null;

  const percentage = Math.min(Math.round((progress / duration) * 100), 100);
  const isCompleted = percentage > 95 || watchCount > 0;

  return (
    <div className={className}>
      {showText && (
        <div className="flex justify-between items-center mb-1.5">
          <div className="flex items-center space-x-2">
            <span className={cn(
              "text-[10px] font-black uppercase tracking-widest",
              isCompleted ? "text-emerald-400" : "text-indigo-400"
            )}>
              {isCompleted ? "Completed" : `${percentage}% Watched`}
            </span>
            {watchCount > 0 && (
              <span className="flex items-center text-[9px] font-bold text-slate-500 bg-white/5 px-1.5 py-0.5 rounded">
                <Eye className="w-2.5 h-2.5 mr-1" />
                {watchCount}x
              </span>
            )}
          </div>
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