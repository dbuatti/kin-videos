import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Lesson } from '@/types/supabase';
import { useAuth } from '@/integrations/supabase/auth-context';

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

  return useQuery<Lesson[], Error>({
    queryKey: ['allLessons', userId],
    queryFn: () => fetchAllLessons(userId!),
    enabled: !!userId,
  });
};