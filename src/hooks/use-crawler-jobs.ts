"use client";

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
  // Poll if any job is still in a non-terminal state
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
    // Poll every 3 seconds if active jobs exist, otherwise stop polling to save resources
    refetchInterval: (query) => (query.state.data?.needsPolling ? 3000 : false),
    // Ensure we refetch when the window regains focus
    refetchOnWindowFocus: true,
  });
  
  return {
    ...query,
    data: query.data?.jobs,
  };
};

const createCrawlerJob = async (target_url: string, userId: string) => {
  // 1. Create the job record first to get an ID
  const { data, error } = await supabase
    .from('crawler_jobs')
    .insert([{ target_url, user_id: userId, status: 'pending' }])
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  
  const jobId = data.id;

  // 2. Trigger the Edge Function with the user's session token for security
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;

  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ job_id: jobId, target_url }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    // If the function fails, we should mark the job as failed in the DB
    await supabase.from('crawler_jobs').update({ status: 'failed', error_log: errorData.error }).eq('id', jobId);
    throw new Error(errorData.error || "Failed to start crawler service.");
  }

  return data;
};

export const useCreateCrawlerJob = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (data: { targetUrl: string }) => createCrawlerJob(data.targetUrl, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crawlerJobs'] });
      showSuccess("Crawler job initiated! Discovery phase is starting.");
    },
    onError: (error: Error) => {
      showError(error.message);
    },
  });
};