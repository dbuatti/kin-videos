"use client";

import { MadeWithDyad } from "@/components/made-with-dyad";
import { useAuth } from "@/integrations/supabase/auth-context";
import { Button } from "@/components/ui/button";
import { LogOut, Zap, BookOpen, Bug, Library, PlayCircle, RefreshCw, Bookmark, Terminal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import React, { useState } from 'react';
import { cn } from "@/lib/utils";

const Index = () => {
  const { user } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);

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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-12 border-b pb-6 border-indigo-100">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
            <Zap className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-indigo-900 tracking-tight">
              FNH Archiver
            </h1>
            <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest">Foundations Edition</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            onClick={handleSyncCourse} 
            disabled={isSyncing}
            variant="outline" 
            size="sm"
            className="rounded-xl border-indigo-200 text-indigo-600 hover:bg-indigo-50"
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isSyncing && "animate-spin")} />
            {isSyncing ? "Syncing..." : "Sync Course Data"}
          </Button>
          <Button 
            onClick={handleLogout} 
            variant="ghost" 
            size="sm"
            className="rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Video Gallery Card */}
          <Link to="/gallery" className="group">
            <Card className="h-full border-indigo-100 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden bg-white border-2 hover:border-indigo-300">
              <CardHeader className="bg-indigo-600 p-8 text-white group-hover:bg-indigo-700 transition-colors">
                <PlayCircle className="w-12 h-12 mb-4 opacity-80" />
                <CardTitle className="text-2xl font-bold">Video Gallery</CardTitle>
                <CardDescription className="text-indigo-100">
                  Browse and stream all course videos in a high-quality gallery view.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex items-center text-indigo-600 font-bold">
                  Open Gallery <Zap className="w-4 h-4 ml-2 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Course Inventory Card */}
          <Link to="/library" className="group">
            <Card className="h-full border-indigo-100 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden bg-white border-2 hover:border-indigo-300">
              <CardHeader className="bg-emerald-600 p-8 text-white group-hover:bg-emerald-700 transition-colors">
                <Library className="w-12 h-12 mb-4 opacity-80" />
                <CardTitle className="text-2xl font-bold">Course Inventory</CardTitle>
                <CardDescription className="text-emerald-100">
                  Sync your local files and track your download progress across all modules.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex items-center text-emerald-600 font-bold">
                  Manage Inventory <Zap className="w-4 h-4 ml-2 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Scraper Tool Card */}
          <Link to="/scraper" className="group">
            <Card className="border-indigo-100 shadow-md hover:shadow-lg transition-all rounded-2xl bg-white border hover:border-indigo-200">
              <CardContent className="p-6 flex items-center space-x-4">
                <div className="bg-slate-900 p-3 rounded-xl">
                  <Terminal className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-bold text-indigo-900">Scraper Tool</h3>
                  <p className="text-sm text-gray-500">Master extraction script for course data.</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Bookmarks Card */}
          <Link to="/bookmarks" className="group">
            <Card className="border-indigo-100 shadow-md hover:shadow-lg transition-all rounded-2xl bg-white border hover:border-indigo-200">
              <CardContent className="p-6 flex items-center space-x-4">
                <div className="bg-amber-50 p-3 rounded-xl">
                  <Bookmark className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-indigo-900">Quick Bookmarks</h3>
                  <p className="text-sm text-gray-500">Access external course links and tools.</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* User Manual Card */}
          <Link to="/instructions" className="group">
            <Card className="border-indigo-100 shadow-md hover:shadow-lg transition-all rounded-2xl bg-white border hover:border-indigo-200">
              <CardContent className="p-6 flex items-center space-x-4">
                <div className="bg-indigo-50 p-3 rounded-xl">
                  <BookOpen className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-indigo-900">User Manual</h3>
                  <p className="text-sm text-gray-500">Learn how to use the archiver effectively.</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Debugger Card */}
          <Link to="/debug" className="group">
            <Card className="border-indigo-100 shadow-md hover:shadow-lg transition-all rounded-2xl bg-white border hover:border-indigo-200">
              <CardContent className="p-6 flex items-center space-x-4">
                <div className="bg-slate-100 p-3 rounded-xl">
                  <Bug className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">System Debugger</h3>
                  <p className="text-sm text-gray-500">Inspect raw data and system health.</p>
                </div>
              </CardContent>
            </Card>
          </Link>

        </div>
      </main>
      
      <footer className="mt-20">
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default Index;