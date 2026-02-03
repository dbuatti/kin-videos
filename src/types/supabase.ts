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
}