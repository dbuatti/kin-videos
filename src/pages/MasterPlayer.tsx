"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useJobLessons } from '@/hooks/use-job-lessons';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  SkipForward, 
  SkipBack, 
  ListMusic,
  Headphones,
  Video,
  Zap,
  Loader2,
  Music
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MODULE_ORDER, VERIFIED_LESSON_ORDER } from '@/utils/filenames';
import VideoPlayer from '@/components/VideoPlayer';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { cn } from '@/lib/utils';
import { showSuccess } from '@/utils/toast';
import { useVideoProgress } from '@/hooks/use-video-progress';
import PlaybackSpeedControl from '@/components/PlaybackSpeedControl';

const MasterPlayer = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: lessons, isLoading, error: lessonsError } = useJobLessons();
  
  // Initialize mode from URL or default to video
  const initialMode = searchParams.get('mode') === 'audio';
  const [isAudioOnly, setIsAudioOnly] = useState(initialMode);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Sync state with URL
  useEffect(() => {
    const mode = isAudioOnly ? 'audio' : 'video';
    if (searchParams.get('mode') !== mode) {
      setSearchParams({ mode });
    }
  }, [isAudioOnly, setSearchParams, searchParams]);

  // Persistence for the "Master Index" (which lesson the user is on)
  const masterStateKey = isAudioOnly ? 'master-player-audio-index' : 'master-player-video-index';
  const { progress: savedIndex, saveProgress: saveMasterIndex, isLoading: isStateLoading } = useVideoProgress(masterStateKey);

  const playlist = useMemo(() => {
    if (!lessons) return [];
    
    const videoOnly = lessons.filter(l => l.video_url);
    
    // Sort strictly by the verified lesson order provided in the curriculum
    const sorted = videoOnly.sort((a, b) => {
      const indexA = VERIFIED_LESSON_ORDER.indexOf(a.lesson_url);
      const indexB = VERIFIED_LESSON_ORDER.indexOf(b.lesson_url);
      
      // If both are in the verified list, sort by their position there
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      
      // Fallback to category order if URL not found in verified list
      const catA = a.category || 'Uncategorized';
      const catB = b.category || 'Uncategorized';
      const catIndexA = MODULE_ORDER.indexOf(catA);
      const catIndexB = MODULE_ORDER.indexOf(catB);
      
      if (catIndexA !== catIndexB) {
        return (catIndexA === -1 ? Infinity : catIndexA) - (catIndexB === -1 ? Infinity : catIndexB);
      }
      
      return (a.title || '').localeCompare(b.title || '');
    });

    return sorted;
  }, [lessons]);

  // Load saved index on initial load
  useEffect(() => {
    if (!isStateLoading && isInitialLoad && playlist.length > 0) {
      const indexToLoad = Math.floor(savedIndex);
      if (indexToLoad >= 0 && indexToLoad < playlist.length) {
        console.log(`[MasterPlayer] Resuming course at lesson index: ${indexToLoad} (${playlist[indexToLoad].title})`);
        setCurrentIndex(indexToLoad);
      }
      setIsInitialLoad(false);
    }
  }, [isStateLoading, savedIndex, playlist, isInitialLoad]);

  // Save index whenever it changes
  useEffect(() => {
    if (!isInitialLoad && !isStateLoading) {
      console.log(`[MasterPlayer] Saving current lesson index: ${currentIndex}`);
      saveMasterIndex(currentIndex);
    }
  }, [currentIndex, isInitialLoad, isStateLoading, saveMasterIndex]);

  const currentVideo = playlist[currentIndex];

  const handleNext = () => {
    if (currentIndex < playlist.length - 1) {
      console.log(`[MasterPlayer] Moving to next lesson: ${currentIndex + 1}`);
      setCurrentIndex(prev => prev + 1);
      setAutoPlay(true);
    } else {
      showSuccess("You've reached the end of the course!");
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      console.log(`[MasterPlayer] Moving to previous lesson: ${currentIndex - 1}`);
      setCurrentIndex(prev => prev - 1);
      setAutoPlay(true);
    }
  };

  const selectVideo = (index: number) => {
    console.log(`[MasterPlayer] Manually selected lesson index: ${index}`);
    setCurrentIndex(index);
    setAutoPlay(true);
  };

  if (isLoading || (isStateLoading && isInitialLoad)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!isLoading && playlist.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-400 p-8">
        <Video className="w-16 h-16 mb-4 opacity-20" />
        <h2 className="text-xl font-bold text-white mb-2">No Videos Found</h2>
        <p className="text-center max-w-md mb-6">
          We couldn't find any lessons with video content. Please make sure your course data is synced.
        </p>
        <Button onClick={() => navigate('/')} variant="outline" className="border-slate-700">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col">
      {/* Header */}
      <header className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/')}
            className="rounded-full hover:bg-slate-800 text-slate-400"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-indigo-400 flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              {isAudioOnly ? "Virtual Audio Stitcher" : "Virtual Video Stitcher"}
            </h1>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
              {isAudioOnly ? "Independent Audio Progress" : "Independent Video Progress"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <PlaybackSpeedControl className="border-slate-700 text-slate-300 hover:bg-slate-800" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              console.log(`[MasterPlayer] Switching mode to: ${!isAudioOnly ? 'Audio' : 'Video'}`);
              setIsAudioOnly(!isAudioOnly);
              setIsInitialLoad(true); // Trigger reload of the saved index for the new mode
            }}
            className={cn(
              "rounded-xl border-slate-700 transition-all",
              isAudioOnly ? "bg-indigo-600 text-white border-indigo-500" : "bg-slate-900 text-slate-400"
            )}
          >
            {isAudioOnly ? <Headphones className="w-4 h-4 mr-2" /> : <Video className="w-4 h-4 mr-2" />}
            {isAudioOnly ? "Switch to Video" : "Switch to Audio"}
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Player Section */}
        <div className="flex-1 flex flex-col p-4 lg:p-8 justify-start items-center bg-black/40 overflow-y-auto">
          <div className={cn(
            "w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900 relative"
          )}>
            {/* Audio Mode Overlay */}
            {isAudioOnly && (
              <div className="absolute inset-0 z-10 flex flex-col items-center space-y-6 text-center p-8 w-full h-full justify-center bg-gradient-to-b from-slate-900 to-indigo-950/90 backdrop-blur-sm pointer-events-none">
                <div className="relative">
                  <div className="w-40 h-40 bg-indigo-600/10 rounded-full flex items-center justify-center animate-pulse border border-indigo-500/20">
                    <Music className="w-20 h-20 text-indigo-500" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-indigo-600 p-2 rounded-lg shadow-lg">
                    <Headphones className="w-5 h-5 text-white" />
                  </div>
                </div>
                
                <div className="max-w-md">
                  <Badge variant="outline" className="mb-4 border-indigo-500/30 text-indigo-400 bg-indigo-500/5">
                    {currentVideo?.category}
                  </Badge>
                  <h2 className="text-3xl font-black text-white mb-2 tracking-tight">{currentVideo?.title}</h2>
                  <p className="text-slate-400 text-sm font-medium">Virtual Audio Stitcher Mode</p>
                </div>

                <div className="flex items-center space-x-1 h-8">
                  {[...Array(12)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-1 bg-indigo-500 rounded-full animate-bounce" 
                      style={{ 
                        height: `${Math.random() * 100}%`,
                        animationDuration: `${0.5 + Math.random()}s`,
                        animationDelay: `${Math.random()}s`
                      }} 
                    />
                  ))}
                </div>
              </div>
            )}

            {/* The actual player - always rendered to maintain state and playback */}
            <VideoPlayer 
              videoUrl={currentVideo?.video_url || ''} 
              videoId={currentVideo?.id || ''} 
              progressKey={isAudioOnly ? `${currentVideo?.id}-audio` : currentVideo?.id}
              className="w-full h-full"
              onEnded={handleNext}
              autoPlay={autoPlay}
            />
          </div>

          {/* Controls */}
          <div className="mt-8 flex items-center space-x-6 pb-12">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="h-12 w-12 rounded-full hover:bg-slate-800 text-slate-400"
            >
              <SkipBack className="w-6 h-6" />
            </Button>
            
            <div className="text-center px-8">
              <p className="text-xs text-slate-500 font-bold uppercase mb-1">Now {isAudioOnly ? 'Listening' : 'Watching'}</p>
              <h3 className="text-lg font-bold text-white truncate max-w-xs lg:max-w-md">
                {currentVideo?.title}
              </h3>
              <p className="text-[10px] text-indigo-400 font-medium mt-1">
                Lesson {currentIndex + 1} of {playlist.length}
              </p>
            </div>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleNext}
              disabled={currentIndex === playlist.length - 1}
              className="h-12 w-12 rounded-full hover:bg-slate-800 text-slate-400"
            >
              <SkipForward className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Playlist Sidebar */}
        <aside className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900/30 flex flex-col">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="font-bold flex items-center text-sm">
              <ListMusic className="w-4 h-4 mr-2 text-indigo-400" />
              Course Playlist
            </h2>
            <Badge variant="outline" className="border-slate-700 text-slate-500">
              {playlist.length} Items
            </Badge>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {playlist.map((video, index) => (
                <button
                  key={video.id}
                  onClick={() => selectVideo(index)}
                  className={cn(
                    "w-full text-left p-3 rounded-xl transition-all group flex items-start space-x-3",
                    currentIndex === index 
                      ? "bg-indigo-600/20 border border-indigo-500/30" 
                      : "hover:bg-slate-800/50 border border-transparent"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-mono text-xs",
                    currentIndex === index ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-500"
                  )}>
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <p className={cn(
                      "text-xs font-bold truncate",
                      currentIndex === index ? "text-white" : "text-slate-300 group-hover:text-white"
                    )}>
                      {video.title}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                      {video.category}
                    </p>
                  </div>
                  {currentIndex === index && (
                    <div className="ml-auto">
                      <div className="flex space-x-0.5 items-end h-3">
                        <div className="w-0.5 bg-indigo-400 animate-bounce [animation-duration:0.8s]" />
                        <div className="w-0.5 bg-indigo-400 animate-bounce [animation-duration:0.6s]" />
                        <div className="w-0.5 bg-indigo-400 animate-bounce [animation-duration:1s]" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        </aside>
      </main>

      <footer className="p-4 border-t border-slate-800 bg-slate-900/50">
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default MasterPlayer;