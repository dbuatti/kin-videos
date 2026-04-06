"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/integrations/supabase/auth-context';
import { useCrawlerJobs } from '@/hooks/use-crawler-jobs';
import { useJobLessons } from '@/hooks/use-job-lessons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Bug, Database, Shield, RefreshCw, Terminal } from 'lucide-react';
import { MadeWithDyad } from '@/components/made-with-dyad';

const Debug = () => {
  const navigate = useNavigate();
  const { user, session, isLoading: authLoading } = useAuth();
  const { data: jobs, isLoading: jobsLoading, refetch: refetchJobs } = useCrawlerJobs();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const { data: lessons, isLoading: lessonsLoading, refetch: refetchLessons } = useJobLessons(selectedJobId);

  const handleRefresh = () => {
    refetchJobs();
    if (selectedJobId) refetchLessons();
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
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          size="sm" 
          className="border-slate-700 bg-slate-900 hover:bg-slate-800"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Force Refetch
        </Button>
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
                <p><span className="text-slate-500">JWT Exp:</span> {session?.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'N/A'}</p>
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
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-950 rounded border border-slate-800">
                  <p className="text-slate-500 mb-1">Total Jobs</p>
                  <p className="text-xl font-bold">{jobs?.length || 0}</p>
                </div>
                <div className="p-3 bg-slate-950 rounded border border-slate-800">
                  <p className="text-slate-500 mb-1">Active Jobs</p>
                  <p className="text-xl font-bold text-amber-400">
                    {jobs?.filter(j => j.status === 'running' || j.status === 'pending').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Raw Data Inspector */}
        <Card className="bg-slate-900 border-slate-800 text-slate-300">
          <CardHeader className="border-b border-slate-800">
            <CardTitle className="text-sm font-bold flex items-center text-indigo-400">
              <Terminal className="w-4 h-4 mr-2" /> Raw Data Inspector
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="jobs" className="w-full">
              <TabsList className="w-full justify-start bg-slate-950 rounded-none border-b border-slate-800 p-0 h-10">
                <TabsTrigger value="jobs" className="rounded-none data-[state=active]:bg-slate-900 data-[state=active]:text-indigo-400 px-6">Jobs Table</TabsTrigger>
                <TabsTrigger value="lessons" className="rounded-none data-[state=active]:bg-slate-900 data-[state=active]:text-indigo-400 px-6">Lessons Table</TabsTrigger>
              </TabsList>
              
              <TabsContent value="jobs" className="m-0">
                <ScrollArea className="h-[400px] w-full p-4 bg-slate-950">
                  <pre className="text-[10px] leading-relaxed">
                    {jobsLoading ? 'Loading jobs...' : JSON.stringify(jobs, null, 2)}
                  </pre>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="lessons" className="m-0">
                <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center space-x-4">
                  <select 
                    className="bg-slate-950 border border-slate-700 text-xs p-1 rounded outline-none"
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    value={selectedJobId || ''}
                  >
                    <option value="">Select a Job ID to inspect lessons</option>
                    {jobs?.map(job => (
                      <option key={job.id} value={job.id}>{job.id.slice(0,8)}... ({job.target_url.slice(0,30)}...)</option>
                    ))}
                  </select>
                  {lessonsLoading && <RefreshCw className="w-3 h-3 animate-spin text-slate-500" />}
                </div>
                <ScrollArea className="h-[330px] w-full p-4 bg-slate-950">
                  <pre className="text-[10px] leading-relaxed">
                    {!selectedJobId ? '// Select a job above' : (lessonsLoading ? 'Loading lessons...' : JSON.stringify(lessons, null, 2))}
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