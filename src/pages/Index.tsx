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
  Sparkles
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import React from 'react';
import { useLastWatched } from "@/hooks/use-last-watched";
import { Progress } from "@/components/ui/progress";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: lastWatched, isLoading: isLastWatchedLoading } = useLastWatched();

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-5xl mx-auto w-full p-6 sm:p-12 flex flex-col justify-center space-y-10">
        
        {/* Header Section */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-primary">
            <Sparkles className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-[0.3em]">Welcome Back</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-white">
            Foundations <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Archiver</span>
          </h1>
        </div>

        {/* 1. CONTINUE WATCHING */}
        {!isLastWatchedLoading && lastWatched ? (
          <button 
            onClick={() => navigate(`/master-player?mode=video`)}
            className="w-full text-left group relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <Card className="relative border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-slate-900/80 backdrop-blur-2xl text-white transform active:scale-[0.98] transition-all duration-300">
              <CardContent className="p-8 sm:p-12 relative">
                <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                  <PlayCircle className="w-48 h-48" />
                </div>
                
                <div className="relative z-10 space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary/20 p-3 rounded-2xl backdrop-blur-md border border-primary/30">
                        <Clock className="w-6 h-6 text-primary" />
                      </div>
                      <Badge className="bg-primary text-white border-none px-4 py-1 font-black tracking-widest text-[10px]">RESUME SESSION</Badge>
                    </div>
                    <span className="text-5xl font-black tracking-tighter text-primary/50">{lastWatched.percentage}%</span>
                  </div>

                  <div>
                    <h2 className="text-3xl sm:text-5xl font-black leading-tight mb-3 line-clamp-1 tracking-tighter">
                      {lastWatched.title}
                    </h2>
                    <p className="text-slate-400 text-lg font-medium">
                      {lastWatched.category}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Progress value={lastWatched.percentage} className="h-3 bg-white/5" />
                    <div className="flex items-center font-black text-primary text-sm uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                      Jump back in <ArrowRight className="ml-2 w-5 h-5" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </button>
        ) : (
          <div className="h-32 flex items-center justify-center text-slate-500 font-bold uppercase tracking-widest text-xs border-2 border-dashed border-slate-800 rounded-[2.5rem]">
            {isLastWatchedLoading ? "Synchronizing Progress..." : "No recent activity found."}
          </div>
        )}

        {/* 2. PRIMARY MODES GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          
          {/* Master Video Player */}
          <Link to="/master-player?mode=video" className="group">
            <Card className="h-full border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-slate-900/50 backdrop-blur-md text-white transform active:scale-95 transition-all border border-white/5 hover:border-primary/50 hover:bg-slate-900/80">
              <CardContent className="p-10 flex flex-col items-center text-center space-y-6">
                <div className="bg-primary p-8 rounded-[2rem] shadow-2xl shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
                  <Video className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-black tracking-tighter">Video Player</h3>
                  <p className="text-primary font-black text-xs uppercase tracking-[0.3em] mt-2">Full Experience</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Master Audio Player */}
          <Link to="/master-player?mode=audio" className="group">
            <Card className="h-full border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-slate-900/50 backdrop-blur-md text-white transform active:scale-95 transition-all border border-white/5 hover:border-accent/50 hover:bg-slate-900/80">
              <CardContent className="p-10 flex flex-col items-center text-center space-y-6">
                <div className="bg-accent p-8 rounded-[2rem] shadow-2xl shadow-accent/20 group-hover:scale-110 transition-transform duration-500">
                  <Headphones className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-black tracking-tighter">Audio Player</h3>
                  <p className="text-accent font-black text-xs uppercase tracking-[0.3em] mt-2">Podcast Mode</p>
                </div>
              </CardContent>
            </Card>
          </Link>

        </div>

        {/* 3. BROWSE ALL */}
        <Link to="/gallery" className="group">
          <Card className="border-none shadow-lg rounded-[2.5rem] overflow-hidden bg-white/5 backdrop-blur-md transform active:scale-95 transition-all border border-white/5 hover:border-white/20">
            <CardContent className="p-8 flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <div className="bg-white/10 p-6 rounded-3xl text-white border border-white/10">
                  <LayoutGrid className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tighter">Individual Videos</h3>
                  <p className="text-slate-400 font-medium">Browse the full library</p>
                </div>
              </div>
              <div className="bg-white/10 p-4 rounded-full text-white group-hover:bg-primary group-hover:text-white transition-all">
                <ArrowRight className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </Link>

      </main>
    </div>
  );
};

export default Index;