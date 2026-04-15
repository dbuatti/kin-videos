"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSmartSuggestions } from '@/hooks/use-smart-suggestions';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Play, ArrowRight, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

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

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between px-4">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 flex items-center">
          <Sparkles className="w-3 h-3 mr-2 fill-indigo-400" />
          Smart Recommendations
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {suggestions.map((item, idx) => (
          <Card 
            key={item.lesson.id} 
            className="border-none rounded-[2rem] bg-indigo-500/5 hover:bg-indigo-500/10 transition-all border border-indigo-500/10 group overflow-hidden"
          >
            <CardContent className="p-6 flex flex-col h-full justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <Brain className="w-4 h-4 text-indigo-400" />
                  </div>
                  <Badge variant="outline" className="text-[8px] border-indigo-500/30 text-indigo-400 uppercase font-black">
                    Insight
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-indigo-400 transition-colors">
                    {item.lesson.title}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1 italic line-clamp-2">
                    "{item.reason}"
                  </p>
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(`/master-player?mode=video`)}
                className="w-full justify-between text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-xl h-9 px-4 font-bold text-xs"
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