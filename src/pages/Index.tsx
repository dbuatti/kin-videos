"use client";

import { useAuth } from "@/integrations/supabase/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  PlayCircle, 
  Video, 
  Headphones, 
  Library,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Zap,
  Bookmark,
  Mic
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import React from 'react';
import { useLastWatched } from "@/hooks/use-last-watched";
import { useCourseProgress } from "@/hooks/use-course-progress";
import { Progress } from "@/components/ui/progress";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import { cn } from "@/lib/utils";
import SyllabusClipboard from "@/components/SyllabusClipboard";
import VoiceSearch from "@/components/VoiceSearch";
import PriorityLessons from "@/components/PriorityLessons";
import { showSuccess } from "@/utils/toast";

const Index = () => {
  const navigate = useNavigate();
  const { data: lastWatched, isLoading: isLastWatchedLoading } = useLastWatched();
  const { data: progress, isLoading: isProgressLoading } = useCourseProgress();

  if (isProgressLoading || isLastWatchedLoading) {
    return (
      <div className="min-h-screen flex flex-col p-8">
        <DashboardSkeleton />
      </div>
    );
  }

  const handleVoiceResult = (text: string) => {
    // Navigate to player and let it handle the search
    navigate(`/master-player?mode=video&voiceQuery=${encodeURIComponent(text)}`);
  };

  const ACTIONS = [
    {
      title: "Video Player",
      desc: "Watch lessons with progress tracking",
      icon: Video,
      path: "/master-player?mode=video",
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20"
    },
    {
      title: "Audio Player",
      desc: "Listen to course content on the go",
      icon: Headphones,
      path: "/master-player?mode=audio",
      color: "text-accent",
      bg: "bg-accent/10",
      border: "border-accent/20"
    },
    {
      title: "Library",
      desc: "Browse all modules and downloads",
      icon: Library,
      path: "/gallery",
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      border: "border-emerald-400/20"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col animate-in-fade max-w-5xl mx-auto w-full p-6 sm:p-12 space-y-12">
      
      {/* Voice Search Hero */}
      <section className="flex flex-col items-center text-center space-y-6 py-8">
        <div className="relative">
          <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full animate-pulse" />
          <VoiceSearch onResult={handleVoiceResult} className="h-20 w-20 sm:h-24 sm:w-24 relative z-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Voice Command</h2>
          <p className="text-slate-500 text-sm max-w-xs mx-auto">
            Tap the mic and say <span className="text-primary font-bold">"Play me something about brain zones"</span>
          </p>
        </div>
      </section>

      {/* 1. Core Purpose: The Big Buttons */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {ACTIONS.map((action) => (
          <Link key={action.title} to={action.path} className="group">
            <Card className={cn(
              "h-full border-none rounded-[2.5rem] bg-slate-900/40 backdrop-blur-xl transition-all hover:bg-slate-900/60 border border-white/5 hover:scale-[1.02] active:scale-[0.98] shadow-2xl",
              action.border
            )}>
              <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                <div className={cn("p-5 rounded-[1.5rem] shadow-inner", action.bg)}>
                  <action.icon className={cn("w-8 h-8", action.color)} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">{action.title}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">{action.desc}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>

      {/* Priority Focus Section */}
      <PriorityLessons />

      {/* 2. Secondary: Resume & Progress */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Continue Learning</h2>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-black text-primary">{progress?.percentage || 0}% Complete</span>
            <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="bg-primary h-full" style={{ width: `${progress?.percentage || 0}%` }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Resume Card */}
          <div className="lg:col-span-3">
            {lastWatched ? (
              <button 
                onClick={() => navigate(`/master-player?mode=video`)}
                className="w-full text-left group"
              >
                <Card className="border-none rounded-[2rem] bg-white/5 hover:bg-white/10 transition-all border border-white/5 overflow-hidden">
                  <CardContent className="p-6 sm:p-8 flex items-center justify-between">
                    <div className="flex items-center space-x-6 min-w-0">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/20 rounded-2xl flex items-center justify-center shrink-0">
                        <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-primary animate-pulse" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Last Watched</p>
                        <h3 className="text-sm sm:text-xl font-bold text-white truncate group-hover:text-primary transition-colors">
                          {lastWatched.title}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-slate-400 font-medium truncate mt-0.5">{lastWatched.category}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-primary group-hover:translate-x-2 transition-all shrink-0 ml-4" />
                  </CardContent>
                </Card>
              </button>
            ) : (
              <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-[2rem] bg-white/5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No recent activity found.</p>
              </div>
            )}
          </div>

          {/* Quick Bookmarks Button */}
          <Link to="/bookmarks" className="group">
            <Card className="h-full border-none rounded-[2rem] bg-white/5 hover:bg-white/10 transition-all border border-white/5 flex items-center justify-center p-6">
              <div className="text-center">
                <Bookmark className="w-6 h-6 text-slate-500 group-hover:text-primary mx-auto mb-2 transition-colors" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">Bookmarks</span>
              </div>
            </Card>
          </Link>
        </div>
      </section>

      {/* 3. Master Syllabus Clipboard */}
      <SyllabusClipboard />

      <footer className="pt-12 opacity-30">
        <div className="flex items-center justify-center space-x-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
          <Sparkles className="w-3 h-3" />
          <span>FNH Archiver v2.0</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;