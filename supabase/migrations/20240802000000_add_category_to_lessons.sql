-- Add the category column to the lessons table
ALTER TABLE public.lessons
ADD COLUMN category TEXT;

-- Note: Existing RLS policies based on user_id are sufficient for this new column.