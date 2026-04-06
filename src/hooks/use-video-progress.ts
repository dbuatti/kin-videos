"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth-context';

/**
 * Hook to manage video/audio playback progress.
 * @param progressKey The unique identifier for the progress (e.g., videoId or videoId + '-audio')
 */
export const useVideoProgress = (progressKey: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: progress, isLoading } = useQuery({
    queryKey: ['videoProgress', user?.id, progressKey],
    queryFn: async () => {
      if (!user || !progressKey) return 0;
      const { data, error } = await supabase
        .from('video_progress')
        .select('playback_time')
        .eq('user_id', user.id)
        .eq('video_id', progressKey)
        .maybeSingle();
      
      if (error) throw error;
      return data?.playback_time || 0;
    },
    enabled: !!user && !!progressKey,
  });

  const saveProgress = useMutation({
    mutationFn: async (currentTime: number) => {
      if (!user || !progressKey) return;
      
      const { error } = await supabase
        .from('video_progress')
        .upsert({
          user_id: user.id,
          video_id: progressKey,
          playback_time: currentTime,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,video_id' });

      if (error) throw error;
    },
    onSuccess: () => {
      // Optimistically update the cache
      queryClient.setQueryData(['videoProgress', user?.id, progressKey], (old: number) => old);
    }
  });

  return {
    progress,
    isLoading,
    saveProgress: saveProgress.mutate
  };
};