"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSmartSuggestions } from '@/hooks/use-smart-suggestions';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Play, ArrowRight, Brain, ShieldCheck, Lightbulb, Zap, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const SmartSuggestions = () => {
  const navigate = useNavigate();
  const { data: suggestions, isLoading } = useSmartSuggestions();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-[2rem]" />)}
        </div>
      </div>
    );
  }

  if (!suggestions || suggestions.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'foundational': return <ShieldCheck className="w-4 h-4 text-amber-500" />;
      case 'next-up': return <Zap className="w-4 h-4 text-emerald-400" />;
      case 'refresher': return <RotateCcw className="w-4 h-4 text-blue-400" />;
      default: return <Brain className="w-4 h-4 text-indigo-400" />;
    }
  };

  const getColors = (type: string) => {
    switch (type) {
      case 'foundational': return "bg-amber-500/5 border-amber-500/10 hover:bg-amber-500/10 text-amber-500";
      case 'next-up': return "bg-emerald-500/5 border-emerald-500/10 hover:bg-emerald-500/10 text-emerald-500";
      case 'refresher': return "bg-blue-500/5 border-blue-500/10 hover:bg-blue-500/10 text-blue-500";
      default: return "bg-indigo-500/5 border-indigo-500/10 hover:bg-indigo-500/10 text-indigo-500";
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between px-4">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 flex items-center">
          <Sparkles className="w-3 h-3 mr-2 fill-indigo-400" />
          Smart Recommendations
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {suggestions.map((item) => (
          <Card 
            key={item.lesson.id} 
            className={cn(
              "border-none rounded-[2rem] transition-all border group overflow-hidden",
              getColors(item.type).split(' ').slice(0, 3).join(' ')
            )}
          >
            <CardContent className="p-6 flex flex-col h-full justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    item.type === 'foundational' ? "bg-amber-500/20" : 
                    item.type === 'next-up' ? "bg-emerald-500/20" :
                    item.type === 'refresher' ? "bg-blue-500/20" : "bg-indigo-500/20"
                  )}>
                    {getIcon(item.type)}
                  </div>
                  <Badge variant="outline" className={cn(
                    "text-[8px] uppercase font-black border-none px-2 py-0.5",
                    item.type === 'foundational' ? "bg-amber-500/20 text-amber-500" : 
                    item.type === 'next-up' ? "bg-emerald-500/20 text-emerald-500" :
                    item.type === 'refresher' ? "bg-blue-500/20 text-blue-500" : "bg-indigo-500/20 text-indigo-400"
                  )}>
                    {item.type.replace('-', ' ')}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-primary transition-colors">
                    {item.lesson.title}
                  </h3>
                  <div className="flex items-start mt-2 space-x-2">
                    <Lightbulb className="w-3 h-3 text-slate-500 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-slate-500 italic line-clamp-2 leading-relaxed">
                      {item.reason}
                    </p>
                  </div>
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(`/master-player?mode=video&lessonId=${item.lesson.id}`)}
                className={cn(
                  "w-full justify-between rounded-xl h-9 px-4 font-bold text-xs",
                  item.type === 'foundational' ? "text-amber-500 hover:bg-amber-500/10" : 
                  item.type === 'next-up' ? "text-emerald-500 hover:bg-emerald-500/10" :
                  item.type === 'refresher' ? "text-blue-500 hover:bg-blue-500/10" : "text-indigo-400 hover:bg-indigo-500/10"
                )}
              >
                Watch Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default SmartSuggestions;