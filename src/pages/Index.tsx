"use client";

import { useAuth } from "@/integrations/supabase/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  PlayCircle, 
  Video, 
  Headphones, 
  LayoutGrid,
  ArrowRight,
  Clock,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import React from 'react';
import { useLastWatched } from "@/hooks/use-last-watched";
import { useCourseProgress } from "@/hooks/use-course-progress";
import { Progress } from "@/components/ui/progress";
import DashboardSkeleton from "@/components/DashboardSkeleton";

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

  return (
    <div className="min-h-screen flex flex-col animate-in-fade max-w-5xl mx-auto w-full p-6 sm:p-12">
      {/* Simple Header */}
      <div className="mb-12 space-y-2">
        <div className="flex items-center space-x-2 text-primary mb-2">
          <Sparkles className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Welcome Back</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white">
          Ready to <span className="text-primary">Learn?</span>
        </h1>
        <div className="flex items-center space-x-4 pt-2">
          <div className="flex-1 max-w-xs">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
              <span>Course Progress</span>
              <span className="text-white">{progress?.percentage || 0}%</span>
            </div>
            <Progress value={progress?.percentage || 0} className="h-1.5 bg-white/5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Main Resume Card */}
        {lastWatched ? (
          <button 
            onClick={() => navigate(`/master-player?mode=video`)}
            className="w-full text-left group relative"
          >
            <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden bg-slate-900/50 backdrop-blur-xl text-white border border-white/5 transition-all hover:bg-slate-900/80">
              <CardContent className="p-8 sm:p-12 flex flex-col sm:flex-row items-center gap-8">
                <div className="relative shrink-0">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-primary/20 rounded-3xl flex items-center justify-center border border-primary/30 group-hover:scale-105 transition-transform">
                    <PlayCircle className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
                  </div>
                </div>
                
                <div className="flex-1 space-y-4 text-center sm:text-left">
                  <div className="space-y-1">
                    <Badge className="bg-primary/10 text-primary border-none px-3 py-0.5 font-bold text-[10px] tracking-widest uppercase mb-2">Continue Watching</Badge>
                    <h2 className="text-2xl sm:text-4xl font-black leading-tight tracking-tight group-hover:text-primary transition-colors">
                      {lastWatched.title}
                    </h2>
                    <p className="text-slate-400 font-medium flex items-center justify-center sm:justify-start">
                      <TrendingUp className="w-4 h-4 mr-2 text-accent" />
                      {lastWatched.category}
                    </p>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start font-bold text-primary text-sm uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                    Resume Lesson <ArrowRight className="ml-2 w-4 h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </button>
        ) : (
          <Card className="border-2 border-dashed border-slate-800 rounded-[2rem] bg-slate-900/20 p-12 text-center">
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Start your first lesson to see progress here.</p>
            <Button asChild className="mt-4 rounded-xl bg-primary hover:bg-primary/90">
              <Link to="/gallery">Browse Library</Link>
            </Button>
          </Card>
        )}

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="/master-player?mode=video" className="group">
            <Card className="h-full border-none rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5">
              <CardContent className="p-6 flex items-center space-x-4">
                <div className="bg-primary/20 p-3 rounded-xl">
                  <Video className="w-5 h-5 text-primary" />
                </div>
                <span className="font-bold text-white">Video Player</span>
              </CardContent>
            </Card>
          </Link>
          <Link to="/master-player?mode=audio" className="group">
            <Card className="h-full border-none rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5">
              <CardContent className="p-6 flex items-center space-x-4">
                <div className="bg-accent/20 p-3 rounded-xl">
                  <Headphones className="w-5 h-5 text-accent" />
                </div>
                <span className="font-bold text-white">Audio Player</span>
              </CardContent>
            </Card>
          </Link>
          <Link to="/gallery" className="group">
            <Card className="h-full border-none rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5">
              <CardContent className="p-6 flex items-center space-x-4">
                <div className="bg-white/10 p-3 rounded-xl">
                  <LayoutGrid className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-white">Full Library</span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;