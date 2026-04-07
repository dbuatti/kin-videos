"use client";

import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useJobLessons } from '@/hooks/use-job-lessons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Search, 
  Video,
  Download,
  X,
  ExternalLink
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MODULE_ORDER, generateLessonFilename } from '@/utils/filenames';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { cn } from '@/lib/utils';
import VideoPlayer from '@/components/VideoPlayer';
import VideoProgressIndicator from '@/components/VideoProgressIndicator';
import { downloadFile } from '@/utils/download';
import LessonSkeleton from '@/components/LessonSkeleton';
import PlaybackSpeedControl from '@/components/PlaybackSpeedControl';

const VideoGallery = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  
  const { data: lessons, isLoading } = useJobLessons();
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  const getThumbnailUrl = (videoUrl: string | null) => {
    if (!videoUrl) return "/placeholder.svg";
    if (videoUrl.includes('wistia.com/deliveries/')) {
      return videoUrl.replace('.mp4', '.jpg') + '?image_crop_resized=640x360';
    }
    return "/placeholder.svg";
  };

  const groupedVideos = useMemo(() => {
    if (!lessons) return [];
    
    const videoOnly = lessons.filter(l => l.video_url);
    
    const grouped = videoOnly.reduce((acc, lesson) => {
      const category = lesson.category || 'Uncategorized';
      if (!acc[category]) acc[category] = [];
      acc[category].push(lesson);
      return acc;
    }, {} as Record<string, typeof videoOnly>);

    const sortedCategories = Object.keys(grouped).sort((a, b) => {
      const indexA = MODULE_ORDER.indexOf(a);
      const indexB = MODULE_ORDER.indexOf(b);
      return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
    });

    return sortedCategories.map((category, catIdx) => ({
      category,
      videos: grouped[category].filter(v => 
        v.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.toLowerCase().includes(searchQuery.toLowerCase())
      ).map((v, lesIdx) => ({
        ...v,
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
                  <Card key={video.id} className="overflow-hidden border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all group rounded-2xl">
                    <VideoPlayer 
                      videoUrl={video.video_url!}
                      videoId={video.id}
                      title={video.title || ''}
                      category={video.category || ''}
                      posterUrl={getThumbnailUrl(video.video_url)}
                      className="aspect-video"
                    />
                    <CardHeader className="p-5">
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <CardTitle className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                          {video.title}
                        </CardTitle>
                        <div className="flex items-center space-x-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-500 hover:text-white"
                            onClick={() => downloadFile(video.video_url!, video.expectedFilename)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-white">
                            <a href={video.lesson_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                      <VideoProgressIndicator videoId={video.id} />
                    </CardHeader>
                  </Card>
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