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
  // We always use a video element because we are playing .mp4 files.
  // iOS handles .mp4 files in <audio> tags inconsistently.
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasStarted, setHasStarted] = useState(autoPlay);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  // Unify the key so progress is shared between video and audio modes
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

      navigator.mediaSession.setActionHandler('play', () => videoRef.current?.play());
      navigator.mediaSession.setActionHandler('pause', () => videoRef.current?.pause());
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        if (videoRef.current) videoRef.current.currentTime -= (details.seekOffset || 10);
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        if (videoRef.current) videoRef.current.currentTime += (details.seekOffset || 10);
      });
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
    }
  }, [title, category, posterUrl, videoUrl]);

  // Speed Enforcement
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const enforceSpeed = () => {
      if (video.playbackRate !== speed) {
        video.playbackRate = speed;
      }
    };

    video.addEventListener('ratechange', enforceSpeed);
    video.addEventListener('play', enforceSpeed);
    
    video.playbackRate = speed;

    return () => {
      video.removeEventListener('ratechange', enforceSpeed);
      video.removeEventListener('play', enforceSpeed);
    };
  }, [speed, videoUrl, isReady]);

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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    setError(null);
    setIsReady(false);
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
      
      // Robust seeking for mobile
      if (progress && progress > 2) {
        const seekTime = Math.min(progress, videoRef.current.duration - 2);
        if (seekTime > 0) {
          // Small delay to ensure iOS buffer is ready for seeking
          setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.currentTime = seekTime;
              lastSavedTime.current = seekTime;
            }
          }, 200);
        }
      }
      setIsReady(true);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && isPlaying && isReady) {
      const currentTime = videoRef.current.currentTime;
      if (Math.abs(currentTime - lastSavedTime.current) > 5) {
        saveProgress(currentTime, videoRef.current.duration);
        lastSavedTime.current = currentTime;
      }
      
      if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
        navigator.mediaSession.setPositionState({
          duration: videoRef.current.duration || 0,
          playbackRate: videoRef.current.playbackRate || 1,
          position: videoRef.current.currentTime || 0,
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
    if (videoRef.current && isReady) {
      saveProgress(videoRef.current.currentTime, videoRef.current.duration);
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
      lastSavedTime.current = 0;
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
    <div ref={containerRef} className={cn("relative group bg-slate-900 overflow-hidden", className)}>
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 p-6 text-center z-30">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      ) : (
        <video
          ref={videoRef}
          src={videoUrl}
          // In audio mode, we keep the video element but hide it visually.
          // We don't use display: none because iOS might pause background playback.
          className={cn(
            "w-full h-full object-contain transition-opacity",
            isAudioOnly ? "opacity-0 pointer-events-none" : "opacity-90 group-hover:opacity-100"
          )}
          // We only show native controls in video mode when the user has started playback
          // to avoid the native iOS player taking over immediately.
          controls={!isAudioOnly && hasStarted}
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