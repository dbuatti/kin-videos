"use client";

import React, { useRef, useEffect, useState } from 'react';
import { PlayCircle, RotateCcw, Loader2, AlertCircle } from 'lucide-react';
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
  const [error, setError] = useState<string | null>(null);
  const [isMetadataLoaded, setIsMetadataLoaded] = useState(false);
  
  const effectiveKey = progressKey || videoId;
  const { progress, isLoading, saveProgress } = useVideoProgress(effectiveKey);
  const lastSavedTime = useRef<number>(0);

  useEffect(() => {
    console.log(`[VideoPlayer] Initializing with URL: ${videoUrl}`);
    setError(null);
    setIsMetadataLoaded(false);
    
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
      console.log(`[VideoPlayer] Metadata loaded. Duration: ${videoRef.current.duration}s`);
      setIsMetadataLoaded(true);
      saveProgress(videoRef.current.currentTime, videoRef.current.duration);
      
      if (progress && progress > 5 && !autoPlay) {
        if (progress < videoRef.current.duration - 5) {
          console.log(`[VideoPlayer] Setting initial time to: ${progress}s`);
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
    console.log("[VideoPlayer] Play event triggered");
    setHasStarted(true);
    setIsPlaying(true);
    setError(null);
  };

  const handlePause = () => {
    console.log("[VideoPlayer] Pause event triggered");
    setIsPlaying(false);
    if (videoRef.current) {
      saveProgress(videoRef.current.currentTime, videoRef.current.duration);
    }
  };

  const handleVideoError = (e: any) => {
    const videoElement = e.target as HTMLVideoElement;
    console.error(`[VideoPlayer] Video Error:`, videoElement.error);
    setError("Failed to load video. Please check your connection or the video source.");
  };

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (videoRef.current) {
      if (videoRef.current.paused) {
        console.log("[VideoPlayer] Calling .play()");
        videoRef.current.play().catch(err => {
          console.error("[VideoPlayer] Play failed:", err);
          setError("Playback failed. Your browser might be blocking the video.");
        });
      } else {
        console.log("[VideoPlayer] Calling .pause()");
        videoRef.current.pause();
      }
    }
  };

  const resetProgress = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current) {
      console.log("[VideoPlayer] Resetting progress to 0");
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
    <div className={cn("relative group overflow-hidden bg-slate-900", className)}>
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 p-6 text-center z-20">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-white font-bold mb-2">Playback Error</h3>
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4 border-slate-700 text-slate-300"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
        </div>
      ) : (
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-cover"
          controls={hasStarted}
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
      
      {/* Play Overlay - Only visible before start or when paused */}
      {!error && (!hasStarted || !isPlaying) && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer z-10 transition-opacity group-hover:bg-black/20"
          onClick={togglePlay}
        >
          <PlayCircle className="w-20 h-20 text-white drop-shadow-2xl opacity-90 group-hover:opacity-100 transition-all transform group-hover:scale-110" />
          
          {/* Resume/Restart Controls */}
          {!hasStarted && progress && progress > 5 && isMetadataLoaded && (
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center">
              <div className="bg-indigo-600/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl border border-indigo-400/30">
                RESUMING AT {Math.floor(progress / 60)}:{(Math.floor(progress % 60)).toString().padStart(2, '0')}
              </div>
              <Button 
                variant="secondary" 
                size="sm" 
                className="h-9 px-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md rounded-xl"
                onClick={resetProgress}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
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