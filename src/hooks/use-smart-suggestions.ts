"use client";

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth-context';
import { useJobLessons } from './use-job-lessons';
import { Lesson } from '@/types/supabase';

interface Suggestion {
  lesson: Lesson;
  reason: string;
  keyword: string;
}

const KEYWORD_MAP: Record<string, string[]> = {
  'lymphatic': ['lymph', 'lymphatic', 'drainage', 'suture'],
  'Vagus Nerve': ['vagus', 'cranial nerve x', 'parasympathetic'],
  'Direct Muscle Tests': ['muscle test', 'testing', 'clunky', 'indicator', 'tva', 'quads'],
  'Primitive Reflexes': ['reflex', 'moro', 'atnr', 'spinal gallant', 'babinski'],
  'Cranial Nerves': ['cranial', 'optic', 'olfactory', 'facial nerve'],
  'Finishing Procedures and Home Reinforcement': ['gait', 'integration', 'home reinforcement', 'finishing'],
  'Beginning Procedures - Sympathetic Down Regulation': ['stress', 'sympathetic', 'down regulation', 'harmonic rocking', 'phrenic'],
  'Functional Anatomy and Biomechanics': ['anatomy', 'biomechanics', 'sagittal', 'frontal', 'transverse']
};

export const useSmartSuggestions = () => {
  const { user } = useAuth();
  const { data: lessons } = useJobLessons();

  return useQuery({
    queryKey: ['smartSuggestions', user?.id],
    queryFn: async () => {
      if (!user || !lessons) return [];

      // Fetch the 5 most recent reflections
      const { data: reflections, error } = await supabase
        .from('practitioner_reflections')
        .select('content, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      if (!reflections || reflections.length === 0) return [];

      const suggestions: Suggestion[] = [];
      const seenLessonIds = new Set<string>();

      reflections.forEach(reflection => {
        const content = reflection.content.toLowerCase();
        
        for (const [category, keywords] of Object.entries(KEYWORD_MAP)) {
          for (const keyword of keywords) {
            if (content.includes(keyword)) {
              // Find a lesson in this category that hasn't been suggested yet
              const matchingLesson = lessons.find(l => 
                l.category === category && 
                l.video_url && 
                !seenLessonIds.has(l.id)
              );

              if (matchingLesson) {
                suggestions.push({
                  lesson: matchingLesson,
                  keyword: keyword,
                  reason: `Based on your reflection mentioning "${keyword}"`
                });
                seenLessonIds.add(matchingLesson.id);
                break; // Move to next category for this reflection
              }
            }
          }
        }
      });

      // Return top 3 unique suggestions
      return suggestions.slice(0, 3);
    },
    enabled: !!user && !!lessons,
  });
};