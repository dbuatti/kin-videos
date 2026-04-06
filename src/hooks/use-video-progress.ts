"use client";

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth-context';

export interface VideoProgressData {
  playback_time: number;
  duration: number;
}

/**
 * Hook to manage video/audio playback progress.
 */
export const useVideoProgress = (progressKey: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: progress, isLoading } = useQuery({
    queryKey: ['videoProgress', user?.id, progressKey],
    queryFn: async () => {
      if (!user || !progressKey) return { playback_time: 0, duration: 0 };
      
      const { data, error } = await supabase
        .from('video_progress')
        .select('playback_time, duration')
        .eq('user_id', user.id)
        .eq('video_id', progressKey)
        .maybeSingle();
      
      if (error) {
        console.error(`[Persistence] Error fetching progress for ${progressKey}:`, error);
        throw error;
      }
      
      return { 
        playback_time: data?.playback_time || 0, 
        duration: data?.duration || 0 
      } as VideoProgressData;
    },
    enabled: !!user && !!progressKey,
    staleTime: 30000,
  });

  const saveMutation = useMutation({
    mutationFn: async ({ currentTime, duration }: { currentTime: number, duration?: number }) => {
      if (!user || !progressKey) return;
      
      const upsertData: any = {
        user_id: user.id,
        video_id: progressKey,
        playback_time: currentTime,
        updated_at: new Date().toISOString(),
      };

      if (duration !== undefined && duration > 0) {
        upsertData.duration = duration;
      }

      console.log(`[Persistence] Saving progress for ${progressKey}: ${currentTime}s`);

      const { error } = await supabase
        .from('video_progress')
        .upsert(upsertData, { onConflict: 'user_id,video_id' });

      if (error) {
        console.error(`[Persistence] Error saving progress for ${progressKey}:`, error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      // Correctly update the cache with the NEW values from the mutation
      queryClient.setQueryData(['videoProgress', user?.id, progressKey], (old: any) => {
        return { 
          ...old, 
          playback_time: variables.currentTime,
          duration: variables.duration || old?.duration || 0
        };
      });
    }
  });

  const saveProgress = useCallback((currentTime: number, duration?: number) => {
    saveMutation.mutate({ currentTime, duration });
  }, [saveMutation.mutate]);

  return {
    progress: progress?.playback_time || 0,
    duration: progress?.duration || 0,
    isLoading,
    saveProgress
  };
};