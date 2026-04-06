export interface CrawlerJob {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string | null;
  status: 'pending' | 'running' | 'completed' | 'failed';
  target_url: string;
  total_lessons: number;
  lessons_processed: number;
  error_log: string | null;
  created_at: string;
  video_url: string | null; // Main video URL (if applicable to the course page itself)
}

export interface Lesson {
  id: string;
  job_id: string;
  user_id: string;
  lesson_url: string;
  title: string | null; // New field
  video_url: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  category: string | null;
}