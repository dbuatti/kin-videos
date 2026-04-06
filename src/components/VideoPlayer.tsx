"use client";

import React, { useRef, useEffect, useState } from 'react';
import { PlayCircle, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useVideoProgress } from '@/hooks/use-video-progress';

interface VideoPlayerProps {
  videoUrl: string;
  videoId: string;
  progressKey?: string;
  posterUrl?: string;
  className?: string;
  onEnded?: () => void;
  autoPlay?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoUrl, 
  videoId, 
  progressKey,
  posterUrl, 
  className, 
  onEnded,
  autoPlay = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasStarted, setHasStarted] = useState(autoPlay);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  
  const effectiveKey = progressKey || videoId;
  const { progress, isLoading, saveProgress } = useVideoProgress(effectiveKey);
  const lastSavedTime = useRef<number>(0);

  useEffect(() => {
    if (autoPlay && videoRef.current) {
      videoRef.current.play().catch(() => {
        setIsPlaying(false);
        setHasStarted(false);
      });
    }
  }, [videoUrl, autoPlay]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      // Save duration immediately so gallery can show progress bar
      saveProgress(videoRef.current.currentTime, videoRef.current.duration);
      
      if (progress && progress > 5 && !autoPlay) {
        if (progress < videoRef.current.duration - 5) {
          videoRef.current.currentTime = progress;
        }
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && isPlaying) {
      const currentTime = videoRef.current.currentTime;
      if (Math.abs(currentTime - lastSavedTime.current) > 5) {
        saveProgress(currentTime, videoRef.current.duration);
        lastSavedTime.current = currentTime;
      }
    }
  };

  const handlePlay = () => {
    setHasStarted(true);
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (videoRef.current) {
      saveProgress(videoRef.current.currentTime, videoRef.current.duration);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const resetProgress = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      saveProgress(0, videoRef.current.duration);
      videoRef.current.play();
    }
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center bg-slate-900", className)}>
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div 
      className={cn("relative group overflow-hidden bg-slate-900 cursor-pointer", className)}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
        controls
        preload="auto"
        poster={posterUrl}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={onEnded}
      />
      
      {(!hasStarted || (!isPlaying && hasStarted)) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20 transition-opacity group-hover:bg-black/10">
          <PlayCircle className="w-16 h-16 text-white drop-shadow-2xl opacity-80 group-hover:opacity-100 transition-all transform group-hover:scale-110" />
          
          {!hasStarted && progress && progress > 5 && (
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center pointer-events-auto">
              <div className="bg-indigo-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg">
                RESUMING AT {Math.floor(progress / 60)}:{(Math.floor(progress % 60)).toString().padStart(2, '0')}
              </div>
              <Button 
                variant="secondary" 
                size="sm" 
                className="h-7 px-2 bg-white/20 hover:bg-white/40 text-white border-none backdrop-blur-sm"
                onClick={resetProgress}
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Restart
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;