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
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasStarted, setHasStarted] = useState(autoPlay);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [error, setError] = useState<string | null>(null);
  
  const effectiveKey = progressKey || videoId;
  const { progress, isLoading: isProgressLoading, saveProgress } = useVideoProgress(effectiveKey);
  const { speed } = usePlaybackSpeed();
  const lastSavedTime = useRef<number>(0);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current || document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          videoRef.current.currentTime += 10;
          break;
        case 'ArrowLeft':
          videoRef.current.currentTime -= 10;
          break;
        case 'KeyF':
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            containerRef.current?.requestFullscreen();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  }, [speed, videoUrl, effectiveKey]);

  useEffect(() => {
    setError(null);
    if (autoPlay && videoRef.current) {
      videoRef.current.play().catch(() => {
        setIsPlaying(false);
        setHasStarted(false);
      });
    }
  }, [videoUrl, autoPlay, effectiveKey]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
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
    setError(`Playback Error (Code ${errorCode}). Please check your connection.`);
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

  if (isProgressLoading) {
    return (
      <div className={cn("flex items-center justify-center bg-slate-900", className)}>
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("relative group bg-slate-900", className)}>
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-white font-bold mb-2">Playback Error</h3>
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Reload Page</Button>
        </div>
      ) : (
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-opacity"
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