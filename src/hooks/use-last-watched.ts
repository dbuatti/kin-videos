"use client";

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth-context';
import { useJobLessons } from './use-job-lessons';

export const useLastWatched = () => {
  const { user } = useAuth();
  const { data: lessons } = useJobLessons();

  return useQuery({
    queryKey: ['lastWatched', user?.id],
    queryFn: async () => {
      if (!user || !lessons) return null;

      const { data, error } = await supabase
        .from('video_progress')
        .select('video_id, playback_time, duration, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      // Find the corresponding lesson object
      const lesson = lessons.find(l => l.id === data.video_id);
      if (!lesson) return null;

      return {
        ...lesson,
        progress: data.playback_time,
        duration: data.duration,
        percentage: Math.min(Math.round((data.playback_time / data.duration) * 100), 100)
      };
    },
    enabled: !!user && !!lessons,
  });
};