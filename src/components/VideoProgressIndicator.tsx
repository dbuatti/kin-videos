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
  const { data: allProgress } = useAllProgress();
  const { progress: individualProgress, duration: individualDuration, watchCount: individualWatchCount } = useVideoProgress(videoId);

  const data = providedData || allProgress?.[videoId] || {
    playback_time: individualProgress,
    duration: individualDuration,
    watch_count: individualWatchCount
  };

  const { playback_time: progress, duration, watch_count: watchCount } = data;

  // Handle cases where duration is 0 or missing
  if (!duration || duration <= 0) {
    if (watchCount > 0) {
      return (
        <div className={cn("flex items-center space-x-2", className)}>
          <div className="flex items-center bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <Eye className="w-3 h-3 mr-1" />
            <span className="text-[10px] font-black uppercase tracking-tight">{watchCount} {watchCount === 1 ? 'View' : 'Views'}</span>
          </div>
        </div>
      );
    }
    return null;
  }

  const percentage = Math.min(Math.round((progress / duration) * 100), 100);
  const isCompleted = watchCount > 0;
  const isCurrentlyWatching = percentage > 1 && percentage < 95;

  return (
    <div className={className}>
      {showText && (
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-2">
            <span className={cn(
              "text-[10px] font-black uppercase tracking-widest",
              isCurrentlyWatching ? "text-indigo-400" : (isCompleted ? "text-emerald-400" : "text-slate-600")
            )}>
              {isCurrentlyWatching ? `${percentage}% Watched` : (isCompleted ? "Completed" : "Not Started")}
            </span>
            {watchCount > 0 && (
              <div className="flex items-center bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                <Eye className="w-3 h-3 mr-1" />
                <span className="text-[9px] font-black uppercase tracking-tight">{watchCount}x</span>
              </div>
            )}
          </div>
          {isCompleted && !isCurrentlyWatching && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
        </div>
      )}
      <Progress 
        value={percentage > 0 ? percentage : (isCompleted ? 100 : 0)} 
        className={cn(
          "h-1.5 rounded-full transition-all",
          isCompleted && !isCurrentlyWatching ? "bg-emerald-950/30" : "bg-indigo-950/30",
          isCompleted && !isCurrentlyWatching ? "[&>div]:bg-emerald-500" : "[&>div]:bg-indigo-500"
        )} 
      />
    </div>
  );
};

export default VideoProgressIndicator;