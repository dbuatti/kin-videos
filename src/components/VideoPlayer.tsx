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
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  const effectiveKey = progressKey || videoId;
  const { progress, isLoading: isProgressLoading, saveProgress, incrementWatchCount } = useVideoProgress(effectiveKey);
  const { speed } = usePlaybackSpeed();
  const hasSuccessfullyResumed = useRef<boolean>(false);
  const lastEndedTime = useRef<number>(0);

  const isWistiaMediaId = videoUrl.includes('wistia.com/deliveries/') && (videoUrl.split('/').pop()?.replace('.mp4', '').length || 0) <= 10;
  const isExternalEmbed = videoUrl.includes('loom.com') || videoUrl.includes('descript.com') || isWistiaMediaId;
  
  const getEmbedUrl = (url: string) => {
    if (url.includes('loom.com/share/')) return url.replace('/share/', '/embed/');
    if (url.includes('share.descript.com/view/')) return url.replace('/view/', '/embed/');
    if (isWistiaMediaId) {
      const mediaId = url.split('/').pop()?.replace('.mp4', '');
      return `https://fast.wistia.net/embed/iframe/${mediaId}`;
    }
    return url;
  };

  useEffect(() => {
    if ('mediaSession' in navigator && title) {
      const artworkUrl = posterUrl || 'https://xebtjnvfkroiplyzftas.supabase.co/storage/v1/object/public/assets/fnh-logo.png';
      navigator.mediaSession.metadata = new MediaMetadata({
        title: title,
        artist: category || 'FNH Foundations',
        artwork: [{ src: artworkUrl, sizes: '512x512', type: 'image/png' }]
      });
      navigator.mediaSession.setActionHandler('play', () => mediaRef.current?.play());
      navigator.mediaSession.setActionHandler('pause', () => mediaRef.current?.pause());
      if (onNext) navigator.mediaSession.setActionHandler('nexttrack', onNext);
      if (onPrevious) navigator.mediaSession.setActionHandler('previoustrack', onPrevious);
    }
  }, [title, category, posterUrl, videoUrl, onNext, onPrevious]);

  useEffect(() => {
    const media = mediaRef.current;
    if (!media || isExternalEmbed) return;
    media.playbackRate = speed;
  }, [speed, videoUrl, isExternalEmbed]);

  useEffect(() => {
    if (isExternalEmbed) return;
    const saveCurrentProgress = () => {
      if (mediaRef.current && isReady && mediaRef.current.currentTime > 0) {
        saveProgress(mediaRef.current.currentTime, mediaRef.current.duration);
      }
    };
    window.addEventListener('beforeunload', saveCurrentProgress);
    return () => {
      window.removeEventListener('beforeunload', saveCurrentProgress);
      saveCurrentProgress();
    };
  }, [isReady, saveProgress, effectiveKey, isExternalEmbed]);

  useEffect(() => {
    setError(null);
    setIsReady(false);
    hasSuccessfullyResumed.current = false;
    
    if (isExternalEmbed) {
      setIsReady(true);
      setHasStarted(true);
      return;
    }

    const media = mediaRef.current;
    if (media) {
      media.load();
      if (autoPlay) {
        // On iOS, play() must be called immediately after load() or in response to an event
        const playPromise = media.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            log(`[Playback] Autoplay blocked or failed: ${error.message}`, null, 'warn');
          });
        }
      }
    }
  }, [videoUrl, autoPlay, effectiveKey, isExternalEmbed]);

  const attemptResume = () => {
    const media = mediaRef.current;
    if (!media || !isReady || hasSuccessfullyResumed.current || progress <= 1 || isExternalEmbed) return;
    const seekTime = Math.min(progress, media.duration - 1);
    if (seekTime <= 0) return;
    try {
      media.currentTime = seekTime;
      hasSuccessfullyResumed.current = true;
    } catch (e) {}
  };

  const handleLoadedMetadata = () => {
    if (mediaRef.current) {
      mediaRef.current.playbackRate = speed;
      setIsReady(true);
      attemptResume();
    }
  };

  const handlePlay = () => {
    setHasStarted(true);
    setIsPlaying(true);
    if (!hasSuccessfullyResumed.current && progress > 1) attemptResume();
  };

  const handlePause = () => setIsPlaying(false);

  const handleEnded = () => {
    const media = mediaRef.current;
    if (!media) return;
    
    const now = Date.now();
    // Prevent duplicate ended events
    if (now - lastEndedTime.current < 2000) return;
    lastEndedTime.current = now;
    
    log(`[Playback] Media ended: ${videoId}`);
    incrementWatchCount();
    
    // CRITICAL: Call onEnded immediately without setTimeout to preserve 
    // the "user interaction" context required by iOS for the next play() call.
    if (onEnded) onEnded();
  };

  const togglePlay = () => {
    if (mediaRef.current) {
      if (mediaRef.current.paused) mediaRef.current.play().catch(() => {});
      else mediaRef.current.pause();
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
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      ) : isExternalEmbed ? (
        <iframe src={getEmbedUrl(videoUrl)} className="w-full h-full border-none" allow="autoplay; fullscreen" allowFullScreen />
      ) : (
        <>
          {isAudioOnly ? (
            <audio
              ref={mediaRef as React.RefObject<HTMLAudioElement>}
              src={videoUrl}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={handlePlay}
              onPause={handlePause}
              onEnded={handleEnded}
              preload="auto"
              className="opacity-0 absolute w-1 h-1"
            />
          ) : (
            <video
              ref={mediaRef as React.RefObject<HTMLVideoElement>}
              src={videoUrl}
              className="w-full h-full object-contain"
              controls={hasStarted}
              poster={posterUrl}
              playsInline
              preload="auto"
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={handlePlay}
              onPause={handlePause}
              onEnded={handleEnded}
            />
          )}
        </>
      )}
      
      {!error && !isExternalEmbed && !hasStarted && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer z-20" onClick={togglePlay}>
          <PlayCircle className="w-16 h-16 text-white drop-shadow-2xl opacity-80 group-hover:opacity-100 transition-all transform group-hover:scale-110" />
          {progress > 1 && (
            <div className="absolute bottom-16 left-4 right-4 flex justify-between items-center">
              <div className="bg-indigo-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md">
                RESUMING AT {Math.floor(progress / 60)}:{(Math.floor(progress % 60)).toString().padStart(2, '0')}
              </div>
              <Button variant="secondary" size="sm" className="h-7 px-2 bg-white/20 text-white border-none" onClick={(e) => {
                e.stopPropagation();
                if (mediaRef.current) {
                  mediaRef.current.currentTime = 0;
                  saveProgress(0, mediaRef.current.duration);
                  mediaRef.current.play();
                }
              }}>
                <RotateCcw className="w-3 h-3 mr-1" /> Restart
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;