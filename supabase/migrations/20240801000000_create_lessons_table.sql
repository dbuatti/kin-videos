-- Create lessons table
CREATE TABLE public.lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.crawler_jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_url TEXT NOT NULL,
  video_url TEXT, -- The extracted video URL for this specific lesson
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (REQUIRED)
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Policies for lessons: Users can only manage lessons associated with their jobs
CREATE POLICY "Users can only see their own lessons" ON public.lessons
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own lessons" ON public.lessons
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own lessons" ON public.lessons
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own lessons" ON public.lessons
FOR DELETE TO authenticated USING (auth.uid() = user_id);