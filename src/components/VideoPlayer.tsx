"use client";

import React, { useRef, useEffect, useState } from 'react';
import { PlayCircle, RotateCcw, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useVideoProgress } from '@/hooks/use-video-progress';
import { usePlaybackSpeed } from '@/hooks/use-playback-speed';
import { log } from '@/utils/logger';

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
  onNext?: () => void;
  onPrevious?: () => void;
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
  onNext,
  onPrevious,
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
  const hasSuccessfullyResumed = useRef<boolean>(false);
  const lastEndedTime = useRef<number>(0);
  const resumeAttemptCount = useRef<number>(0);

  // Media Session API
  useEffect(() => {
    if ('mediaSession' in navigator && title) {
      log(`[VideoPlayer] Setting MediaSession for: ${title}`);
      const artworkUrl = posterUrl || 'https://xebtjnvfkroiplyzftas.supabase.co/storage/v1/object/public/assets/fnh-logo.png';
      
      navigator.mediaSession.metadata = new MediaMetadata({
        title: title,
        artist: category || 'FNH Foundations',
        artwork: [{ src: artworkUrl, sizes: '512x512', type: 'image/png' }]
      });

      navigator.mediaSession.setActionHandler('play', () => mediaRef.current?.play());
      navigator.mediaSession.setActionHandler('pause', () => mediaRef.current?.pause());
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        if (mediaRef.current) mediaRef.current.currentTime -= (details.seekOffset || 10);
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        if (mediaRef.current) mediaRef.current.currentTime += (details.seekOffset || 10);
      });
      
      if (onNext) navigator.mediaSession.setActionHandler('nexttrack', onNext);
      if (onPrevious) navigator.mediaSession.setActionHandler('previoustrack', onPrevious);
    }
  }, [title, category, posterUrl, videoUrl, onNext, onPrevious]);

  // Speed Enforcement
  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;
    const enforceSpeed = () => {
      if (media.playbackRate !== speed) {
        log(`[VideoPlayer] Enforcing speed: ${speed}x`);
        media.playbackRate = speed;
      }
    };
    media.addEventListener('ratechange', enforceSpeed);
    media.addEventListener('play', enforceSpeed);
    media.playbackRate = speed;
    return () => {
      media.removeEventListener('ratechange', enforceSpeed);
      media.removeEventListener('play', enforceSpeed);
    };
  }, [speed, videoUrl]);

  // Save progress on unmount or visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && mediaRef.current && isReady) {
        log(`[VideoPlayer] App hidden, saving progress: ${mediaRef.current.currentTime.toFixed(2)}s`);
        saveProgress(mediaRef.current.currentTime, mediaRef.current.duration);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (mediaRef.current && isReady) {
        saveProgress(mediaRef.current.currentTime, mediaRef.current.duration);
      }
    };
  }, [isReady, saveProgress]);

  useEffect(() => {
    log(`[VideoPlayer] Loading new media: ${effectiveKey}`, { url: videoUrl });
    setError(null);
    setIsReady(false);
    hasSuccessfullyResumed.current = false;
    resumeAttemptCount.current = 0;
    
    const media = mediaRef.current;
    if (media) {
      media.load();
      if (autoPlay) {
        media.play().catch((err) => {
          log(`[VideoPlayer] Initial play attempt failed: ${err.message}`, null, 'warn');
        });
      }
    }
  }, [videoUrl, autoPlay, effectiveKey]);

  const attemptResume = (source: string) => {
    const media = mediaRef.current;
    if (!media || !isReady || hasSuccessfullyResumed.current || progress <= 5) return;

    // Don't resume if we're already past the progress point
    if (media.currentTime > progress + 1) {
      log(`[VideoPlayer] Skipping resume from ${source}, already past progress point`);
      hasSuccessfullyResumed.current = true;
      return;
    }

    const seekTime = Math.min(progress, media.duration - 2);
    if (seekTime <= 0) return;

    log(`[VideoPlayer] [Resume] Attempting seek from ${source} to ${seekTime.toFixed(2)}s (Duration: ${media.duration.toFixed(2)}s)`);

    try {
      media.currentTime = seekTime;
      lastSavedTime.current = seekTime;
      
      // Verify seek
      setTimeout(() => {
        if (media && Math.abs(media.currentTime - seekTime) < 2) {
          log(`[VideoPlayer] [Resume] Seek verified successful at ${media.currentTime.toFixed(2)}s`);
          hasSuccessfullyResumed.current = true;
        } else if (resumeAttemptCount.current < 3) {
          resumeAttemptCount.current++;
          log(`[VideoPlayer] [Resume] Seek verification failed, retrying (${resumeAttemptCount.current}/3)...`);
          attemptResume('retry');
        }
      }, 250);
    } catch (e: any) {
      log(`[VideoPlayer] [Resume] Seek error: ${e.message}`, null, 'error');
    }
  };

  useEffect(() => {
    if (isReady && progress > 5 && !hasSuccessfullyResumed.current) {
      const timer = setTimeout(() => attemptResume('isReady/progress effect'), 100);
      return () => clearTimeout(timer);
    }
  }, [isReady, progress]);

  const handleLoadedMetadata = () => {
    if (mediaRef.current) {
      log(`[VideoPlayer] Metadata loaded. Duration: ${mediaRef.current.duration.toFixed(2)}s`);
      mediaRef.current.playbackRate = speed;
      setIsReady(true);
      // Small delay to ensure seekable range is populated
      setTimeout(() => attemptResume('handleLoadedMetadata'), 200);
    }
  };

  const handleCanPlay = () => {
    log('[VideoPlayer] Media can play');
    const media = mediaRef.current;
    if (media && autoPlay && media.paused) {
      media.play().catch(err => log(`[VideoPlayer] Auto-play failed: ${err.message}`, null, 'warn'));
    }
    attemptResume('handleCanPlay');
  };

  const handleTimeUpdate = () => {
    if (mediaRef.current && isPlaying && isReady) {
      const currentTime = mediaRef.current.currentTime;
      // Only save if we've moved forward and it's been more than 5 seconds
      if (currentTime > lastSavedTime.current + 5) {
        saveProgress(currentTime, mediaRef.current.duration);
        lastSavedTime.current = currentTime;
      }
    }
  };

  const handlePlay = () => {
    log('[VideoPlayer] Playback started');
    setHasStarted(true);
    setIsPlaying(true);
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
    
    // Ensure we resume if we haven't yet
    if (!hasSuccessfullyResumed.current && progress > 5) {
      attemptResume('handlePlay');
    }
  };

  const handlePause = () => {
    log('[VideoPlayer] Playback paused');
    setIsPlaying(false);
    if (mediaRef.current && isReady) {
      saveProgress(mediaRef.current.currentTime, mediaRef.current.duration);
    }
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
  };

  const handleEnded = () => {
    const media = mediaRef.current;
    if (!media) return;

    const now = Date.now();
    const timeSinceLastEnd = now - lastEndedTime.current;
    
    log(`[VideoPlayer] Playback ended event. CurrentTime: ${media.currentTime.toFixed(2)}s, Duration: ${media.duration.toFixed(2)}s, Time since last end: ${timeSinceLastEnd}ms`);

    // Prevent double-triggering within 3 seconds
    if (timeSinceLastEnd < 3000) {
      log(`[VideoPlayer] Ignoring duplicate ended event (too soon)`);
      return;
    }

    // Safety check: only trigger if we are actually near the end
    // This prevents weird browser bugs where 'ended' fires prematurely
    if (media.duration > 0 && media.currentTime < media.duration - 5) {
      log(`[VideoPlayer] Ignoring premature ended event (currentTime ${media.currentTime.toFixed(2)}s is not near duration ${media.duration.toFixed(2)}s)`);
      return;
    }

    lastEndedTime.current = now;
    incrementWatchCount();
    
    if (onEnded) {
      log(`[VideoPlayer] Triggering onEnded callback`);
      setTimeout(onEnded, 500);
    }
  };

  const handleMediaError = (e: any) => {
    const mediaElement = e.target as HTMLMediaElement;
    const errorMsg = `Media Error: ${mediaElement.error?.code} - ${mediaElement.error?.message}`;
    log(`[VideoPlayer] ${errorMsg}`, null, 'error');
    setError(errorMsg);
  };

  const togglePlay = () => {
    if (mediaRef.current) {
      if (mediaRef.current.paused) {
        mediaRef.current.play().catch(err => log(`[VideoPlayer] Manual play failed: ${err.message}`, null, 'error'));
      } else {
        mediaRef.current.pause();
      }
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
              onCanPlay={handleCanPlay}
              onTimeUpdate={handleTimeUpdate}
              onPlay={handlePlay}
              onPause={handlePause}
              onEnded={handleEnded}
              onError={handleMediaError}
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
              onCanPlay={handleCanPlay}
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
                onClick={(e) => {
                  e.stopPropagation();
                  if (mediaRef.current) {
                    log('[VideoPlayer] Manual restart requested');
                    mediaRef.current.currentTime = 0;
                    saveProgress(0, mediaRef.current.duration);
                    mediaRef.current.play().catch(err => log(`[VideoPlayer] Restart play failed: ${err.message}`, null, 'error'));
                  }
                }}
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