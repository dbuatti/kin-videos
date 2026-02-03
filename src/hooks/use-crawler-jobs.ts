import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth-context';
import { showError, showSuccess } from '@/utils/toast';
import { CrawlerJob } from '@/types/supabase';

const EDGE_FUNCTION_URL = "https://xebtjnvfkroiplyzftas.supabase.co/functions/v1/start-crawl";

interface FetchJobsResult {
  jobs: CrawlerJob[];
  needsPolling: boolean;
}

const fetchCrawlerJobs = async (userId: string): Promise<FetchJobsResult> => {
  const { data, error } = await supabase
    .from('crawler_jobs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  
  const jobs = data as CrawlerJob[];
  // Determine if any job is still running or pending to enable polling
  const needsPolling = jobs.some(job => job.status === 'pending' || job.status === 'running');
  
  return { jobs, needsPolling };
};

export const useCrawlerJobs = () => {
  const { user } = useAuth();
  const userId = user?.id;

  const query = useQuery<FetchJobsResult, Error>({
    queryKey: ['crawlerJobs', userId],
    queryFn: () => fetchCrawlerJobs(userId!),
    enabled: !!userId,
    // Poll every 3 seconds if there are pending or running jobs
    refetchInterval: (data) => (data?.needsPolling ? 3000 : false),
  });
  
  // Return the jobs array directly for easier consumption in JobTable
  return {
    ...query,
    data: query.data?.jobs,
  };
};

interface CreateJobPayload {
  target_url: string;
  wistia_json: any; // We expect a parsed JSON object here
  user_id: string;
}

const createCrawlerJob = async (payload: CreateJobPayload) => {
  const { target_url, wistia_json, user_id } = payload;
  
  // 1. Insert job into database
  const { data, error } = await supabase
    .from('crawler_jobs')
    .insert([{ target_url, user_id }]) // Only insert URL and user_id initially
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  
  const jobId = data.id;

  // 2. Invoke Edge Function to start the crawl process and process JSON
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Pass the user's JWT for potential authentication/logging within the function
      'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
    },
    body: JSON.stringify({ job_id: jobId, wistia_json: wistia_json }),
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
    mutationFn: (data: { targetUrl: string, wistiaJson: any }) => 
      createCrawlerJob({ 
        target_url: data.targetUrl, 
        wistia_json: data.wistiaJson, 
        user_id: user!.id 
      }),
    onSuccess: () => {
      // Invalidate queries to show the new job immediately and start polling if needed
      queryClient.invalidateQueries({ queryKey: ['crawlerJobs'] });
      showSuccess("Crawler job initiated successfully! Processing started.");
    },
    onError: (error) => {
      showError(`Failed to start job: ${error.message}`);
    },
  });
};