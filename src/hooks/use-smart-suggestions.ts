"use client";

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth-context';
import { useJobLessons } from './use-job-lessons';
import { useAllProgress } from './use-all-progress';
import { Lesson } from '@/types/supabase';

interface Suggestion {
  lesson: Lesson;
  reason: string;
  keyword?: string;
  type: 'technical' | 'foundational' | 'next-up' | 'refresher';
}

const SMART_MAP = [
  { keywords: ['lymphatic', 'lymph', 'drainage', 'suture'], target: 'Lymphatic System Assessment and Correction', type: 'technical' as const },
  { keywords: ['t1', 'sympathetic', 'chain', 'stress', 'anxiety'], target: 'Beginning Procedures - Sympathetic Down Regulation', type: 'technical' as const },
  { keywords: ['diaphragm', 'phrenic', 'breathing', 'breath'], target: 'Phrenic Nerve', type: 'technical' as const },
  { keywords: ['vagus', 'parasympathetic', 'nerve', 'tone'], target: 'Vagus Nerve', type: 'technical' as const },
  { keywords: ['muscle test', 'testing', 'indicator', 'weak', 'strong'], target: 'Clinical Assessments', type: 'technical' as const },
  { keywords: ['pelvic', 'floor', 'core', 'tva'], target: 'Direct Muscle Tests', type: 'technical' as const },
  { keywords: ['cranial', 'nerve', 'vision', 'smell', 'eye'], target: 'Cranial Nerves', type: 'technical' as const },
  { keywords: ['back', 'pain', 'lower back', 'spine'], target: 'Putting it all Together', type: 'technical' as const },
  { keywords: ['gait', 'walking', 'integration'], target: 'Finishing Procedures and Home Reinforcement', type: 'technical' as const },
  { keywords: ['clunky', 'doubts', 'useful', 'understand', 'not sure', 'confused'], target: 'Course Introduction & Foundational Knowledge', type: 'foundational' as const },
  { keywords: ['exam', 'theory', 'certification'], target: 'FNH Foundations Exam', type: 'technical' as const }
];

export const useSmartSuggestions = () => {
  const { user } = useAuth();
  const { data: lessons } = useJobLessons();
  const { data: allProgress } = useAllProgress();

  return useQuery({
    queryKey: ['smartSuggestions', user?.id, lessons?.length],
    queryFn: async () => {
      if (!user || !lessons || lessons.length === 0) return [];

      const { data: reflections, error } = await supabase
        .from('practitioner_reflections')
        .select('content, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const suggestions: Suggestion[] = [];
      const seenLessonIds = new Set<string>();
      const fullContext = reflections?.map(r => r.content.toLowerCase()).join(' ') || '';

      // 1. Try to match based on reflections
      if (fullContext) {
        for (const mapping of SMART_MAP) {
          const match = mapping.keywords.find(k => fullContext.includes(k));
          if (match) {
            const matchingLesson = lessons.find(l => 
              (l.title?.toLowerCase().includes(mapping.target.toLowerCase()) || 
               l.category?.toLowerCase().includes(mapping.target.toLowerCase())) && 
              l.video_url && 
              !seenLessonIds.has(l.id)
            );

            if (matchingLesson) {
              suggestions.push({
                lesson: matchingLesson,
                keyword: match,
                type: mapping.type,
                reason: mapping.type === 'foundational' 
                  ? `Based on your reflection mentioning "${match}"`
                  : `Reviewing the ${match} protocols`
              });
              seenLessonIds.add(matchingLesson.id);
            }
          }
          if (suggestions.length >= 3) break;
        }
      }

      // 2. Fallback: Suggest "Next Up" (First pending lesson)
      if (suggestions.length < 3) {
        const nextUp = lessons.find(l => 
          l.video_url && 
          !seenLessonIds.has(l.id) && 
          (!allProgress?.[l.id] || allProgress[l.id].watch_count === 0)
        );
        if (nextUp) {
          suggestions.push({
            lesson: nextUp,
            type: 'next-up',
            reason: "Next step in your Foundations journey"
          });
          seenLessonIds.add(nextUp.id);
        }
      }

      // 3. Fallback: Suggest a "Refresher" (Something partially watched or important)
      if (suggestions.length < 3) {
        const refresher = lessons.find(l => 
          l.video_url && 
          !seenLessonIds.has(l.id) && 
          (l.category?.includes('Assessments') || l.category?.includes('Procedures'))
        );
        if (refresher) {
          suggestions.push({
            lesson: refresher,
            type: 'refresher',
            reason: "A key protocol worth revisiting"
          });
          seenLessonIds.add(refresher.id);
        }
      }

      return suggestions.slice(0, 3);
    },
    enabled: !!user && !!lessons,
  });
};