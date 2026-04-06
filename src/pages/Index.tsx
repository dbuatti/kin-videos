"use client";

import { MadeWithDyad } from "@/components/made-with-dyad";
import { useAuth } from "@/integrations/supabase/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, Zap, BookOpen, Library, PlayCircle, RefreshCw, Bookmark, Terminal, Scissors, Headphones, Video, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import SyllabusClipboard from "@/components/SyllabusClipboard";
import PlaybackSpeedControl from "@/components/PlaybackSpeedControl";
import { useCourseProgress } from "@/hooks/use-course-progress";
import { useLastWatched } from "@/hooks/use-last-watched";
import { Progress } from "@/components/ui/progress";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSyncing, setIsSyncing] = useState(false);
  const { data: courseProgress } = useCourseProgress();
  const { data: lastWatched } = useLastWatched();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showError("Failed to log out: " + error.message);
    }
  };

  const handleSyncCourse = async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-course', {
        body: { user_id: user.id }
      });
      if (error) throw error;
      showSuccess("Course data synced successfully!");
    } catch (err: any) {
      showError("Failed to sync course: " + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-8">
      <header className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-12 border-b pb-6 border-indigo-100 gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
            <Zap className="text-white w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-indigo-900 tracking-tight">
              FNH Archiver
            </h1>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Foundations Edition</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-center">
          <PlaybackSpeedControl className="h-9" />
          <Button 
            onClick={handleSyncCourse} 
            disabled={isSyncing}
            variant="outline" 
            size="sm"
            className="rounded-xl border-indigo-200 text-indigo-600 hover:bg-indigo-50 h-9"
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isSyncing && "animate-spin")} />
            <span className="hidden sm:inline">{isSyncing ? "Syncing..." : "Sync Course"}</span>
            <span className="sm:hidden">{isSyncing ? "..." : "Sync"}</span>
          </Button>
          <Button 
            onClick={handleLogout} 
            variant="ghost" 
            size="sm"
            className="rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 h-9"
          >
            <LogOut className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto space-y-6 sm:space-y-12">
        
        {/* Continue Watching Section */}
        {lastWatched && (
          <Card className="border-indigo-600 shadow-xl rounded-2xl sm:rounded-3xl overflow-hidden bg-indigo-600 text-white border-2 transform hover:scale-[1.01] transition-all">
            <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                  <PlayCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <Badge variant="secondary" className="bg-indigo-400 text-white border-none mb-2">CONTINUE WATCHING</Badge>
                  <h2 className="text-xl font-bold line-clamp-1">{lastWatched.title}</h2>
                  <p className="text-indigo-100 text-sm opacity-80">{lastWatched.category}</p>
                </div>
              </div>
              <div className="w-full md:w-auto flex flex-col items-end gap-2">
                <div className="text-right mb-1">
                  <span className="text-2xl font-black">{lastWatched.percentage}%</span>
                  <span className="text-[10px] uppercase ml-2 opacity-70">Complete</span>
                </div>
                <Button 
                  onClick={() => navigate('/master-player?mode=video')}
                  className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold rounded-xl px-8"
                >
                  Resume Lesson
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Course Progress Overview */}
        <Card className="border-indigo-100 shadow-xl rounded-2xl sm:rounded-3xl overflow-hidden bg-white border-2">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
              <div className="space-y-1 sm:space-y-2">
                <h2 className="text-xl sm:text-2xl font-black text-indigo-900 flex items-center">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-green-500" />
                  Course Completion
                </h2>
                <p className="text-gray-500 text-xs sm:text-sm">
                  Completed <span className="font-bold text-indigo-600">{courseProgress?.watchedCount || 0}</span> / <span className="font-bold text-indigo-600">{courseProgress?.totalCount || 0}</span> videos.
                </p>
              </div>
              <div className="flex-1 max-w-md w-full space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-3xl sm:text-4xl font-black text-indigo-600">{courseProgress?.percentage || 0}%</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Overall Progress</span>
                </div>
                <Progress value={courseProgress?.percentage || 0} className="h-2 sm:h-3 bg-indigo-50" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Syllabus Clipboard Section */}
        <div className="scale-95 sm:scale-100 origin-top">
          <SyllabusClipboard />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
          
          {/* Virtual Video Stitcher Card */}
          <Link to="/master-player?mode=video" className="group">
            <Card className="h-full border-indigo-100 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 border-2 hover:border-indigo-500">
              <CardHeader className="p-6 sm:p-8 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-indigo-600 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl">
                    <Video className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  <Badge className="bg-indigo-500 text-white border-none px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs">VIDEO MODE</Badge>
                </div>
                <CardTitle className="text-xl sm:text-2xl font-black">Virtual Video Stitcher</CardTitle>
                <CardDescription className="text-indigo-200 text-xs sm:text-sm">
                  Watch the entire course back-to-back with independent video progress tracking.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 sm:p-8 pt-0">
                <div className="flex items-center text-indigo-400 font-bold text-sm sm:text-base">
                  <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Resume Watching
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Virtual Audio Stitcher Card */}
          <Link to="/master-player?mode=audio" className="group">
            <Card className="h-full border-indigo-100 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl sm:rounded-3xl overflow-hidden bg-indigo-950 border-2 hover:border-indigo-400">
              <CardHeader className="p-6 sm:p-8 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-emerald-600 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl">
                    <Headphones className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  <Badge className="bg-emerald-500 text-white border-none px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs">AUDIO MODE</Badge>
                </div>
                <CardTitle className="text-xl sm:text-2xl font-black">Virtual Audio Stitcher</CardTitle>
                <CardDescription className="text-indigo-200 text-xs sm:text-sm">
                  Listen to the entire course back-to-back with independent audio progress tracking.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 sm:p-8 pt-0">
                <div className="flex items-center text-emerald-400 font-bold text-sm sm:text-base">
                  <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Resume Listening
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Video Gallery Card */}
          <Link to="/gallery" className="group">
            <Card className="h-full border-indigo-100 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl sm:rounded-3xl overflow-hidden bg-white border-2 hover:border-indigo-300">
              <CardHeader className="bg-indigo-600 p-6 sm:p-8 text-white group-hover:bg-indigo-700 transition-colors">
                <PlayCircle className="w-10 h-10 sm:w-12 sm:h-12 mb-4 opacity-80" />
                <CardTitle className="text-xl sm:text-2xl font-bold">Video Gallery</CardTitle>
                <CardDescription className="text-indigo-100 text-xs sm:text-sm">
                  Browse and stream all course videos in a high-quality gallery view.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center text-indigo-600 font-bold text-sm sm:text-base">
                  Open Gallery <Zap className="w-4 h-4 ml-2 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Course Inventory Card */}
          <Link to="/library" className="group">
            <Card className="h-full border-indigo-100 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl sm:rounded-3xl overflow-hidden bg-white border-2 hover:border-indigo-300">
              <CardHeader className="bg-emerald-600 p-6 sm:p-8 text-white group-hover:bg-emerald-700 transition-colors">
                <Library className="w-10 h-10 sm:w-12 sm:h-12 mb-4 opacity-80" />
                <CardTitle className="text-xl sm:text-2xl font-bold">Course Inventory</CardTitle>
                <CardDescription className="text-emerald-100 text-xs sm:text-sm">
                  Sync your local files and track your download progress across all modules.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center text-emerald-600 font-bold text-sm sm:text-base">
                  Manage Inventory <Zap className="w-4 h-4 ml-2 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Stitching Tools Card */}
          <Link to="/stitcher" className="group">
            <Card className="border-indigo-100 shadow-md hover:shadow-lg transition-all rounded-xl sm:rounded-2xl bg-white border hover:border-indigo-200">
              <CardContent className="p-4 sm:p-6 flex items-center space-x-4">
                <div className="bg-indigo-50 p-2.5 sm:p-3 rounded-lg sm:rounded-xl">
                  <Scissors className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-indigo-900 text-sm sm:text-base">Stitching Tools</h3>
                  <p className="text-[10px] sm:text-sm text-gray-500">Merge videos and extract audio.</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Scraper Tool Card */}
          <Link to="/scraper" className="group">
            <Card className="border-indigo-100 shadow-md hover:shadow-lg transition-all rounded-xl sm:rounded-2xl bg-white border hover:border-indigo-200">
              <CardContent className="p-4 sm:p-6 flex items-center space-x-4">
                <div className="bg-slate-900 p-2.5 sm:p-3 rounded-lg sm:rounded-xl">
                  <Terminal className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-bold text-indigo-900 text-sm sm:text-base">Scraper Tool</h3>
                  <p className="text-[10px] sm:text-sm text-gray-500">Master extraction script.</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Bookmarks Card */}
          <Link to="/bookmarks" className="group">
            <Card className="border-indigo-100 shadow-md hover:shadow-lg transition-all rounded-xl sm:rounded-2xl bg-white border hover:border-indigo-200">
              <CardContent className="p-4 sm:p-6 flex items-center space-x-4">
                <div className="bg-amber-50 p-2.5 sm:p-3 rounded-lg sm:rounded-xl">
                  <Bookmark className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-indigo-900 text-sm sm:text-base">Quick Bookmarks</h3>
                  <p className="text-[10px] sm:text-sm text-gray-500">External course links.</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* User Manual Card */}
          <Link to="/instructions" className="group">
            <Card className="border-indigo-100 shadow-md hover:shadow-lg transition-all rounded-xl sm:rounded-2xl bg-white border hover:border-indigo-200">
              <CardContent className="p-4 sm:p-6 flex items-center space-x-4">
                <div className="bg-indigo-50 p-2.5 sm:p-3 rounded-lg sm:rounded-xl">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-indigo-900 text-sm sm:text-base">User Manual</h3>
                  <p className="text-[10px] sm:text-sm text-gray-500">Learn how to use the archiver.</p>
                </div>
              </CardContent>
            </Card>
          </Link>

        </div>
      </main>
      
      <footer className="mt-12 sm:mt-20">
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default Index;