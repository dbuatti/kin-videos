-- Create the crawler_jobs table
CREATE TABLE public.crawler_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending',
  target_url TEXT NOT NULL,
  total_lessons INTEGER NOT NULL DEFAULT 0,
  lessons_processed INTEGER NOT NULL DEFAULT 0,
  error_log TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (REQUIRED for security)
ALTER TABLE public.crawler_jobs ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only manage their own jobs
CREATE POLICY "Users can view their own jobs" ON public.crawler_jobs
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own jobs" ON public.crawler_jobs
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jobs" ON public.crawler_jobs
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own jobs" ON public.crawler_jobs
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Optional: Add index for faster lookups by user
CREATE INDEX idx_crawler_jobs_user_id ON public.crawler_jobs (user_id);