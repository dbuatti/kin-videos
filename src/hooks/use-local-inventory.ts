"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth-context';
import { showError, showSuccess } from '@/utils/toast';

export interface LocalFile {
  id: string;
  file_name: string;
  raw_line: string;
}

export const useLocalInventory = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['localFiles', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('local_files')
        .select('*')
        .eq('user_id', user?.id);
      
      if (error) throw error;
      return data as LocalFile[];
    },
    enabled: !!user,
  });

  const syncMutation = useMutation({
    mutationFn: async (lines: string[]) => {
      if (!user) return;

      // Clear existing inventory for this user
      await supabase.from('local_files').delete().eq('user_id', user.id);

      // Insert new inventory
      const toInsert = lines
        .filter(line => line.trim().length > 0)
        .map(line => {
          // Extract filename from path if it's a path
          const parts = line.split('/');
          const fileName = parts[parts.length - 1];
          return {
            user_id: user.id,
            file_name: fileName,
            raw_line: line
          };
        });

      if (toInsert.length > 0) {
        const { error } = await supabase.from('local_files').insert(toInsert);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['localFiles'] });
      showSuccess("Local inventory synced successfully!");
    },
    onError: (error: any) => {
      showError("Failed to sync inventory: " + error.message);
    }
  });

  return {
    ...query,
    syncInventory: syncMutation.mutate,
    isSyncing: syncMutation.isPending
  };
};