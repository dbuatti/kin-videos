"use client";

import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useJobLessons } from '@/hooks/use-job-lessons';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Search, 
  Video,
  X
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getCategoryIndex, generateLessonFilename } from '@/utils/filenames';
import { isPriorityLesson } from '@/utils/priority';
import { MadeWithDyad } from '@/components/made-with-dyad';
import LessonSkeleton from '@/components/LessonSkeleton';
import PlaybackSpeedControl from '@/components/PlaybackSpeedControl';
import GalleryVideoCard from '@/components/GalleryVideoCard';

const VideoGallery = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  
  const { data: lessons, isLoading } = useJobLessons();
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  const groupedVideos = useMemo(() => {
    if (!lessons) return [];
    
    const videoOnly = lessons.filter(l => l.video_url);
    
    const grouped = videoOnly.reduce((acc, lesson) => {
      const category = lesson.category || 'Uncategorized';
      if (!acc[category]) acc[category] = [];
      acc[category].push(lesson);
      return acc;
    }, {} as Record<string, typeof videoOnly>);

    const allCategories = Object.keys(grouped);
    const sortedCategories = [...allCategories].sort((a, b) => {
      return getCategoryIndex(a, allCategories) - getCategoryIndex(b, allCategories);
    });

    return sortedCategories.map((category, catIdx) => ({
      category,
      videos: grouped[category].filter(v => 
        v.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.toLowerCase().includes(searchQuery.toLowerCase())
      ).map((v, lesIdx) => ({
        ...v,
        isPriority: isPriorityLesson(v.title),
        expectedFilename: generateLessonFilename(catIdx + 1, lesIdx + 1, category, v.title || 'Untitled')
      }))
    })).filter(group => group.videos.length > 0);
  }, [lessons, searchQuery]);

  return (
    <div className="min-h-screen bg-background p-6 sm:p-12 max-w-7xl mx-auto w-full">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/')}
            className="rounded-full hover:bg-white/5 text-slate-400"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center">
              <Video className="w-6 h-6 mr-3 text-primary" />
              Library
            </h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Browse all lessons</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input 
              placeholder="Search lessons..." 
              className="pl-11 pr-11 rounded-2xl border-white/5 bg-white/5 h-12 text-sm focus-visible:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <PlaybackSpeedControl className="border-white/5 bg-white/5 text-slate-400 h-12 px-4" />
        </div>
      </header>

      <main className="space-y-16">
        {isLoading ? (
          <LessonSkeleton />
        ) : groupedVideos.length > 0 ? (
          groupedVideos.map((group) => (
            <section key={group.category} className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h2 className="text-sm font-black text-slate-400 tracking-widest uppercase">
                  {group.category}
                </h2>
                <Badge variant="outline" className="bg-white/5 text-slate-500 border-none px-3 py-1 text-[10px] font-bold">
                  {group.videos.length} Lessons
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.videos.map((video) => (
                  <GalleryVideoCard key={video.id} video={video} />
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="text-center py-24 bg-white/5 rounded-[2rem] border-2 border-dashed border-white/5">
            <Video className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No lessons found.</p>
          </div>
        )}
      </main>

      <footer className="mt-24 opacity-50">
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default VideoGallery;