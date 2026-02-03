-- This migration ensures the 'category' column exists on the lessons table, 
-- resolving the schema cache error encountered by the Edge Function.
ALTER TABLE public.lessons
ADD COLUMN category TEXT;