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

      // Fetch the most recent progress record that isn't an internal state key
      const { data, error } = await supabase
        .from('video_progress')
        .select('video_id, playback_time, duration, updated_at')
        .eq('user_id', user.id)
        .not('video_id', 'ilike', 'master-player-%') // Ignore player state keys
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      // Strip the -audio suffix if it exists to find the original lesson metadata
      const cleanId = data.video_id.replace('-audio', '');
      const lesson = lessons.find(l => l.id === cleanId);
      
      if (!lesson) return null;

      const isAudio = data.video_id.endsWith('-audio');

      return {
        ...lesson,
        isAudio,
        progress: data.playback_time,
        duration: data.duration,
        percentage: data.duration > 0 ? Math.min(Math.round((data.playback_time / data.duration) * 100), 100) : 0
      };
    },
    enabled: !!user && !!lessons,
  });
};