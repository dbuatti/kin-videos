"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth-context';
import { showSuccess } from '@/utils/toast';

export const usePlaybackSpeed = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: speed = 1.0, isLoading } = useQuery({
    queryKey: ['playbackSpeed', user?.id],
    queryFn: async () => {
      if (!user) return 1.0;
      
      console.log(`[Persistence] Fetching global playback speed...`);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('playback_speed')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error(`[Persistence] Error fetching playback speed:`, error);
        throw error;
      }
      
      const result = data?.playback_speed || 1.0;
      console.log(`[Persistence] Loaded global playback speed: ${result}x`);
      return result;
    },
    enabled: !!user,
  });

  const updateSpeed = useMutation({
    mutationFn: async (newSpeed: number) => {
      if (!user) return;
      
      console.log(`[Persistence] Saving global playback speed: ${newSpeed}x`);
      
      const { error } = await supabase
        .from('profiles')
        .update({ playback_speed: newSpeed })
        .eq('id', user.id);
      
      if (error) {
        console.error(`[Persistence] Error saving playback speed:`, error);
        throw error;
      }
    },
    onSuccess: (_, newSpeed) => {
      queryClient.setQueryData(['playbackSpeed', user?.id], newSpeed);
      showSuccess(`Playback speed set to ${newSpeed}x`);
    }
  });

  return {
    speed,
    isLoading,
    setSpeed: updateSpeed.mutate
  };
};