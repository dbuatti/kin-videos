"use client";

import React, { useRef, useEffect, useState } from 'react';
import { PlayCircle, RotateCcw, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useVideoProgress } from '@/hooks/use-video-progress';
import { usePlaybackSpeed } from '@/hooks/use-playback-speed';

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
  const [error, setError] = useState<string | null>(null);
  
  const effectiveKey = progressKey || videoId;
  const { progress, isLoading: isProgressLoading, saveProgress } = useVideoProgress(effectiveKey);
  const { speed } = usePlaybackSpeed();
  const lastSavedTime = useRef<number>(0);

  // Apply global playback speed whenever it changes or video loads
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  }, [speed, videoUrl]);

  useEffect(() => {
    setError(null);
    
    if (autoPlay && videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.warn("[VideoPlayer] Auto-play blocked or failed:", err);
        setIsPlaying(false);
        setHasStarted(false);
      });
    }
  }, [videoUrl, autoPlay]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      // Apply speed again on metadata load to be safe
      videoRef.current.playbackRate = speed;
      
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
    setError(null);
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (videoRef.current) {
      saveProgress(videoRef.current.currentTime, videoRef.current.duration);
    }
  };

  const handleVideoError = (e: any) => {
    const videoElement = e.target as HTMLVideoElement;
    const errorCode = videoElement.error?.code;
    const errorMessage = videoElement.error?.message;
    console.error(`[VideoPlayer] Video Error: Code ${errorCode}, Message: ${errorMessage}`);
    
    let userMessage = "Failed to load video.";
    if (errorCode === 1) userMessage = "Video loading aborted.";
    if (errorCode === 2) userMessage = "Network error while loading video.";
    if (errorCode === 3) userMessage = "Video decoding failed.";
    if (errorCode === 4) userMessage = "Video format not supported or URL invalid.";
    
    setError(userMessage);
  };

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
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

  if (isProgressLoading) {
    return (
      <div className={cn("flex items-center justify-center bg-slate-900", className)}>
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className={cn("relative group overflow-hidden bg-slate-900", className)}>
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-white font-bold mb-2">Playback Error</h3>
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <p className="text-[10px] text-slate-600 font-mono break-all max-w-xs">{videoUrl}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4 border-slate-700 text-slate-300"
            onClick={(e) => {
              e.stopPropagation();
              window.location.reload();
            }}
          >
            Reload Page
          </Button>
        </div>
      ) : (
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
          onError={handleVideoError}
        />
      )}
      
      {!error && (!hasStarted || (!isPlaying && hasStarted)) && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity group-hover:bg-black/10 cursor-pointer z-20"
          onClick={togglePlay}
        >
          <PlayCircle className="w-16 h-16 text-white drop-shadow-2xl opacity-80 group-hover:opacity-100 transition-all transform group-hover:scale-110" />
          
          {!hasStarted && progress && progress > 5 && (
            <div className="absolute bottom-16 left-4 right-4 flex justify-between items-center pointer-events-auto">
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