"use client";

import React from 'react';
import { useCrawlerJobs } from '@/hooks/use-crawler-jobs';
import { CrawlerJob } from '@/types/supabase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Clock, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const getStatusBadge = (status: CrawlerJob['status']) => {
  switch (status) {
    case 'running':
      return <Badge className="bg-blue-500 hover:bg-blue-600 text-white rounded-full"><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Running</Badge>;
    case 'completed':
      return <Badge className="bg-green-500 hover:bg-green-600 text-white rounded-full"><CheckCircle className="w-4 h-4 mr-1" /> Completed</Badge>;
    case 'failed':
      return <Badge className="bg-red-500 hover:bg-red-600 text-white rounded-full"><XCircle className="w-4 h-4 mr-1" /> Failed</Badge>;
    case 'pending':
    default:
      return <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full"><Clock className="w-4 h-4 mr-1" /> Pending</Badge>;
  }
};

const formatTime = (timestamp: string | null) => {
  if (!timestamp) return 'N/A';
  return new Date(timestamp).toLocaleString();
};

const JobTable: React.FC = () => {
  const { data: jobs, isLoading, isError } = useCrawlerJobs();

  if (isLoading) {
    return (
      <div className="space-y-4 p-6 bg-white rounded-2xl shadow-lg border border-indigo-100">
        <h3 className="text-xl font-bold text-indigo-700 mb-4">Recent Crawl Jobs</h3>
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !jobs) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700">
        Error loading jobs. Please check your connection and ensure RLS policies are set correctly.
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="p-10 text-center bg-white rounded-2xl shadow-lg border border-indigo-100">
        <Zap className="w-10 h-10 text-indigo-400 mx-auto mb-4" />
        <p className="text-lg font-semibold text-gray-700">No crawl jobs found.</p>
        <p className="text-sm text-gray-500">Start a new job above to see it appear here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 overflow-hidden">
      <h3 className="text-xl font-bold text-indigo-700 p-6 border-b border-indigo-100">Recent Crawl Jobs ({jobs.length})</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-indigo-50 hover:bg-indigo-50">
              <TableHead className="w-[200px] text-indigo-800">Status</TableHead>
              <TableHead className="text-indigo-800">Target URL</TableHead>
              <TableHead className="text-indigo-800">Progress</TableHead>
              <TableHead className="text-indigo-800">Started At</TableHead>
              <TableHead className="text-indigo-800">Finished At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id} className="hover:bg-gray-50 transition-colors">
                <TableCell>{getStatusBadge(job.status)}</TableCell>
                <TableCell className="font-medium text-gray-700 truncate max-w-xs sm:max-w-md">
                  <a href={job.target_url} target="_blank" rel="noopener noreferrer" className="hover:underline text-indigo-600">
                    {job.target_url}
                  </a>
                </TableCell>
                <TableCell>
                  {job.total_lessons > 0 
                    ? `${job.lessons_processed} / ${job.total_lessons}` 
                    : (job.status === 'running' ? 'Discovering...' : '0 / 0')}
                </TableCell>
                <TableCell className="text-sm text-gray-500">{formatTime(job.start_time)}</TableCell>
                <TableCell className="text-sm text-gray-500">{formatTime(job.end_time)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default JobTable;