"use client";

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth-context';
import { useJobLessons } from './use-job-lessons';

export const useCourseProgress = () => {
  const { user } = useAuth();
  const { data: lessons } = useJobLessons();

  return useQuery({
    queryKey: ['courseCompletion', user?.id],
    queryFn: async () => {
      if (!user || !lessons) return { percentage: 0, watchedCount: 0, totalCount: 0 };

      const { data: progressData, error } = await supabase
        .from('video_progress')
        .select('video_id, playback_time, duration, watch_count')
        .eq('user_id', user.id);

      if (error) throw error;

      const videoLessons = lessons.filter(l => l.video_url);
      const totalVideos = videoLessons.length;
      
      if (totalVideos === 0) return { percentage: 0, watchedCount: 0, totalCount: 0 };

      // A lesson is "completed" if either its video OR its audio version is watched
      const completedLessonIds = new Set<string>();

      progressData?.forEach(p => {
        const cleanId = p.video_id.replace('-audio', '');
        const isWatched = p.watch_count > 0 || (p.duration > 0 && (p.playback_time / p.duration) > 0.9);
        
        if (isWatched) {
          completedLessonIds.add(cleanId);
        }
      });

      const watchedCount = Array.from(completedLessonIds).filter(id => 
        videoLessons.some(l => l.id === id)
      ).length;

      const percentage = Math.round((watchedCount / totalVideos) * 100);

      return {
        percentage,
        watchedCount,
        totalCount: totalVideos
      };
    },
    enabled: !!user && !!lessons,
  });
};