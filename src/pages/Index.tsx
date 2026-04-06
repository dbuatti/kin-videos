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
  Clock
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
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex flex-col">
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-8 flex flex-col justify-center space-y-6">
        
        {/* 1. CONTINUE WATCHING (The "Resume" Button) */}
        {!isLastWatchedLoading && lastWatched ? (
          <button 
            onClick={() => navigate(`/master-player?mode=video`)}
            className="w-full text-left group"
          >
            <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden bg-indigo-600 text-white transform active:scale-95 transition-all duration-200">
              <CardContent className="p-8 sm:p-10 relative">
                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                  <PlayCircle className="w-32 h-32" />
                </div>
                
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <Badge className="bg-indigo-400 text-white border-none px-3 py-1 font-black tracking-widest">RESUME SESSION</Badge>
                  </div>

                  <div>
                    <h2 className="text-2xl sm:text-4xl font-black leading-tight mb-2 line-clamp-1">
                      {lastWatched.title}
                    </h2>
                    <p className="text-indigo-100 text-lg font-medium opacity-80">
                      {lastWatched.category}
                    </p>
                  </div>

                  <div className="pt-4">
                    <div className="flex justify-between items-end mb-3">
                      <span className="text-4xl font-black">{lastWatched.percentage}%</span>
                      <div className="flex items-center font-bold text-indigo-200">
                        Tap to Continue <ArrowRight className="ml-2 w-5 h-5 animate-bounce-x" />
                      </div>
                    </div>
                    <Progress value={lastWatched.percentage} className="h-4 bg-white/10" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </button>
        ) : (
          <div className="h-24 flex items-center justify-center text-gray-400 font-medium italic">
            {isLastWatchedLoading ? "Loading your progress..." : "No recent activity found."}
          </div>
        )}

        {/* 2. PRIMARY MODES GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Master Video Player */}
          <Link to="/master-player?mode=video" className="group">
            <Card className="h-full border-none shadow-xl rounded-[2rem] overflow-hidden bg-slate-900 text-white transform active:scale-95 transition-all border-2 border-transparent hover:border-indigo-500">
              <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                <div className="bg-indigo-600 p-6 rounded-[1.5rem] shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                  <Video className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-black">Video Player</h3>
                  <p className="text-indigo-300 font-bold text-sm uppercase tracking-widest mt-1">Full Course</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Master Audio Player */}
          <Link to="/master-player?mode=audio" className="group">
            <Card className="h-full border-none shadow-xl rounded-[2rem] overflow-hidden bg-indigo-950 text-white transform active:scale-95 transition-all border-2 border-transparent hover:border-emerald-500">
              <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                <div className="bg-emerald-600 p-6 rounded-[1.5rem] shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                  <Headphones className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-black">Audio Player</h3>
                  <p className="text-emerald-300 font-bold text-sm uppercase tracking-widest mt-1">Podcast Mode</p>
                </div>
              </CardContent>
            </Card>
          </Link>

        </div>

        {/* 3. BROWSE ALL (Gallery) */}
        <Link to="/gallery" className="group">
          <Card className="border-none shadow-lg rounded-[2rem] overflow-hidden bg-white transform active:scale-95 transition-all border-2 border-transparent hover:border-indigo-200">
            <CardContent className="p-8 flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="bg-indigo-50 p-5 rounded-2xl text-indigo-600">
                  <LayoutGrid className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-indigo-900">Individual Videos</h3>
                  <p className="text-gray-500 font-medium">Browse the full library</p>
                </div>
              </div>
              <div className="bg-gray-100 p-3 rounded-full text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
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