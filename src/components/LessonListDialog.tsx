"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useJobLessons } from '@/hooks/use-job-lessons';
import { Loader2, CheckCircle, XCircle, Clock, Download, LinkIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Lesson } from '@/types/supabase';

interface LessonListDialogProps {
  jobId: string | null;
  jobTargetUrl: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const getLessonStatusBadge = (status: Lesson['status']) => {
  switch (status) {
    case 'processing':
      return <Badge className="bg-blue-500 hover:bg-blue-600 text-white rounded-full"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Processing</Badge>;
    case 'completed':
      return <Badge className="bg-green-500 hover:bg-green-600 text-white rounded-full"><CheckCircle className="w-3 h-3 mr-1" /> Completed</Badge>;
    case 'failed':
      return <Badge className="bg-red-500 hover:bg-red-600 text-white rounded-full"><XCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
    case 'pending':
    default:
      return <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
  }
};

const LessonListDialog: React.FC<LessonListDialogProps> = ({ jobId, jobTargetUrl, isOpen, onOpenChange }) => {
  const { data: lessons, isLoading, isError } = useJobLessons(jobId);

  const getLessonName = (url: string) => {
    try {
      const parts = url.split('/');
      const lastPart = parts[parts.length - 1];
      if (lastPart.startsWith('lesson-')) {
        return lastPart.replace('lesson-', '').split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      }
      return lastPart;
    } catch {
      return url;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-indigo-700">
            Lesson Details
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Lessons discovered for course: <a href={jobTargetUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline truncate max-w-full inline-block">{jobTargetUrl}</a>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] w-full pr-4">
          {isLoading && (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
              <span className="ml-2 text-gray-600">Loading lessons...</span>
            </div>
          )}

          {isError && (
            <div className="p-4 text-center text-red-600 bg-red-50 rounded-xl">
              Failed to load lesson data.
            </div>
          )}

          {lessons && lessons.length > 0 ? (
            <div className="space-y-4">
              {lessons.map((lesson, index) => (
                <div key={lesson.id} className="flex items-center justify-between p-4 border border-indigo-100 rounded-xl shadow-sm hover:shadow-md transition-shadow bg-white">
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="font-semibold text-gray-800 truncate">
                      {index + 1}. {getLessonName(lesson.lesson_url)}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      {getLessonStatusBadge(lesson.status)}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a href={lesson.lesson_url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:text-indigo-700">
                            <LinkIcon className="w-3 h-3" />
                          </a>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View Lesson Page</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    {lesson.video_url && lesson.status === 'completed' ? (
                      <Button 
                        asChild
                        variant="outline" 
                        size="sm" 
                        className="rounded-lg text-indigo-600 border-indigo-300 hover:bg-indigo-50"
                      >
                        <a href={lesson.video_url} target="_blank" rel="noopener noreferrer" download>
                          <Download className="w-4 h-4 mr-1" /> Download
                        </a>
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" disabled className="rounded-lg text-gray-400">
                        <Download className="w-4 h-4 mr-1" /> Download
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : lessons && lessons.length === 0 && (
            <div className="p-10 text-center text-gray-500">
              No lessons have been discovered for this job yet.
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default LessonListDialog;