"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth-context';
import { showSuccess, showError } from '@/utils/toast';

export const usePlaybackSpeed = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: speed = 1.0, isLoading } = useQuery({
    queryKey: ['playbackSpeed', user?.id],
    queryFn: async () => {
      if (!user) return 1.0;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('playback_speed')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data?.playback_speed || 1.0;
    },
    enabled: !!user,
    staleTime: Infinity,
  });

  const updateSpeed = useMutation({
    mutationFn: async (newSpeed: number) => {
      if (!user) return;
      
      console.log(`[Speed] Saving speed preference: ${newSpeed}x`);
      
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id, 
          playback_speed: newSpeed,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      
      if (error) throw error;
    },
    onSuccess: (_, newSpeed) => {
      queryClient.setQueryData(['playbackSpeed', user?.id], newSpeed);
      showSuccess(`Playback speed set to ${newSpeed}x`);
    },
    onError: (error: any) => {
      console.error("[Speed] Save error:", error);
      showError("Failed to save playback speed preference.");
    }
  });

  return {
    speed,
    isLoading,
    setSpeed: updateSpeed.mutate
  };
};