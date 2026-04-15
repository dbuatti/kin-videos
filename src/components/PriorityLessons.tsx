"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobLessons } from '@/hooks/use-job-lessons';
import { isPriorityLesson } from '@/utils/priority';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Play, CheckCircle2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import VideoProgressIndicator from './VideoProgressIndicator';
import { Button } from './ui/button';

const PriorityLessons = () => {
  const navigate = useNavigate();
  const { data: lessons, isLoading } = useJobLessons();

  const priorityLessons = React.useMemo(() => {
    if (!lessons) return [];
    return lessons.filter(l => isPriorityLesson(l.title));
  }, [lessons]);

  if (isLoading || priorityLessons.length === 0) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between px-4">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 flex items-center">
          <Star className="w-3 h-3 mr-2 fill-amber-500" />
          Priority Focus: Finishing Procedures
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {priorityLessons.map((lesson) => (
          <Card 
            key={lesson.id} 
            className="border-none rounded-[2rem] bg-amber-500/5 hover:bg-amber-500/10 transition-all border border-amber-500/10 group overflow-hidden"
          >
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                  <Play className="w-5 h-5 text-amber-500 fill-amber-500" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate group-hover:text-amber-400 transition-colors">
                    {lesson.title}
                  </h3>
                  <div className="mt-2">
                    <VideoProgressIndicator videoId={lesson.id} showText={false} className="w-24" />
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate(`/master-player?mode=video`)}
                className="text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-full"
              >
                <ArrowRight className="w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default PriorityLessons;