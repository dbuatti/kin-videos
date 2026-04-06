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

  // Apply global playback speed
  useEffect(() => {
    if (videoRef.current && hasStarted) {
      videoRef.current.playbackRate = speed;
    }
  }, [speed, hasStarted]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      console.log(`[VideoPlayer] Metadata loaded for ${effectiveKey}. Duration: ${videoRef.current.duration}s`);
      videoRef.current.playbackRate = speed;
      
      // Resume from saved progress
      if (progress && progress > 5) {
        if (progress < videoRef.current.duration - 5) {
          console.log(`[VideoPlayer] Resuming ${effectiveKey} at ${progress}s`);
          videoRef.current.currentTime = progress;
          lastSavedTime.current = progress;
        }
      }
      
      saveProgress(videoRef.current.currentTime, videoRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && isPlaying) {
      const currentTime = videoRef.current.currentTime;
      // Save every 10 seconds to be efficient but reliable
      if (Math.abs(currentTime - lastSavedTime.current) > 10) {
        console.log(`[VideoPlayer] Saving progress for ${effectiveKey}: ${currentTime}s`);
        saveProgress(currentTime, videoRef.current.duration);
        lastSavedTime.current = currentTime;
      }
    }
  };

  const handlePlay = () => {
    console.log(`[VideoPlayer] Play started for ${effectiveKey}`);
    setIsPlaying(true);
    setError(null);
  };

  const handlePause = () => {
    console.log(`[VideoPlayer] Play paused for ${effectiveKey}`);
    setIsPlaying(false);
    if (videoRef.current) {
      saveProgress(videoRef.current.currentTime, videoRef.current.duration);
    }
  };

  const handleVideoError = (e: any) => {
    const videoElement = e.target as HTMLVideoElement;
    console.error(`[VideoPlayer] Error for ${effectiveKey}:`, videoElement.error);
    setError("Failed to load video. Please check your connection.");
  };

  const startPlayback = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setHasStarted(true);
    setIsPlaying(true);
  };

  const resetProgress = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      saveProgress(0, videoRef.current.duration);
      videoRef.current.play();
    } else {
      setHasStarted(true);
      setIsPlaying(true);
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
    <div className={cn("relative group overflow-hidden bg-slate-950", className)}>
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Reload</Button>
        </div>
      ) : hasStarted ? (
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-cover"
          controls
          autoPlay
          preload="auto"
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={onEnded}
          onError={handleVideoError}
        />
      ) : (
        <div 
          className="absolute inset-0 flex items-center justify-center cursor-pointer z-20"
          onClick={startPlayback}
        >
          {posterUrl && (
            <img 
              src={posterUrl} 
              alt="Thumbnail" 
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
            />
          )}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
          <PlayCircle className="w-16 h-16 text-white drop-shadow-2xl opacity-80 group-hover:opacity-100 transition-all transform group-hover:scale-110 z-30" />
          
          {progress > 5 && (
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-30">
              <div className="bg-indigo-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg">
                RESUME AT {Math.floor(progress / 60)}:{(Math.floor(progress % 60)).toString().padStart(2, '0')}
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