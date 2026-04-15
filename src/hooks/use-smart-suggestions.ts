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
  type: 'technical' | 'foundational';
}

// Mapping specific keywords to either categories or specific lesson titles
const SMART_MAP = [
  { 
    keywords: ['lymphatic', 'lymph'], 
    target: 'Lymphatic System Assessment and Correction', 
    type: 'technical' as const 
  },
  { 
    keywords: ['t1', 'sympathetic chain'], 
    target: 'T1 - Sympathetic Chain', 
    type: 'technical' as const 
  },
  { 
    keywords: ['diaphragm', 'phrenic'], 
    target: 'Phrenic Nerve', 
    type: 'technical' as const 
  },
  { 
    keywords: ['vagus', 'parasympathetic'], 
    target: 'Vagus Nerve', 
    type: 'technical' as const 
  },
  { 
    keywords: ['muscle test', 'testing', 'indicator'], 
    target: 'Clinical Assessments', 
    type: 'technical' as const 
  },
  { 
    keywords: ['diagnostics', 'tests', 'looking for'], 
    target: 'Clinical Assessments', 
    type: 'technical' as const 
  },
  { 
    keywords: ['clunky', 'doubts', 'useful', 'understand', 'not sure'], 
    target: 'Course Introduction & Foundational Knowledge', 
    type: 'foundational' as const 
  },
  { 
    keywords: ['gait', 'walking'], 
    target: 'Finishing Procedures and Home Reinforcement', 
    type: 'technical' as const 
  }
];

export const useSmartSuggestions = () => {
  const { user } = useAuth();
  const { data: lessons } = useJobLessons();

  return useQuery({
    queryKey: ['smartSuggestions', user?.id],
    queryFn: async () => {
      if (!user || !lessons) return [];

      const { data: reflections, error } = await supabase
        .from('practitioner_reflections')
        .select('content, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      if (!reflections || reflections.length === 0) return [];

      const suggestions: Suggestion[] = [];
      const seenLessonIds = new Set<string>();

      // Combine recent reflections to get a broader context
      const fullContext = reflections.map(r => r.content.toLowerCase()).join(' ');
      
      for (const mapping of SMART_MAP) {
        const match = mapping.keywords.find(k => fullContext.includes(k));
        
        if (match) {
          // Try to find a specific lesson title first, then fallback to category
          const matchingLesson = lessons.find(l => 
            (l.title?.includes(mapping.target) || l.category === mapping.target) && 
            l.video_url && 
            !seenLessonIds.has(l.id)
          );

          if (matchingLesson) {
            suggestions.push({
              lesson: matchingLesson,
              keyword: match,
              type: mapping.type,
              reason: mapping.type === 'foundational' 
                ? `To help with those feelings of "${match}"`
                : `Reviewing the ${match} procedure`
            });
            seenLessonIds.add(matchingLesson.id);
          }
        }
        
        if (suggestions.length >= 3) break;
      }

      return suggestions;
    },
    enabled: !!user && !!lessons,
  });
};