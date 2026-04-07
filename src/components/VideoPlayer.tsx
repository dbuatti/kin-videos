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
  title?: string;
  category?: string;
  isAudioOnly?: boolean;
  progressKey?: string;
  posterUrl?: string;
  className?: string;
  onEnded?: () => void;
  autoPlay?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoUrl, 
  videoId, 
  title,
  category,
  isAudioOnly = false,
  progressKey,
  posterUrl, 
  className, 
  onEnded,
  autoPlay = false
}) => {
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasStarted, setHasStarted] = useState(autoPlay);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  const effectiveKey = progressKey || videoId;
  const { progress, isLoading: isProgressLoading, saveProgress, incrementWatchCount } = useVideoProgress(effectiveKey);
  const { speed } = usePlaybackSpeed();
  const lastSavedTime = useRef<number>(0);

  // Media Session API for Control Center & Lock Screen support
  useEffect(() => {
    if ('mediaSession' in navigator && title) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: title,
        artist: category || 'FNH Foundations',
        album: 'Functional Neuro Health',
        artwork: [
          { src: posterUrl || '/placeholder.svg', sizes: '512x512', type: 'image/png' },
        ]
      });

      const playMedia = () => mediaRef.current?.play();
      const pauseMedia = () => mediaRef.current?.pause();

      navigator.mediaSession.setActionHandler('play', playMedia);
      navigator.mediaSession.setActionHandler('pause', pauseMedia);
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        if (mediaRef.current) mediaRef.current.currentTime -= (details.seekOffset || 10);
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        if (mediaRef.current) mediaRef.current.currentTime += (details.seekOffset || 10);
      });
      
      // Clear handlers that might interfere with backgrounding
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
    }
  }, [title, category, posterUrl, videoUrl]);

  // Speed Enforcement
  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    const enforceSpeed = () => {
      if (media.playbackRate !== speed) {
        media.playbackRate = speed;
      }
    };

    media.addEventListener('ratechange', enforceSpeed);
    media.addEventListener('play', enforceSpeed);
    media.addEventListener('playing', enforceSpeed);
    
    media.playbackRate = speed;

    return () => {
      media.removeEventListener('ratechange', enforceSpeed);
      media.removeEventListener('play', enforceSpeed);
      media.removeEventListener('playing', enforceSpeed);
    };
  }, [speed, videoUrl, isReady]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!mediaRef.current || document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          mediaRef.current.currentTime += 10;
          break;
        case 'ArrowLeft':
          mediaRef.current.currentTime -= 10;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    setError(null);
    setIsReady(false);
    if (autoPlay && mediaRef.current) {
      mediaRef.current.play().catch(() => {
        setIsPlaying(false);
        setHasStarted(false);
      });
    }
  }, [videoUrl, autoPlay, effectiveKey]);

  const handleLoadedMetadata = () => {
    if (mediaRef.current) {
      mediaRef.current.playbackRate = speed;
      
      // Robust seeking for mobile
      if (progress && progress > 2) {
        const seekTime = Math.min(progress, mediaRef.current.duration - 2);
        if (seekTime > 0) {
          setTimeout(() => {
            if (mediaRef.current) {
              mediaRef.current.currentTime = seekTime;
              lastSavedTime.current = seekTime;
            }
          }, 200);
        }
      }
      setIsReady(true);
    }
  };

  const handleTimeUpdate = () => {
    if (mediaRef.current && isPlaying && isReady) {
      const currentTime = mediaRef.current.currentTime;
      if (Math.abs(currentTime - lastSavedTime.current) > 5) {
        saveProgress(currentTime, mediaRef.current.duration);
        lastSavedTime.current = currentTime;
      }
      
      if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
        navigator.mediaSession.setPositionState({
          duration: mediaRef.current.duration || 0,
          playbackRate: mediaRef.current.playbackRate || 1,
          position: mediaRef.current.currentTime || 0,
        });
      }
    }
  };

  const handlePlay = () => {
    setHasStarted(true);
    setIsPlaying(true);
    setError(null);
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'playing';
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (mediaRef.current && isReady) {
      saveProgress(mediaRef.current.currentTime, mediaRef.current.duration);
    }
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'paused';
    }
  };

  const handleEnded = () => {
    incrementWatchCount();
    if (onEnded) onEnded();
  };

  const handleMediaError = (e: any) => {
    const mediaElement = e.target as HTMLMediaElement;
    setError(`Playback Error (Code ${mediaElement.error?.code}).`);
  };

  const togglePlay = () => {
    if (mediaRef.current) {
      if (mediaRef.current.paused) {
        mediaRef.current.play();
      } else {
        mediaRef.current.pause();
      }
    }
  };

  const resetProgress = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (mediaRef.current) {
      mediaRef.current.currentTime = 0;
      lastSavedTime.current = 0;
      saveProgress(0, mediaRef.current.duration);
      mediaRef.current.play();
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
    <div ref={containerRef} className={cn("relative group bg-slate-900 overflow-hidden", className)}>
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 p-6 text-center z-30">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      ) : (
        <>
          {isAudioOnly ? (
            <audio
              ref={mediaRef as React.RefObject<HTMLAudioElement>}
              src={videoUrl}
              preload="auto"
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              onPlay={handlePlay}
              onPause={handlePause}
              onEnded={handleEnded}
              onError={handleMediaError}
              // IMPORTANT: Do not use display:none (hidden) as iOS will pause it in background.
              // Instead, we make it invisible but technically "visible" to the OS.
              className="opacity-0 pointer-events-none absolute w-1 h-1"
            />
          ) : (
            <video
              ref={mediaRef as React.RefObject<HTMLVideoElement>}
              src={videoUrl}
              className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-opacity"
              controls={hasStarted}
              preload="auto"
              poster={posterUrl}
              playsInline
              webkit-playsinline="true"
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              onPlay={handlePlay}
              onPause={handlePause}
              onEnded={handleEnded}
              onError={handleMediaError}
            />
          )}
        </>
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