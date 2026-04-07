"use client";

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth-context';
import { log } from '@/utils/logger';

export interface VideoProgressMap {
  [key: string]: {
    playback_time: number;
    duration: number;
    watch_count: number;
  };
}

export const useAllProgress = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['allVideoProgress', user?.id],
    queryFn: async () => {
      if (!user) return {};
      
      log(`[Persistence] Fetching all progress records for user`);
      
      const { data, error } = await supabase
        .from('video_progress')
        .select('video_id, playback_time, duration, watch_count')
        .eq('user_id', user.id);
      
      if (error) {
        log(`[Persistence] Error fetching all progress: ${error.message}`, null, 'error');
        throw error;
      }
      
      const map: VideoProgressMap = {};
      data?.forEach(record => {
        map[record.video_id] = {
          playback_time: record.playback_time,
          duration: record.duration,
          watch_count: record.watch_count
        };
      });
      
      return map;
    },
    enabled: !!user,
    refetchOnWindowFocus: true,
    staleTime: 30000, // Cache for 30 seconds
  });
};