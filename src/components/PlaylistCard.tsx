"use client";

import React, { useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ListMusic } from 'lucide-react';
import { cn } from '@/lib/utils';
import VideoProgressIndicator from './VideoProgressIndicator';
import { Lesson } from '@/types/supabase';

interface PlaylistCardProps {
  playlist: Lesson[];
  currentIndex: number;
  onSelectVideo: (index: number) => void;
  isAudioOnly: boolean;
  className?: string;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ 
  playlist, 
  currentIndex, 
  onSelectVideo, 
  isAudioOnly,
  className 
}) => {
  const activeItemRef = useRef<HTMLButtonElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Automatically scroll the active item into view whenever the index changes
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentIndex]);

  return (
    <Card className={cn("flex flex-col bg-slate-900/50 border-slate-800 overflow-hidden shadow-2xl", className)}>
      <CardHeader className="p-4 border-b border-slate-800 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-bold flex items-center text-slate-200">
          <ListMusic className="w-4 h-4 mr-2 text-indigo-400" />
          Course Playlist
        </CardTitle>
        <Badge variant="outline" className="border-slate-700 text-slate-500 font-mono text-[10px]">
          {playlist.length} ITEMS
        </Badge>
      </CardHeader>
      
      <ScrollArea className="flex-1 h-full" ref={scrollAreaRef}>
        <div className="p-2 space-y-1">
          {playlist.map((video, index) => (
            <button
              key={video.id}
              ref={currentIndex === index ? activeItemRef : null}
              onClick={() => onSelectVideo(index)}
              className={cn(
                "w-full text-left p-3 rounded-xl transition-all group flex flex-col space-y-2",
                currentIndex === index 
                  ? "bg-indigo-600/20 border border-indigo-500/30" 
                  : "hover:bg-slate-800/50 border border-transparent"
              )}
            >
              <div className="flex items-start space-x-3 w-full">
                <div className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-mono text-[10px] font-bold",
                  currentIndex === index ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-50"
                )}>
                  {(index + 1).toString().padStart(2, '0')}
                </div>
                <div className="min-w-0 flex-1">
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
              </div>
              
              <VideoProgressIndicator 
                videoId={isAudioOnly ? `${video.id}-audio` : video.id} 
                className="w-full px-1" 
              />
            </button>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default PlaylistCard;