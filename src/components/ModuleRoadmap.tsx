"use client";

import React from 'react';
import { useJobLessons } from '@/hooks/use-job-lessons';
import { useCourseProgress } from '@/hooks/use-course-progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MODULE_ORDER } from '@/utils/filenames';
import { CheckCircle2, Circle, Map as MapIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

const ModuleRoadmap = () => {
  const { data: lessons } = useJobLessons();
  
  const moduleStats = React.useMemo(() => {
    if (!lessons) return [];
    
    return MODULE_ORDER.map((category, index) => {
      const categoryLessons = lessons.filter(l => l.category === category);
      const total = categoryLessons.length;
      const completed = categoryLessons.filter(l => l.status === 'completed').length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      return {
        category,
        index: index + 1,
        total,
        completed,
        percentage,
        isCompleted: percentage === 100 && total > 0
      };
    }).filter(m => m.total > 0);
  }, [lessons]);

  return (
    <Card className="border-none shadow-xl rounded-[2.5rem] bg-slate-900/50 backdrop-blur-md text-white border border-white/5">
      <CardHeader className="p-8 pb-4">
        <CardTitle className="text-sm font-black uppercase tracking-[0.3em] text-slate-400 flex items-center">
          <MapIcon className="w-4 h-4 mr-2 text-primary" />
          Course Roadmap
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 pt-0">
        <div className="space-y-6">
          {moduleStats.map((mod) => (
            <div key={mod.category} className="group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors",
                    mod.isCompleted ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-slate-500"
                  )}>
                    {mod.isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-[10px] font-bold">{mod.index}</span>}
                  </div>
                  <span className={cn(
                    "text-xs font-bold truncate transition-colors",
                    mod.isCompleted ? "text-emerald-400" : "text-slate-300 group-hover:text-white"
                  )}>
                    {mod.category}
                  </span>
                </div>
                <span className="text-[10px] font-black text-slate-500 ml-4">{mod.percentage}%</span>
              </div>
              <Progress 
                value={mod.percentage} 
                className={cn(
                  "h-1 bg-white/5",
                  mod.isCompleted ? "[&>div]:bg-emerald-500" : "[&>div]:bg-primary/50"
                )} 
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ModuleRoadmap;