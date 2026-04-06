"use client";

import { useAuth } from "@/integrations/supabase/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LogOut, 
  Zap, 
  PlayCircle, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  CloudDownload, 
  BarChart3,
  ArrowRight,
  Video,
  Headphones,
  Library
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import SyllabusClipboard from "@/components/SyllabusClipboard";
import PlaybackSpeedControl from "@/components/PlaybackSpeedControl";
import { useCourseProgress } from "@/hooks/use-course-progress";
import { useLastWatched } from "@/hooks/use-last-watched";
import { useLocalInventory } from "@/hooks/use-local-inventory";
import { Progress } from "@/components/ui/progress";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSyncing, setIsSyncing] = useState(false);
  const { data: courseProgress } = useCourseProgress();
  const { data: lastWatched } = useLastWatched();
  const { data: localFiles } = useLocalInventory();

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

  const stats = [
    { label: 'Total Lessons', value: courseProgress?.totalCount || 0, icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Downloaded', value: localFiles?.length || 0, icon: CloudDownload, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Watched', value: courseProgress?.watchedCount || 0, icon: CheckCircle2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-indigo-900 tracking-tight">Command Center</h1>
          <p className="text-gray-500 font-medium">Welcome back, {user?.email?.split('@')[0]}</p>
        </div>
        <div className="flex items-center space-x-2">
          <PlaybackSpeedControl />
          <Button 
            onClick={handleSyncCourse} 
            disabled={isSyncing}
            variant="outline" 
            className="rounded-xl border-indigo-100 text-indigo-600 hover:bg-indigo-50"
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isSyncing && "animate-spin")} />
            Sync Course
          </Button>
          <Button 
            onClick={handleLogout} 
            variant="ghost" 
            size="icon"
            className="rounded-xl text-red-500 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className={cn("p-3 rounded-xl", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Progress & Resume */}
        <div className="lg:col-span-2 space-y-8">
          {/* Continue Watching */}
          {lastWatched ? (
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-indigo-600 text-white relative group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <PlayCircle className="w-32 h-32" />
              </div>
              <CardContent className="p-8 relative z-10">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-4">
                    <Badge className="bg-white/20 text-white border-none px-3 py-1">RESUME LEARNING</Badge>
                    <div>
                      <h2 className="text-2xl font-black leading-tight mb-1">{lastWatched.title}</h2>
                      <p className="text-indigo-100 font-medium opacity-80">{lastWatched.category}</p>
                    </div>
                    <div className="flex items-center space-x-4 text-sm font-bold">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1.5 opacity-60" />
                        {lastWatched.percentage}% Complete
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => navigate('/master-player?mode=video')}
                    className="bg-white text-indigo-600 hover:bg-indigo-50 font-black rounded-2xl px-8 py-6 h-auto text-lg shadow-xl transform hover:scale-105 transition-all"
                  >
                    Resume Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
                <div className="mt-8 w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div className="bg-white h-full transition-all duration-1000" style={{ width: `${lastWatched.percentage}%` }} />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed border-2 border-indigo-100 bg-indigo-50/30 rounded-3xl p-12 text-center">
              <PlayCircle className="w-12 h-12 text-indigo-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-indigo-900">Ready to start?</h3>
              <p className="text-indigo-400 text-sm mb-6">Sync your course data to begin tracking your progress.</p>
              <Button onClick={handleSyncCourse} className="bg-indigo-600 rounded-xl">Initialize Course</Button>
            </Card>
          )}

          {/* Course Completion Card */}
          <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-black text-indigo-900 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-indigo-600" />
                Overall Completion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-end">
                <span className="text-5xl font-black text-indigo-600">{courseProgress?.percentage || 0}%</span>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-400 uppercase">Total Progress</p>
                  <p className="text-sm font-bold text-indigo-900">{courseProgress?.watchedCount || 0} of {courseProgress?.totalCount || 0} Lessons</p>
                </div>
              </div>
              <Progress value={courseProgress?.percentage || 0} className="h-3 bg-indigo-50" />
            </CardContent>
          </Card>

          <SyllabusClipboard />
        </div>

        {/* Right Column: Quick Access Tools */}
        <div className="space-y-6">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">Quick Access</h3>
          
          <div className="grid grid-cols-1 gap-4">
            <Link to="/master-player?mode=video">
              <Card className="border-none shadow-sm hover:shadow-md transition-all rounded-2xl bg-slate-900 text-white group overflow-hidden">
                <CardContent className="p-5 flex items-center space-x-4">
                  <div className="bg-indigo-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                    <Video className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold">Video Stitcher</h4>
                    <p className="text-[10px] text-indigo-300 font-medium uppercase tracking-wider">Binge Watch Mode</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/master-player?mode=audio">
              <Card className="border-none shadow-sm hover:shadow-md transition-all rounded-2xl bg-indigo-950 text-white group overflow-hidden">
                <CardContent className="p-5 flex items-center space-x-4">
                  <div className="bg-emerald-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                    <Headphones className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold">Audio Stitcher</h4>
                    <p className="text-[10px] text-emerald-300 font-medium uppercase tracking-wider">Podcast Mode</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/gallery">
              <Card className="border-none shadow-sm hover:shadow-md transition-all rounded-2xl bg-white group overflow-hidden">
                <CardContent className="p-5 flex items-center space-x-4">
                  <div className="bg-indigo-50 p-3 rounded-xl group-hover:bg-indigo-100 transition-colors">
                    <PlayCircle className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-indigo-900">Video Gallery</h4>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Browse All Content</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/library">
              <Card className="border-none shadow-sm hover:shadow-md transition-all rounded-2xl bg-white group overflow-hidden">
                <CardContent className="p-5 flex items-center space-x-4">
                  <div className="bg-emerald-50 p-3 rounded-xl group-hover:bg-emerald-100 transition-colors">
                    <Library className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-900">Inventory</h4>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Manage Local Files</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          <Card className="border-none shadow-sm bg-indigo-900 text-white rounded-3xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center">
                <Zap className="w-4 h-4 mr-2 text-amber-400" />
                Pro Tip
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-indigo-200 leading-relaxed">
                Use the <strong>Master Player</strong> to track your progress automatically across both video and audio modes.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;