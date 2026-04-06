"use client";

import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCrawlerJobs } from '@/hooks/use-crawler-jobs';
import { useJobLessons } from '@/hooks/use-job-lessons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, 
  PlayCircle, 
  Search, 
  LayoutGrid, 
  List,
  ExternalLink,
  Video
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MODULE_ORDER } from '@/utils/filenames';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { cn } from '@/lib/utils';

const VideoGallery = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  
  const { data: jobs } = useCrawlerJobs();
  const latestJob = useMemo(() => jobs?.find(j => j.status === 'completed'), [jobs]);
  const { data: lessons, isLoading } = useJobLessons(latestJob?.id || null);
  
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const videoLessons = useMemo(() => {
    if (!lessons) return [];
    
    return lessons
      .filter(l => l.video_url)
      .sort((a, b) => {
        const indexA = MODULE_ORDER.indexOf(a.category || '');
        const indexB = MODULE_ORDER.indexOf(b.category || '');
        return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
      });
  }, [lessons]);

  const filteredVideos = useMemo(() => {
    return videoLessons.filter(v => 
      v.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [videoLessons, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b pb-4 border-indigo-100">
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/library')}
            className="rounded-full hover:bg-indigo-50 text-indigo-600"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-2xl font-extrabold text-indigo-900 tracking-tight flex items-center">
              <Video className="w-6 h-6 mr-2 text-indigo-600" />
              Foundations Video Library
            </h1>
            <p className="text-xs text-indigo-400 font-medium ml-8">Functional Neuro Approach</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search videos..." 
              className="pl-10 rounded-xl border-indigo-100 focus-visible:ring-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex border border-indigo-100 rounded-xl overflow-hidden bg-white">
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("rounded-none h-10 w-10", viewMode === 'grid' ? "bg-indigo-50 text-indigo-600" : "text-gray-400")}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("rounded-none h-10 w-10", viewMode === 'list' ? "bg-indigo-50 text-indigo-600" : "text-gray-400")}
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredVideos.length > 0 ? (
          <div className={cn(
            "grid gap-6",
            viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
          )}>
            {filteredVideos.map((video) => (
              <Card key={video.id} className="overflow-hidden border-indigo-100 shadow-md hover:shadow-lg transition-shadow bg-white group">
                <div className="aspect-video bg-slate-900 relative overflow-hidden">
                  <video 
                    src={video.video_url!} 
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                    controls
                    preload="none"
                    poster="/placeholder.svg"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:hidden">
                    <PlayCircle className="w-12 h-12 text-white opacity-80" />
                  </div>
                </div>
                <CardHeader className="p-4">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <Badge variant="secondary" className="mb-2 text-[10px] bg-indigo-50 text-indigo-600 border-indigo-100">
                        {video.category}
                      </Badge>
                      <CardTitle className="text-sm font-bold text-indigo-900 line-clamp-2">
                        {video.title}
                      </CardTitle>
                    </div>
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-indigo-400 hover:text-indigo-600 shrink-0">
                      <a href={video.lesson_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-indigo-200">
            <Video className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No videos found matching your search.</p>
          </div>
        )}
      </main>

      <footer className="mt-12">
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default VideoGallery;