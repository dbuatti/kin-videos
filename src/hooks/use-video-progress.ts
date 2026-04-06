"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth-context';

export const useVideoProgress = (videoId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: progress, isLoading } = useQuery({
    queryKey: ['videoProgress', user?.id, videoId],
    queryFn: async () => {
      if (!user) return 0;
      const { data, error } = await supabase
        .from('video_progress')
        .select('playback_time')
        .eq('user_id', user.id)
        .eq('video_id', videoId)
        .maybeSingle();
      
      if (error) throw error;
      return data?.playback_time || 0;
    },
    enabled: !!user && !!videoId,
  });

  const saveProgress = useMutation({
    mutationFn: async (currentTime: number) => {
      if (!user) return;
      
      const { error } = await supabase
        .from('video_progress')
        .upsert({
          user_id: user.id,
          video_id: videoId,
          playback_time: currentTime,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,video_id' });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.setQueryData(['videoProgress', user?.id, videoId], (old: number) => old);
    }
  });

  return {
    progress,
    isLoading,
    saveProgress: saveProgress.mutate
  };
};