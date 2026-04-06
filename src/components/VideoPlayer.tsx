"use client";

import React, { useRef, useEffect, useState } from 'react';
import { PlayCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  videoUrl: string;
  videoId: string;
  posterUrl?: string;
  className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, videoId, posterUrl, className }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [savedTime, setSavedTime] = useState<number>(0);
  const storageKey = `video-progress-${videoId}`;

  // Load saved progress on mount
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setSavedTime(parseFloat(saved));
    }
  }, [storageKey]);

  const handleLoadedMetadata = () => {
    if (videoRef.current && savedTime > 0) {
      // Only seek if the video is long enough
      if (savedTime < videoRef.current.duration - 2) {
        videoRef.current.currentTime = savedTime;
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      // Save progress every time it updates
      localStorage.setItem(storageKey, currentTime.toString());
    }
  };

  const handlePlay = () => {
    setHasStarted(true);
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
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
    e.stopPropagation(); // Prevent togglePlay from firing
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      localStorage.removeItem(storageKey);
      setSavedTime(0);
      videoRef.current.play();
    }
  };

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
        preload="metadata"
        poster={posterUrl}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
      />
      
      {(!hasStarted || (!isPlaying && hasStarted)) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20 transition-opacity group-hover:bg-black/10">
          <PlayCircle className="w-16 h-16 text-white drop-shadow-2xl opacity-80 group-hover:opacity-100 transition-all transform group-hover:scale-110" />
          
          {!hasStarted && savedTime > 5 && (
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center pointer-events-auto">
              <div className="bg-indigo-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg">
                RESUMING AT {Math.floor(savedTime / 60)}:{(Math.floor(savedTime % 60)).toString().padStart(2, '0')}
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