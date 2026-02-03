import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth-context';
import { showError, showSuccess } from '@/utils/toast';
import { CrawlerJob } from '@/types/supabase';

const EDGE_FUNCTION_URL = "https://xebtjnvfkroiplyzftas.supabase.co/functions/v1/start-crawl";

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
  // 1. Insert job into database
  const { data, error } = await supabase
    .from('crawler_jobs')
    .insert([jobData])
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  
  const jobId = data.id;

  // 2. Invoke Edge Function to start the crawl process
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Pass the user's JWT for potential authentication/logging within the function
      'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
    },
    body: JSON.stringify({ job_id: jobId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Edge Function failed: ${errorData.error || response.statusText}`);
  }

  return data;
};

export const useCreateCrawlerJob = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (target_url: string) => createCrawlerJob({ target_url, user_id: user!.id }),
    onSuccess: () => {
      // Invalidate queries to show the new job immediately
      queryClient.invalidateQueries({ queryKey: ['crawlerJobs'] });
      showSuccess("Crawler job initiated successfully! Processing started.");
    },
    onError: (error) => {
      showError(`Failed to start job: ${error.message}`);
    },
  });
};