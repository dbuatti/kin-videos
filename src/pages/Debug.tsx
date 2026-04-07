"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/integrations/supabase/auth-context';
import { useJobLessons } from '@/hooks/use-job-lessons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Bug, Database, Shield, RefreshCw, Terminal, Trash2 } from 'lucide-react';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { getLogs, clearLogs } from '@/utils/logger';
import { cn } from '@/lib/utils';

const Debug = () => {
  const navigate = useNavigate();
  const { user, session, isLoading: authLoading } = useAuth();
  const { data: lessons, isLoading: lessonsLoading, refetch: refetchLessons } = useJobLessons();
  const [playbackLogs, setPlaybackLogs] = useState(getLogs());

  useEffect(() => {
    const handleLogUpdate = () => setPlaybackLogs(getLogs());
    window.addEventListener('app-log-updated', handleLogUpdate);
    return () => window.removeEventListener('app-log-updated', handleLogUpdate);
  }, []);

  const handleRefresh = () => {
    refetchLessons();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 sm:p-8 font-mono">
      <header className="max-w-6xl mx-auto flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/')}
            className="rounded-full hover:bg-slate-800 text-slate-400"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-bold text-indigo-400 flex items-center">
            <Bug className="w-6 h-6 mr-2" />
            System Debugger
          </h1>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={() => clearLogs()} 
            variant="outline" 
            size="sm" 
            className="border-slate-700 bg-slate-900 hover:bg-slate-800 text-red-400"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Logs
          </Button>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm" 
            className="border-slate-700 bg-slate-900 hover:bg-slate-800"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Force Refetch
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Auth State */}
          <Card className="bg-slate-900 border-slate-800 text-slate-300 lg:col-span-1">
            <CardHeader className="border-b border-slate-800">
              <CardTitle className="text-sm font-bold flex items-center text-emerald-400">
                <Shield className="w-4 h-4 mr-2" /> Session Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2 text-xs">
                <p><span className="text-slate-500">User ID:</span> {user?.id || 'null'}</p>
                <p><span className="text-slate-500">Email:</span> {user?.email || 'null'}</p>
                <p><span className="text-slate-500">Auth Status:</span> {authLoading ? 'Loading...' : (user ? 'Authenticated' : 'Anonymous')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Database Stats */}
          <Card className="bg-slate-900 border-slate-800 text-slate-300 lg:col-span-2">
            <CardHeader className="border-b border-slate-800">
              <CardTitle className="text-sm font-bold flex items-center text-blue-400">
                <Database className="w-4 h-4 mr-2" /> Database Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 gap-4 text-xs">
                <div className="p-3 bg-slate-950 rounded border border-slate-800">
                  <p className="text-slate-500 mb-1">Total Lessons</p>
                  <p className="text-xl font-bold">{lessons?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Raw Data Inspector */}
        <Card className="bg-slate-900 border-slate-800 text-slate-300">
          <CardHeader className="border-b border-slate-800">
            <CardTitle className="text-sm font-bold flex items-center text-indigo-400">
              <Terminal className="w-4 h-4 mr-2" /> System Inspector
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="logs" className="w-full">
              <TabsList className="w-full justify-start bg-slate-950 rounded-none border-b border-slate-800 p-0 h-10">
                <TabsTrigger value="logs" className="rounded-none data-[state=active]:bg-slate-900 data-[state=active]:text-indigo-400 px-6">Playback Logs</TabsTrigger>
                <TabsTrigger value="lessons" className="rounded-none data-[state=active]:bg-slate-900 data-[state=active]:text-indigo-400 px-6">Lessons Table</TabsTrigger>
              </TabsList>
              
              <TabsContent value="logs" className="m-0">
                <ScrollArea className="h-[400px] w-full p-4 bg-slate-950">
                  <div className="space-y-1">
                    {playbackLogs.length === 0 && <p className="text-slate-600 italic text-xs">No logs captured yet. Play a video to see events.</p>}
                    {playbackLogs.map((l, i) => (
                      <div key={i} className="text-[10px] flex space-x-3 border-b border-white/5 pb-1">
                        <span className="text-slate-600 shrink-0">{l.timestamp}</span>
                        <span className={cn(
                          "font-bold shrink-0 w-12",
                          l.level === 'error' ? 'text-red-500' : l.level === 'warn' ? 'text-amber-500' : 'text-indigo-400'
                        )}>[{l.level.toUpperCase()}]</span>
                        <span className="text-slate-300">{l.message}</span>
                        {l.data && <span className="text-slate-500 truncate">{JSON.stringify(l.data)}</span>}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="lessons" className="m-0">
                <ScrollArea className="h-[400px] w-full p-4 bg-slate-950">
                  <pre className="text-[10px] leading-relaxed">
                    {lessonsLoading ? 'Loading lessons...' : JSON.stringify(lessons, null, 2)}
                  </pre>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      <div className="mt-12 opacity-50">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Debug;