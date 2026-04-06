"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useJobLessons } from '@/hooks/use-job-lessons';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  SkipForward, 
  SkipBack, 
  Headphones,
  Video,
  Zap,
  Loader2,
  Music,
  ListMusic
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MODULE_ORDER, VERIFIED_LESSON_ORDER } from '@/utils/filenames';
import VideoPlayer from '@/components/VideoPlayer';
import PlaylistCard from '@/components/PlaylistCard';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { cn } from '@/lib/utils';
import { showSuccess } from '@/utils/toast';
import { useVideoProgress } from '@/hooks/use-video-progress';
import PlaybackSpeedControl from '@/components/PlaybackSpeedControl';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

const MasterPlayer = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: lessons, isLoading } = useJobLessons();
  
  const initialMode = searchParams.get('mode') === 'audio';
  const [isAudioOnly, setIsAudioOnly] = useState(initialMode);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);

  useEffect(() => {
    const mode = isAudioOnly ? 'audio' : 'video';
    if (searchParams.get('mode') !== mode) {
      setSearchParams({ mode });
    }
  }, [isAudioOnly, setSearchParams]);

  const masterStateKey = isAudioOnly ? 'master-player-audio-index' : 'master-player-video-index';
  const { progress: savedIndex, saveProgress: saveMasterIndex, isLoading: isStateLoading } = useVideoProgress(masterStateKey);

  const playlist = useMemo(() => {
    if (!lessons) return [];
    const videoOnly = lessons.filter(l => l.video_url);
    
    return videoOnly.sort((a, b) => {
      const indexA = VERIFIED_LESSON_ORDER.indexOf(a.lesson_url);
      const indexB = VERIFIED_LESSON_ORDER.indexOf(b.lesson_url);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      
      const catA = a.category || 'Uncategorized';
      const catB = b.category || 'Uncategorized';
      const catIndexA = MODULE_ORDER.indexOf(catA);
      const catIndexB = MODULE_ORDER.indexOf(catB);
      if (catIndexA !== catIndexB) return (catIndexA === -1 ? Infinity : catIndexA) - (catIndexB === -1 ? Infinity : catIndexB);
      
      return (a.title || '').localeCompare(b.title || '');
    });
  }, [lessons]);

  useEffect(() => {
    if (!isStateLoading && isInitialLoad && playlist.length > 0) {
      const indexToLoad = Math.floor(savedIndex);
      if (indexToLoad >= 0 && indexToLoad < playlist.length) {
        setCurrentIndex(indexToLoad);
      }
      setIsInitialLoad(false);
    }
  }, [isStateLoading, savedIndex, playlist, isInitialLoad]);

  const lastSavedIndex = useRef<number>(-1);
  useEffect(() => {
    if (!isInitialLoad && currentIndex !== lastSavedIndex.current) {
      saveMasterIndex(currentIndex);
      lastSavedIndex.current = currentIndex;
    }
  }, [currentIndex, isInitialLoad, saveMasterIndex]);

  const currentVideo = playlist[currentIndex];

  const handleNext = () => {
    if (currentIndex < playlist.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setAutoPlay(true);
    } else {
      showSuccess("You've reached the end of the course!");
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setAutoPlay(true);
    }
  };

  const selectVideo = (index: number) => {
    setCurrentIndex(index);
    setAutoPlay(true);
    if (isMobile) setIsPlaylistOpen(false);
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
        <p className="text-center max-w-md mb-6">Make sure your course data is synced.</p>
        <Button onClick={() => navigate('/')} variant="outline" className="border-slate-700">Return to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col">
      <header className="p-3 sm:p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center space-x-2 sm:x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-full hover:bg-slate-800 text-slate-400 h-9 w-9">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-lg font-bold text-indigo-400 flex items-center truncate">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 shrink-0" />
              <span className="truncate">{isAudioOnly ? "Audio Stitcher" : "Video Stitcher"}</span>
            </h1>
            <p className="hidden sm:block text-[10px] text-slate-500 uppercase font-bold tracking-widest">
              Independent Progress Tracking
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <PlaybackSpeedControl className="border-slate-700 text-slate-300 hover:bg-slate-800 h-9" />
          
          {isMobile && (
            <Sheet open={isPlaylistOpen} onOpenChange={setIsPlaylistOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-xl border-slate-700 bg-slate-900 text-indigo-400 h-9 w-9">
                  <ListMusic className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh] p-0 bg-slate-950 border-slate-800">
                <SheetHeader className="p-4 border-b border-slate-800">
                  <SheetTitle className="text-slate-200 flex items-center">
                    <ListMusic className="w-5 h-5 mr-2 text-indigo-400" />
                    Course Playlist
                  </SheetTitle>
                </SheetHeader>
                <PlaylistCard 
                  playlist={playlist}
                  currentIndex={currentIndex}
                  onSelectVideo={selectVideo}
                  isAudioOnly={isAudioOnly}
                  className="h-full rounded-none border-none bg-transparent"
                />
              </SheetContent>
            </Sheet>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsAudioOnly(!isAudioOnly);
              setIsInitialLoad(true);
            }}
            className={cn(
              "rounded-xl border-slate-700 transition-all h-9",
              isAudioOnly ? "bg-indigo-600 text-white border-indigo-500" : "bg-slate-900 text-slate-400"
            )}
          >
            {isAudioOnly ? <Headphones className="w-4 h-4 sm:mr-2" /> : <Video className="w-4 h-4 sm:mr-2" />}
            <span className="hidden sm:inline">{isAudioOnly ? "Switch to Video" : "Switch to Audio"}</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 flex flex-col p-3 sm:p-4 lg:p-8 justify-start items-center bg-black/40 overflow-y-auto">
          <div className="w-full max-w-5xl aspect-video rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900 relative">
            {isAudioOnly && (
              <div className="absolute inset-0 z-10 flex flex-col items-center space-y-4 sm:space-y-6 text-center p-4 sm:p-8 w-full h-full justify-center bg-gradient-to-b from-slate-900 to-indigo-950/90 backdrop-blur-sm pointer-events-none">
                <div className="relative">
                  <div className="w-24 h-24 sm:w-40 h-40 bg-indigo-600/10 rounded-full flex items-center justify-center animate-pulse border border-indigo-500/20">
                    <Music className="w-12 h-12 sm:w-20 sm:h-20 text-indigo-500" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 bg-indigo-600 p-1.5 sm:p-2 rounded-lg shadow-lg">
                    <Headphones className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                </div>
                <div className="max-w-md">
                  <Badge variant="outline" className="mb-2 sm:mb-4 border-indigo-500/30 text-indigo-400 bg-indigo-500/5 text-[10px] sm:text-xs">{currentVideo?.category}</Badge>
                  <h2 className="text-xl sm:text-3xl font-black text-white mb-1 sm:mb-2 tracking-tight line-clamp-2">{currentVideo?.title}</h2>
                  <p className="text-slate-400 text-[10px] sm:text-sm font-medium">Virtual Audio Stitcher Mode</p>
                </div>
                <div className="flex items-center space-x-1 h-6 sm:h-8">
                  {[...Array(isMobile ? 8 : 12)].map((_, i) => (
                    <div key={i} className="w-1 bg-indigo-500 rounded-full animate-bounce" style={{ height: `${30 + Math.random() * 70}%`, animationDuration: `${0.5 + Math.random()}s`, animationDelay: `${Math.random()}s` }} />
                  ))}
                </div>
              </div>
            )}
            <VideoPlayer 
              videoUrl={currentVideo?.video_url || ''} 
              videoId={currentVideo?.id || ''} 
              progressKey={isAudioOnly ? `${currentVideo?.id}-audio` : currentVideo?.id}
              className="w-full h-full"
              onEnded={handleNext}
              autoPlay={autoPlay}
            />
          </div>

          <div className="mt-6 sm:mt-8 flex items-center space-x-4 sm:space-x-6 pb-8 sm:pb-12 w-full max-w-md justify-center">
            <Button variant="ghost" size="icon" onClick={handlePrevious} disabled={currentIndex === 0} className="h-10 w-10 sm:h-12 sm:w-12 rounded-full hover:bg-slate-800 text-slate-400 shrink-0">
              <SkipBack className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
            <div className="text-center min-w-0 flex-1">
              <p className="text-[10px] text-slate-500 font-bold uppercase mb-0.5 sm:mb-1">Now {isAudioOnly ? 'Listening' : 'Watching'}</p>
              <h3 className="text-sm sm:text-lg font-bold text-white truncate">{currentVideo?.title}</h3>
              <p className="text-[10px] text-indigo-400 font-medium mt-0.5 sm:mt-1">Lesson {currentIndex + 1} of {playlist.length}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleNext} disabled={currentIndex === playlist.length - 1} className="h-10 w-10 sm:h-12 sm:w-12 rounded-full hover:bg-slate-800 text-slate-400 shrink-0">
              <SkipForward className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
          </div>
        </div>

        {!isMobile && (
          <aside className="w-full lg:w-96 p-4 lg:p-0 lg:border-l border-slate-800 bg-slate-900/30 flex flex-col">
            <PlaylistCard 
              playlist={playlist}
              currentIndex={currentIndex}
              onSelectVideo={selectVideo}
              isAudioOnly={isAudioOnly}
              className="h-full lg:rounded-none lg:border-none"
            />
          </aside>
        )}
      </main>
      <footer className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900/50">
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default MasterPlayer;