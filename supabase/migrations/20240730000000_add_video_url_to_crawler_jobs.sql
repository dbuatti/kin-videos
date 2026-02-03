-- Add video_url column to crawler_jobs table
ALTER TABLE public.crawler_jobs
ADD COLUMN video_url TEXT;

-- RLS policies are already managed on the table level.

-- Schema cache refresh trigger (added comment to force re-sync)
-- Dyad forced refresh: 2024-08-01