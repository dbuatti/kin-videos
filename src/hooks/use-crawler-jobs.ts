import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth-context';
import { showError, showSuccess } from '@/utils/toast';
import { CrawlerJob } from '@/types/supabase';

const fetchCrawlerJobs = async (userId: string): Promise<CrawlerJob[]> => {
  const { data, error } = await supabase
    .from('crawler_jobs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data as CrawlerJob[];
};

export const useCrawlerJobs = () => {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery<CrawlerJob[], Error>({
    queryKey: ['crawlerJobs', userId],
    queryFn: () => fetchCrawlerJobs(userId!),
    enabled: !!userId,
  });
};

const createCrawlerJob = async (jobData: { target_url: string, user_id: string }) => {
  const { data, error } = await supabase
    .from('crawler_jobs')
    .insert([jobData])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const useCreateCrawlerJob = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (target_url: string) => createCrawlerJob({ target_url, user_id: user!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crawlerJobs'] });
      showSuccess("Crawler job initiated successfully!");
    },
    onError: (error) => {
      showError(`Failed to start job: ${error.message}`);
    },
  });
};