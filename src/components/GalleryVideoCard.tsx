"use client";

import React, { useState } from 'react';
import { Play, Download, ExternalLink, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import VideoPlayer from '@/components/VideoPlayer';
import VideoProgressIndicator from '@/components/VideoProgressIndicator';
import { downloadFile } from '@/utils/download';
import { useJobLessons } from '@/hooks/use-job-lessons';

interface GalleryVideoCardProps {
  video: any;
}

const GalleryVideoCard: React.FC<GalleryVideoCardProps> = ({ video }) => {
  const [isPlayerActive, setIsPlayerActive] = useState(false);
  const { deleteLesson } = useJobLessons();

  const getThumbnailUrl = (videoUrl: string | null) => {
    if (!videoUrl) return "/placeholder.svg";
    if (videoUrl.includes('wistia.com/deliveries/')) {
      return videoUrl.replace('.mp4', '.jpg') + '?image_crop_resized=640x360';
    }
    return "/placeholder.svg";
  };

  return (
    <Card className={cn(
      "overflow-hidden border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all group rounded-2xl relative",
      video.isPriority && "ring-1 ring-amber-500/30 bg-amber-500/[0.02]"
    )}>
      {video.isPriority && (
        <div className="absolute top-3 left-3 z-10">
          <Badge className="bg-amber-500 text-white border-none text-[9px] font-black uppercase tracking-widest px-2 py-0.5 shadow-lg">
            <Star className="w-2.5 h-2.5 mr-1 fill-white" />
            Priority
          </Badge>
        </div>
      )}

      <div className="aspect-video relative bg-slate-950 overflow-hidden">
        {isPlayerActive ? (
          <VideoPlayer 
            videoUrl={video.video_url!}
            videoId={video.id}
            title={video.title || ''}
            category={video.category || ''}
            autoPlay={true}
            className="w-full h-full"
          />
        ) : (
          <div className="relative w-full h-full group/thumb cursor-pointer" onClick={() => setIsPlayerActive(true)}>
            <img 
              src={getThumbnailUrl(video.video_url)} 
              alt={video.title}
              className="w-full h-full object-cover opacity-60 group-hover/thumb:opacity-40 transition-opacity"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-primary/80 flex items-center justify-center text-white shadow-xl transform group-hover/thumb:scale-110 transition-transform">
                <Play className="w-6 h-6 fill-current ml-1" />
              </div>
            </div>
          </div>
        )}
      </div>

      <CardHeader className="p-5">
        <div className="flex justify-between items-start gap-4 mb-4">
          <CardTitle className={cn(
            "text-sm font-bold line-clamp-2 leading-snug transition-colors",
            video.isPriority ? "text-amber-400" : "text-white group-hover:text-primary"
          )}>
            {video.title}
          </CardTitle>
          <div className="flex items-center space-x-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-slate-500 hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                downloadFile(video.video_url!, video.expectedFilename);
              }}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-white">
              <a href={video.lesson_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-slate-500 hover:text-red-400"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete "${video.title}"?`)) deleteLesson(video.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <VideoProgressIndicator videoId={video.id} />
      </CardHeader>
    </Card>
  );
};

export default GalleryVideoCard;