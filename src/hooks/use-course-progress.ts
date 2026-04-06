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
        .select('video_id, playback_time, duration')
        .eq('user_id', user.id);

      if (error) throw error;

      const videoLessons = lessons.filter(l => l.video_url);
      const totalVideos = videoLessons.length;
      
      if (totalVideos === 0) return { percentage: 0, watchedCount: 0, totalCount: 0 };

      // A video is "watched" if it's > 90% complete
      const watchedVideos = progressData?.filter(p => {
        if (!p.duration || p.duration === 0) return false;
        return (p.playback_time / p.duration) > 0.9;
      }) || [];

      const percentage = Math.round((watchedVideos.length / totalVideos) * 100);

      return {
        percentage,
        watchedCount: watchedVideos.length,
        totalCount: totalVideos
      };
    },
    enabled: !!user && !!lessons,
  });
};