"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useJobLessons } from '@/hooks/use-job-lessons';
import { Loader2, CheckCircle, XCircle, Clock, Download, LinkIcon, FolderDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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

// Define the desired order of modules
const MODULE_ORDER = [
  "Weekly Q & A",
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
  "Uncategorized", // Fallback for any missing category
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

const getLessonName = (url: string) => {
  try {
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1];
    if (lastPart.startsWith('lesson-')) {
      // Decode URL component and replace hyphens with spaces, then capitalize
      const decoded = decodeURIComponent(lastPart.replace('lesson-', ''));
      return decoded.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
    return lastPart;
  } catch {
    return url;
  }
};

// Helper function to generate the structured filename
const generateFilename = (categoryNumber: number, lessonNumber: number, categoryName: string, lessonName: string): string => {
  // Clean up category and lesson names for file system compatibility
  const cleanCategory = categoryName.replace(/[^a-zA-Z0-9\s&]/g, '').trim();
  const cleanLesson = lessonName.replace(/[^a-zA-Z0-9\s&]/g, '').trim();
  
  // Format: [C].[L] - [Category] - [Lesson Name].mp4
  return `${categoryNumber}.${lessonNumber} - ${cleanCategory} - ${cleanLesson}.mp4`;
};

// Function to group, sort, and number lessons
const processLessons = (lessons: Lesson[]): Record<string, (Lesson & { displayIndex: string, filename: string })[]> => {
  const grouped = lessons.reduce((acc, lesson) => {
    const category = lesson.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(lesson);
    return acc;
  }, {} as Record<string, Lesson[]>);

  // Sort categories based on MODULE_ORDER
  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    const indexA = MODULE_ORDER.indexOf(a);
    const indexB = MODULE_ORDER.indexOf(b);
    const finalIndexA = indexA === -1 ? Infinity : indexA;
    const finalIndexB = indexB === -1 ? Infinity : indexB;
    return finalIndexA - finalIndexB;
  });

  const numberedLessons: Record<string, (Lesson & { displayIndex: string, filename: string })[]> = {};
  
  sortedCategories.forEach((category, categoryIndex) => {
    const categoryNumber = categoryIndex + 1;
    const categoryLessons = grouped[category];
    
    numberedLessons[category] = categoryLessons.map((lesson, lessonIndex) => {
      const lessonNumber = lessonIndex + 1;
      const displayIndex = `${categoryNumber}.${lessonNumber}`;
      const lessonName = getLessonName(lesson.lesson_url);
      
      return {
        ...lesson,
        displayIndex,
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
  
  // Set the first category in the custom order to be open by default
  const [defaultOpenCategory] = categories;

  const handleDownloadAll = (category: string, lessons: (Lesson & { displayIndex: string, filename: string })[]) => {
    const completedVideos = lessons.filter(l => l.status === 'completed' && l.video_url);
    
    if (completedVideos.length === 0) {
      showError(`No completed videos found in the '${category}' module to download.`);
      return;
    }

    // In a real application, this would trigger a server-side endpoint to generate a zip file.
    showSuccess(`Initiating bulk download for '${category}' module (${completedVideos.length} videos).`);
    
    // Simulated action: open the first video link with the structured filename
    if (completedVideos[0].video_url) {
      const firstLesson = completedVideos[0];
      // We append the filename as a query parameter or path segment to hint the download name
      window.open(`${firstLesson.video_url}?filename=${encodeURIComponent(firstLesson.filename)}`, '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-indigo-700">
            Course Modules & Lessons
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Lessons discovered for course: <a href={jobTargetUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline truncate max-w-full inline-block">{jobTargetUrl}</a>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] w-full pr-4">
          {isLoading && (
            <div className="flex justify-center items-center h-full py-10">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
              <span className="ml-2 text-gray-600">Loading modules...</span>
            </div>
          )}

          {isError && (
            <div className="p-4 text-center text-red-600 bg-red-50 rounded-xl">
              Failed to load lesson data.
            </div>
          )}

          {categories.length > 0 ? (
            <Accordion type="multiple" defaultValue={[defaultOpenCategory]} className="w-full space-y-2">
              {categories.map((category) => {
                const lessons = numberedGroupedLessons[category];
                const completedCount = lessons.filter(l => l.status === 'completed' && l.video_url).length;
                const totalCount = lessons.length;
                const isDownloadable = completedCount > 0;

                if (totalCount === 0) return null; // Skip empty categories

                return (
                  <AccordionItem 
                    key={category} 
                    value={category} 
                    className="border border-indigo-200 rounded-xl shadow-md bg-white px-4"
                  >
                    <div className="flex justify-between items-center py-4">
                      <AccordionTrigger className="flex-1 p-0 hover:no-underline">
                        <div className="flex flex-col items-start flex-1 cursor-pointer hover:text-indigo-600 transition-colors">
                          <span className="font-bold text-lg text-indigo-800 text-left">
                            {lessons[0].displayIndex.split('.')[0]}. {category}
                          </span>
                          <span className="text-sm text-gray-500 mt-1">
                            {totalCount} Lessons ({completedCount} ready)
                          </span>
                        </div>
                      </AccordionTrigger>
                      
                      <div className="flex items-center space-x-3 ml-4">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent accordion from toggling
                            handleDownloadAll(category, lessons);
                          }}
                          disabled={!isDownloadable}
                          variant="default"
                          size="sm"
                          className={cn(
                            "rounded-lg h-8 transition-all",
                            isDownloadable ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          )}
                        >
                          <FolderDown className="w-4 h-4 mr-1" /> Download All
                        </Button>
                      </div>
                    </div>
                    <AccordionContent className="pt-2 pb-4">
                      <div className="space-y-3 border-t pt-3">
                        {lessons.map((lesson) => (
                          <div key={lesson.id} className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                            <div className="flex-1 min-w-0 mr-4">
                              <p className="font-medium text-gray-800 truncate">
                                {lesson.displayIndex} - {getLessonName(lesson.lesson_url)}
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
                                  variant="secondary" 
                                  size="sm" 
                                  className="rounded-lg text-indigo-600 border-indigo-300 hover:bg-indigo-100"
                                >
                                  {/* Use the generated filename for download attribute and append .mp4 to the URL */}
                                  <a 
                                    href={`${lesson.video_url}.mp4`} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    download={lesson.filename}
                                  >
                                    <Download className="w-4 h-4 mr-1" /> Download
                                  </a>
                                </Button>
                              ) : (
                                <Button variant="secondary" size="sm" disabled className="rounded-lg text-gray-400">
                                  <Download className="w-4 h-4 mr-1" /> Download
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
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