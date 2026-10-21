import { Lesson } from "@/types/supabase";
import { VideoProgressMap } from "@/hooks/use-all-progress";

export const isWatchedProgress = (p?: { playback_time: number; duration: number; watch_count: number } | null) =>
  !!p && (p.watch_count > 0 || (p.duration > 0 && p.playback_time / p.duration >= 0.9));

export const watchedLessonIds = (lessons: Lesson[], progress?: VideoProgressMap) => {
  const ids = new Set<string>();
  if (!progress) return ids;
  for (const l of lessons) {
    if (isWatchedProgress(progress[l.id]) || isWatchedProgress(progress[`${l.id}-audio`])) ids.add(l.id);
  }
  return ids;
};
