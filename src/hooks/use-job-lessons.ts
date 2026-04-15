import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Lesson } from '@/types/supabase';
import { useAuth } from '@/integrations/supabase/auth-context';
import { showSuccess, showError } from '@/utils/toast';

const fetchAllLessons = async (userId: string): Promise<Lesson[]> => {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  
  return data as Lesson[];
};

export const useJobLessons = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();

  const query = useQuery<Lesson[], Error>({
    queryKey: ['allLessons', userId],
    queryFn: () => fetchAllLessons(userId!),
    enabled: !!userId,
  });

  const deleteLesson = useMutation({
    mutationFn: async (lessonId: string) => {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allLessons'] });
      showSuccess("Lesson removed.");
    },
    onError: (error: any) => showError(error.message)
  });

  const cleanJunk = useMutation({
    mutationFn: async () => {
      if (!userId) return;
      
      // Find lessons that are likely junk:
      // 1. Title is just a number
      // 2. Title is "Page not found" or "REPLY"
      // 3. Category contains "Comment"
      const { data: junk, error: fetchError } = await supabase
        .from('lessons')
        .select('id, title, category')
        .eq('user_id', userId);
      
      if (fetchError) throw fetchError;

      const junkIds = junk
        .filter(l => {
          const title = (l.title || "").trim();
          const category = (l.category || "").toUpperCase();
          return (
            /^\d+$/.test(title) || 
            title.toUpperCase() === "PAGE NOT FOUND" || 
            title.toUpperCase() === "REPLY" ||
            category.includes("COMMENT")
          );
        })
        .map(l => l.id);

      if (junkIds.length === 0) return 0;

      const { error: deleteError } = await supabase
        .from('lessons')
        .delete()
        .in('id', junkIds);
      
      if (deleteError) throw deleteError;
      return junkIds.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['allLessons'] });
      if (count > 0) showSuccess(`Cleaned ${count} junk entries.`);
      else showSuccess("No junk entries found.");
    },
    onError: (error: any) => showError(error.message)
  });

  return {
    ...query,
    deleteLesson: deleteLesson.mutate,
    cleanJunk: cleanJunk.mutate,
    isCleaning: cleanJunk.isPending
  };
};