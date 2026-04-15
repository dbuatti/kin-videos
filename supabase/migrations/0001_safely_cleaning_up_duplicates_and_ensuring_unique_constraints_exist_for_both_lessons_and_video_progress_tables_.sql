DO $$
BEGIN
    -- 1. Clean up duplicates in lessons table
    DELETE FROM public.lessons a USING (
      SELECT MIN(ctid) as ctid, user_id, lesson_url
      FROM public.lessons 
      GROUP BY user_id, lesson_url 
      HAVING COUNT(*) > 1
    ) b
    WHERE a.user_id = b.user_id 
    AND a.lesson_url = b.lesson_url 
    AND a.ctid <> b.ctid;

    -- 2. Add unique constraint to lessons table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lessons_user_id_lesson_url_key') THEN
        ALTER TABLE public.lessons ADD CONSTRAINT lessons_user_id_lesson_url_key UNIQUE (user_id, lesson_url);
    END IF;

    -- 3. Clean up duplicates in video_progress table
    DELETE FROM public.video_progress a USING (
      SELECT MIN(ctid) as ctid, user_id, video_id
      FROM public.video_progress 
      GROUP BY user_id, video_id 
      HAVING COUNT(*) > 1
    ) b
    WHERE a.user_id = b.user_id 
    AND a.video_id = b.video_id 
    AND a.ctid <> b.ctid;

    -- 4. Add unique constraint to video_progress table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'video_progress_user_id_video_id_key') THEN
        ALTER TABLE public.video_progress ADD CONSTRAINT video_progress_user_id_video_id_key UNIQUE (user_id, video_id);
    END IF;
END $$;