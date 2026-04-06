"use client";

import { useAuth } from "@/integrations/supabase/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  PlayCircle, 
  Video, 
  Headphones, 
  LayoutGrid,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle2,
  BarChart3,
  TrendingUp
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import React from 'react';
import { useLastWatched } from "@/hooks/use-last-watched";
import { useCourseProgress } from "@/hooks/use-course-progress";
import { Progress } from "@/components/ui/progress";
import ModuleRoadmap from "@/components/ModuleRoadmap";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: lastWatched, isLoading: isLastWatchedLoading } = useLastWatched();
  const { data: progress, isLoading: isProgressLoading } = useCourseProgress();

  return (
    <div className="min-h-screen flex flex-col animate-in-fade">
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-12 flex flex-col justify-center space-y-8 sm:space-y-12">
        
        {/* Header Section */}
        <div className="space-y-3 sm:space-y-4 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start space-x-2 text-primary">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] sm:tracking-[0.4em]">Foundations Portal</span>
          </div>
          <h1 className="text-4xl sm:text-7xl font-black tracking-tighter text-white leading-tight sm:leading-none">
            Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-accent">Neuro Health</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-lg max-w-2xl font-medium px-4 sm:px-0">
            Your personal archive and learning hub for the Functional Neuro Approach Foundations course.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* 1. CONTINUE WATCHING (Main Card) */}
          <div className="lg:col-span-2 space-y-6">
            {!isLastWatchedLoading && lastWatched ? (
              <button 
                onClick={() => navigate(`/master-player?mode=video`)}
                className="w-full text-left group relative animate-in-slide-up"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-[2rem] sm:rounded-[2.5rem] blur opacity-10 group-hover:opacity-30 transition duration-1000"></div>
                <Card className="relative border-none shadow-2xl rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden bg-slate-900/80 backdrop-blur-2xl text-white transform active:scale-[0.98] transition-all duration-300 border border-white/5">
                  <CardContent className="p-6 sm:p-10 relative">
                    <div className="absolute top-0 right-0 p-8 sm:p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                      <PlayCircle className="w-32 h-32 sm:w-48 sm:h-48" />
                    </div>
                    
                    <div className="relative z-10 space-y-6 sm:space-y-8">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-primary/20 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl backdrop-blur-md border border-primary/30">
                            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                          </div>
                          <Badge className="bg-primary text-white border-none px-3 sm:px-4 py-1 font-black tracking-widest text-[9px] sm:text-[10px]">RESUME</Badge>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-3xl sm:text-5xl font-black tracking-tighter text-primary">{lastWatched.percentage}%</span>
                          <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">Progress</span>
                        </div>
                      </div>

                      <div>
                        <h2 className="text-2xl sm:text-4xl font-black leading-tight mb-2 sm:mb-3 line-clamp-2 tracking-tighter group-hover:text-primary transition-colors">
                          {lastWatched.title}
                        </h2>
                        <p className="text-slate-400 text-sm sm:text-lg font-medium flex items-center">
                          <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 text-accent" />
                          {lastWatched.category}
                        </p>
                      </div>

                      <div className="space-y-3 sm:space-y-4">
                        <Progress value={lastWatched.percentage} className="h-2 sm:h-3 bg-white/5" />
                        <div className="flex items-center font-black text-primary text-[10px] sm:text-sm uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                          Jump back in <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </button>
            ) : (
              <div className="h-full min-h-[250px] sm:min-h-[300px] flex flex-col items-center justify-center text-slate-500 font-bold uppercase tracking-widest text-[10px] sm:text-xs border-2 border-dashed border-slate-800 rounded-[2rem] sm:rounded-[2.5rem] bg-slate-900/20">
                {isLastWatchedLoading ? (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <span>Synchronizing...</span>
                  </div>
                ) : (
                  <>
                    <Zap className="w-10 h-10 mb-4 opacity-20" />
                    <span>No recent activity.</span>
                  </>
                )}
              </div>
            )}

            {/* Primary Modes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 animate-in-slide-up [animation-delay:200ms]">
              <Link to="/master-player?mode=video" className="group">
                <Card className="h-full border-none shadow-xl rounded-2xl sm:rounded-[2rem] overflow-hidden bg-slate-900/50 backdrop-blur-md text-white transform active:scale-95 transition-all border border-white/5 hover:border-primary/50">
                  <CardContent className="p-5 sm:p-6 flex flex-row sm:flex-col items-center sm:text-center space-x-4 sm:space-x-0 sm:space-y-4">
                    <div className="bg-primary p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-2xl shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
                      <Video className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <h3 className="text-base sm:text-lg font-black tracking-tighter">Video Player</h3>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/master-player?mode=audio" className="group">
                <Card className="h-full border-none shadow-xl rounded-2xl sm:rounded-[2rem] overflow-hidden bg-slate-900/50 backdrop-blur-md text-white transform active:scale-95 transition-all border border-white/5 hover:border-accent/50">
                  <CardContent className="p-5 sm:p-6 flex flex-row sm:flex-col items-center sm:text-center space-x-4 sm:space-x-0 sm:space-y-4">
                    <div className="bg-accent p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-2xl shadow-accent/20 group-hover:scale-110 transition-transform duration-500">
                      <Headphones className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <h3 className="text-base sm:text-lg font-black tracking-tighter">Audio Player</h3>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/gallery" className="group">
                <Card className="h-full border-none shadow-xl rounded-2xl sm:rounded-[2rem] overflow-hidden bg-slate-900/50 backdrop-blur-md text-white transform active:scale-95 transition-all border border-white/5 hover:border-white/20">
                  <CardContent className="p-5 sm:p-6 flex flex-row sm:flex-col items-center sm:text-center space-x-4 sm:space-x-0 sm:space-y-4">
                    <div className="bg-white/10 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-2xl group-hover:scale-110 transition-transform duration-500 border border-white/10">
                      <LayoutGrid className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <h3 className="text-base sm:text-lg font-black tracking-tighter">Library</h3>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          {/* 2. SIDEBAR STATS & ROADMAP */}
          <div className="space-y-6 sm:space-y-8 animate-in-slide-up [animation-delay:100ms]">
            <Card className="border-none shadow-xl rounded-[2rem] sm:rounded-[2.5rem] bg-slate-900/50 backdrop-blur-md text-white border border-white/5">
              <CardContent className="p-6 sm:p-8 flex flex-col">
                <div className="flex items-center space-x-3 mb-6 sm:mb-8">
                  <div className="bg-accent/20 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-accent/30">
                    <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                  </div>
                  <h3 className="font-black text-[10px] sm:text-sm uppercase tracking-widest text-slate-400">Course Stats</h3>
                </div>

                <div className="space-y-6 sm:space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-2xl sm:text-3xl font-black text-white">{progress?.watchedCount || 0}</p>
                      <p className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">Done</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-2xl sm:text-3xl font-black text-slate-400">{progress?.totalCount || 0}</p>
                      <p className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">Total</p>
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex justify-between text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
                      <span className="text-accent">Overall Progress</span>
                      <span className="text-white">{progress?.percentage || 0}%</span>
                    </div>
                    <Progress value={progress?.percentage || 0} className="h-1.5 sm:h-2 bg-white/5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <ModuleRoadmap />
          </div>
        </div>

      </main>
    </div>
  );
};

export default Index;