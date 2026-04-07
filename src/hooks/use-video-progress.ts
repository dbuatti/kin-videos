"use client";

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth-context';
import { log } from '@/utils/logger';

export interface VideoProgressData {
  playback_time: number;
  duration: number;
  watch_count: number;
}

/**
 * Hook to manage video/audio playback progress and watch counts.
 */
export const useVideoProgress = (progressKey: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: progress, isLoading } = useQuery({
    queryKey: ['videoProgress', user?.id, progressKey],
    queryFn: async () => {
      if (!user || !progressKey) return { playback_time: 0, duration: 0, watch_count: 0 };
      
      log(`[Persistence] Fetching progress for key: ${progressKey}`);
      
      const { data, error } = await supabase
        .from('video_progress')
        .select('playback_time, duration, watch_count')
        .eq('user_id', user.id)
        .eq('video_id', progressKey)
        .maybeSingle();
      
      if (error) {
        log(`[Persistence] Error fetching progress for ${progressKey}: ${error.message}`, null, 'error');
        throw error;
      }
      
      log(`[Persistence] Received data for ${progressKey}:`, data);
      
      return { 
        playback_time: Number(data?.playback_time ?? 0), 
        duration: Number(data?.duration ?? 0),
        watch_count: Number(data?.watch_count ?? 0)
      } as VideoProgressData;
    },
    enabled: !!user && !!progressKey,
    staleTime: 0,
  });

  const saveMutation = useMutation({
    mutationFn: async ({ currentTime, duration }: { currentTime: number, duration?: number }) => {
      if (!user || !progressKey) return;
      
      log(`[Persistence] Saving progress for ${progressKey}: ${currentTime.toFixed(2)}s`);
      
      const upsertData: any = {
        user_id: user.id,
        video_id: progressKey,
        playback_time: currentTime,
        updated_at: new Date().toISOString(),
      };

      if (duration !== undefined && duration > 0) {
        upsertData.duration = duration;
      }

      const { error } = await supabase
        .from('video_progress')
        .upsert(upsertData, { onConflict: 'user_id,video_id' });

      if (error) {
        log(`[Persistence] Error saving progress for ${progressKey}: ${error.message}`, null, 'error');
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.setQueryData(['videoProgress', user?.id, progressKey], (old: any) => {
        return { 
          ...old, 
          playback_time: variables.currentTime,
          duration: variables.duration || old?.duration || 0
        };
      });
    }
  });

  const incrementWatchMutation = useMutation({
    mutationFn: async () => {
      if (!user || !progressKey) return;
      
      log(`[Persistence] Incrementing watch count for ${progressKey}`);
      
      // Get current count first
      const { data } = await supabase
        .from('video_progress')
        .select('watch_count')
        .eq('user_id', user.id)
        .eq('video_id', progressKey)
        .maybeSingle();
      
      const newCount = (data?.watch_count || 0) + 1;

      const { error } = await supabase
        .from('video_progress')
        .upsert({
          user_id: user.id,
          video_id: progressKey,
          watch_count: newCount,
          playback_time: 0, // Reset progress when finished
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,video_id' });

      if (error) throw error;
      return newCount;
    },
    onSuccess: (newCount) => {
      queryClient.setQueryData(['videoProgress', user?.id, progressKey], (old: any) => {
        return { ...old, watch_count: newCount, playback_time: 0 };
      });
    }
  });

  const saveProgress = useCallback((currentTime: number, duration?: number) => {
    saveMutation.mutate({ currentTime, duration });
  }, [saveMutation.mutate]);

  const incrementWatchCount = useCallback(() => {
    incrementWatchMutation.mutate();
  }, [incrementWatchMutation.mutate]);

  return {
    progress: progress?.playback_time || 0,
    duration: progress?.duration || 0,
    watchCount: progress?.watch_count || 0,
    isLoading,
    saveProgress,
    incrementWatchCount
  };
};