"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useJobLessons } from '@/hooks/use-job-lessons';
import { Loader2, CheckCircle, XCircle, Clock, Download, FolderDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Lesson } from '@/types/supabase';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

interface LessonListDialogProps {
  jobId: string | null;
  jobTargetUrl: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const MODULE_ORDER = [
  "General / Intro",
  "Course Introduction & Foundational Knowledge",
  "Clinical Assessments",
  "Direct Muscle Tests",
  "Beginning Procedures - Sympathetic Down Regulation",
  "Lymphatic System Assessment and Correction",
  "Vagus Nerve",
  "Pathway Assessments and Corrections",
  "Primitive Reflexes",
  "Postural Reflexes",
  "Cranial Nerves",
  "Emotional Corrections",
  "Finishing Procedures and Home Reinforcement",
  "Background Information",
  "Masterclasses",
  "Functional Anatomy and Biomechanics",
  "Putting it all Together",
  "FNH Foundations Exam",
];

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

const generateFilename = (categoryNumber: number, lessonNumber: number, categoryName: string, lessonName: string): string => {
  const cleanCategory = categoryName.replace(/[^a-zA-Z0-9\s&]/g, '').trim();
  const cleanLesson = lessonName.replace(/[^a-zA-Z0-9\s&]/g, '').trim();
  return `${categoryNumber}.${lessonNumber} - ${cleanCategory} - ${cleanLesson}.mp4`;
};

const processLessons = (lessons: Lesson[]): Record<string, (Lesson & { displayIndex: string, filename: string })[]> => {
  const grouped = lessons.reduce((acc, lesson) => {
    const category = lesson.category || 'Uncategorized';
    if (!acc[category]) acc[category] = [];
    acc[category].push(lesson);
    return acc;
  }, {} as Record<string, Lesson[]>);

  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    const indexA = MODULE_ORDER.indexOf(a);
    const indexB = MODULE_ORDER.indexOf(b);
    return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
  });

  const numberedLessons: Record<string, (Lesson & { displayIndex: string, filename: string })[]> = {};
  sortedCategories.forEach((category, categoryIndex) => {
    const categoryNumber = categoryIndex + 1;
    numberedLessons[category] = grouped[category].map((lesson, lessonIndex) => {
      const lessonNumber = lessonIndex + 1;
      const lessonName = lesson.title || 'Untitled Lesson';
      return {
        ...lesson,
        displayIndex: `${categoryNumber}.${lessonNumber}`,
        filename: generateFilename(categoryNumber, lessonNumber, category, lessonName),
      };
    });
  });
  return numberedLessons;
};

const LessonListDialog: React.FC<LessonListDialogProps> = ({ jobId, jobTargetUrl, isOpen, onOpenChange }) => {
  const { data: lessons, isLoading, isError } = useJobLessons(jobId);
  const numberedGroupedLessons = lessons ? processLessons(lessons) : {};
  const categories = Object.keys(numberedGroupedLessons);
  const [defaultOpenCategory] = categories;

  const handleDownloadAll = async (category: string, lessons: (Lesson & { displayIndex: string, filename: string })[]) => {
    const completedVideos = lessons.filter(l => l.status === 'completed' && l.video_url);
    if (completedVideos.length === 0) {
      showError(`No completed videos found in '${category}'.`);
      return;
    }

    showSuccess(`Starting sequential download for '${category}' (${completedVideos.length} videos).`);
    
    for (let i = 0; i < completedVideos.length; i++) {
      const lesson = completedVideos[i];
      const link = document.createElement('a');
      link.href = lesson.video_url!;
      link.download = lesson.filename;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-indigo-700">Course Modules & Lessons</DialogTitle>
          <DialogDescription className="text-gray-600">
            Lessons for: <a href={jobTargetUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">{jobTargetUrl}</a>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[450px] w-full pr-4">
          {isLoading && <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-indigo-500" /></div>}
          {isError && <div className="p-4 text-center text-red-600 bg-red-50 rounded-xl">Failed to load data.</div>}

          {categories.length > 0 ? (
            <Accordion type="multiple" defaultValue={[defaultOpenCategory]} className="w-full space-y-2">
              {categories.map((category) => {
                const lessons = numberedGroupedLessons[category];
                const completedCount = lessons.filter(l => l.status === 'completed').length;
                const isDownloadable = completedCount > 0;

                return (
                  <AccordionItem key={category} value={category} className="border border-indigo-200 rounded-xl shadow-sm bg-white px-4">
                    <div className="flex justify-between items-center py-4">
                      <AccordionTrigger className="flex-1 p-0 hover:no-underline">
                        <div className="flex flex-col items-start text-left">
                          <span className="font-bold text-indigo-800">{lessons[0].displayIndex.split('.')[0]}. {category}</span>
                          <span className="text-xs text-gray-500">{lessons.length} Lessons ({completedCount} ready)</span>
                        </div>
                      </AccordionTrigger>
                      <Button
                        onClick={(e) => { e.stopPropagation(); handleDownloadAll(category, lessons); }}
                        disabled={!isDownloadable}
                        variant="default"
                        size="sm"
                        className={cn("rounded-lg h-8 ml-4", isDownloadable ? 'bg-indigo-600' : 'bg-gray-300')}
                      >
                        <FolderDown className="w-4 h-4 mr-1" /> Download All
                      </Button>
                    </div>
                    <AccordionContent className="pt-2 pb-4 space-y-2">
                      {lessons.map((lesson) => (
                        <div key={lesson.id} className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                          <div className="flex-1 min-w-0 mr-4">
                            <p className="font-medium text-sm text-gray-800 truncate">{lesson.displayIndex} - {lesson.title}</p>
                            <div className="flex items-center space-x-2 mt-1">{getLessonStatusBadge(lesson.status)}</div>
                          </div>
                          {lesson.video_url && lesson.status === 'completed' ? (
                            <Button asChild variant="secondary" size="sm" className="rounded-lg text-indigo-600">
                              <a href={lesson.video_url} download={lesson.filename} target="_blank" rel="noopener noreferrer">
                                <Download className="w-4 h-4" />
                              </a>
                            </Button>
                          ) : (
                            <Button variant="secondary" size="sm" disabled className="rounded-lg text-gray-400"><Download className="w-4 h-4" /></Button>
                          )}
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : lessons?.length === 0 && <div className="p-10 text-center text-gray-500">No lessons discovered yet.</div>}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default LessonListDialog;