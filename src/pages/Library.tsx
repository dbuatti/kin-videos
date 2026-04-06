"use client";

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/integrations/supabase/auth-context';
import { useCrawlerJobs } from '@/hooks/use-crawler-jobs';
import { useJobLessons } from '@/hooks/use-job-lessons';
import { useLocalInventory } from '@/hooks/use-local-inventory';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Library as LibraryIcon, 
  RefreshCw, 
  CheckCircle2, 
  Circle, 
  AlertCircle,
  Search,
  Terminal,
  Copy,
  FileText,
  PlayCircle,
  Download,
  Map as MapIcon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { MODULE_ORDER, generateLessonFilename } from '@/utils/filenames';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const Library = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: jobs } = useCrawlerJobs();
  
  const latestJob = useMemo(() => {
    return jobs?.find(j => j.status === 'completed');
  }, [jobs]);

  const { data: lessons, isLoading: lessonsLoading } = useJobLessons(latestJob?.id || null);
  const { data: localFiles, syncInventory, isSyncing } = useLocalInventory();
  
  const [pasteValue, setPasteValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSync = () => {
    const lines = pasteValue.split('\n');
    syncInventory(lines);
    setPasteValue('');
  };

  const inventoryStats = useMemo(() => {
    if (!lessons || !localFiles) return { total: 0, downloaded: 0, missing: 0, processedLessons: [] };

    const localFileNames = new Set(localFiles.map(f => f.file_name.toLowerCase()));
    
    const grouped = lessons.reduce((acc, lesson) => {
      const category = lesson.category || 'Uncategorized';
      if (!acc[category]) acc[category] = [];
      acc[category].push(lesson);
      return acc;
    }, {} as Record<string, any[]>);

    const sortedCategories = Object.keys(grouped).sort((a, b) => {
      const indexA = MODULE_ORDER.indexOf(a);
      const indexB = MODULE_ORDER.indexOf(b);
      return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
    });

    let total = 0;
    let downloaded = 0;
    const processedLessons: any[] = [];

    sortedCategories.forEach((category, catIdx) => {
      grouped[category].forEach((lesson, lesIdx) => {
        if (!lesson.video_url) {
          processedLessons.push({
            ...lesson,
            isDownloaded: false,
            category,
            displayIndex: `${catIdx + 1}.${lesIdx + 1}`
          });
          return;
        }

        const expectedFilename = generateLessonFilename(
          catIdx + 1,
          lesIdx + 1,
          category,
          lesson.title || 'Untitled'
        );

        const isDownloaded = localFileNames.has(expectedFilename.toLowerCase());
        
        total++;
        if (isDownloaded) downloaded++;

        processedLessons.push({
          ...lesson,
          expectedFilename,
          isDownloaded,
          category,
          displayIndex: `${catIdx + 1}.${lesIdx + 1}`
        });
      });
    });

    return { 
      total, 
      downloaded, 
      missing: total - downloaded,
      processedLessons 
    };
  }, [lessons, localFiles]);

  const filteredLessons = useMemo(() => {
    return inventoryStats.processedLessons.filter(l => 
      l.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [inventoryStats.processedLessons, searchQuery]);

  const handleDownloadMissing = async () => {
    const missingVideos = inventoryStats.processedLessons.filter(l => !l.isDownloaded && l.video_url);
    if (missingVideos.length === 0) {
      showSuccess("All videos are already downloaded!");
      return;
    }

    showSuccess(`Starting download for ${missingVideos.length} missing videos...`);
    
    for (let i = 0; i < missingVideos.length; i++) {
      const lesson = missingVideos[i];
      const link = document.createElement('a');
      link.href = lesson.video_url!;
      link.download = lesson.expectedFilename;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const courseMapText = useMemo(() => {
    if (!lessons) return "";

    const grouped = lessons.reduce((acc, lesson) => {
      const category = lesson.category || 'Uncategorized';
      if (!acc[category]) acc[category] = [];
      acc[category].push(lesson);
      return acc;
    }, {} as Record<string, any[]>);

    const sortedCategories = Object.keys(grouped).sort((a, b) => {
      const indexA = MODULE_ORDER.indexOf(a);
      const indexB = MODULE_ORDER.indexOf(b);
      return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
    });

    let text = "";
    sortedCategories.forEach((category) => {
      text += `[${category}]\n`;
      grouped[category].forEach((lesson: any) => {
        text += `${lesson.title || 'Untitled'} 🔗 Page: ${lesson.lesson_url} 🎥 Video: ${lesson.video_url || 'No Video'}\n\n`;
      });
      text += "\n";
    });
    return text.trim();
  }, [lessons]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showSuccess(`${label} copied to clipboard!`);
  };

  const commands = [
    {
      label: "Combined List (Clean)",
      cmd: `(find "/Users/danielebuatti/Library/CloudStorage/Dropbox/Wellness, Meditation and Kinesiology/FNH" -maxdepth 1 -not -path '*/.*'; echo ""; echo "--- VIDEOS SUBFOLDER ---"; find "/Users/danielebuatti/Library/CloudStorage/Dropbox/Wellness, Meditation and Kinesiology/FNH/Videos" -maxdepth 1 -not -path '*/.*') | pbcopy`
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <header className="max-w-6xl mx-auto flex items-center justify-between mb-8 border-b pb-4 border-indigo-100">
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/')}
            className="rounded-full hover:bg-indigo-50 text-indigo-600"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-extrabold text-indigo-900 tracking-tight flex items-center">
            <LibraryIcon className="w-6 h-6 mr-2 text-indigo-600" />
            Course Inventory
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-indigo-600 border-indigo-200">
                <MapIcon className="w-4 h-4 mr-2" />
                View Course Map
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Course Map (Raw Format)</DialogTitle>
              </DialogHeader>
              <ScrollArea className="flex-1 bg-slate-950 p-4 rounded-xl font-mono text-[10px] text-slate-300">
                <pre className="whitespace-pre-wrap">{courseMapText}</pre>
              </ScrollArea>
              <Button onClick={() => copyToClipboard(courseMapText, "Course Map")} className="mt-4 bg-indigo-600">
                <Copy className="w-4 h-4 mr-2" /> Copy Map
              </Button>
            </DialogContent>
          </Dialog>
          <Button asChild variant="default" size="sm" className="bg-indigo-600 hover:bg-indigo-700">
            <Link to="/gallery">
              <PlayCircle className="w-4 h-4 mr-2" />
              Gallery
            </Link>
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="space-y-6">
          <Card className="border-indigo-100 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="bg-indigo-600 text-white">
              <CardTitle className="text-lg flex items-center">
                <Terminal className="w-5 h-5 mr-2" />
                Sync Terminal
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {commands.map((c, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{c.label}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-indigo-400 hover:text-indigo-600"
                      onClick={() => copyToClipboard(c.cmd, c.label)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800 text-[10px] font-mono text-slate-400 truncate">
                    {c.cmd}
                  </div>
                </div>
              ))}
              <Textarea 
                placeholder="Paste Terminal output here..."
                className="min-h-[100px] font-mono text-[10px] border-indigo-100 mt-4"
                value={pasteValue}
                onChange={(e) => setPasteValue(e.target.value)}
              />
              <Button 
                onClick={handleSync}
                disabled={isSyncing || !pasteValue.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-xl mt-2"
              >
                {isSyncing ? "Syncing..." : "Update Inventory"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-indigo-100 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Download Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-xl border border-green-100 text-center">
                  <p className="text-xs text-green-600 font-bold uppercase tracking-wider">Downloaded</p>
                  <p className="text-3xl font-black text-green-700">{inventoryStats.downloaded}</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-center">
                  <p className="text-xs text-amber-600 font-bold uppercase tracking-wider">Missing</p>
                  <p className="text-3xl font-black text-amber-700">{inventoryStats.missing}</p>
                </div>
              </div>
              <Button 
                onClick={handleDownloadMissing}
                disabled={inventoryStats.missing === 0}
                className="w-full bg-amber-600 hover:bg-amber-700 rounded-xl"
              >
                <Download className="w-4 h-4 mr-2" />
                Download All Missing
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search lessons or modules..." 
              className="pl-10 rounded-xl border-indigo-100 focus-visible:ring-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Card className="border-indigo-100 shadow-lg rounded-2xl overflow-hidden">
            <ScrollArea className="h-[600px]">
              <div className="divide-y divide-indigo-50">
                {filteredLessons.length > 0 ? (
                  filteredLessons.map((lesson) => (
                    <div key={lesson.id} className="p-4 hover:bg-indigo-50/30 transition-colors flex items-center justify-between group">
                      <div className="flex items-start space-x-4 min-w-0">
                        <div className="mt-1">
                          {lesson.isDownloaded ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">{lesson.displayIndex}</span>
                            <h4 className={cn(
                              "font-bold text-sm truncate",
                              lesson.isDownloaded ? "text-gray-700" : "text-indigo-900"
                            )}>
                              {lesson.title}
                            </h4>
                          </div>
                          <p className="text-xs text-gray-500 truncate mt-0.5">{lesson.category}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {!lesson.isDownloaded && lesson.video_url && (
                          <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 shrink-0">
                            Missing
                          </Badge>
                        )}
                        {lesson.video_url && (
                          <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-indigo-400 hover:text-indigo-600">
                            <a href={lesson.video_url} download={lesson.expectedFilename} target="_blank" rel="noopener noreferrer">
                              <Download className="h-5 w-5" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-20 text-center">
                    <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No lessons found matching your search.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </main>

      <footer className="mt-12">
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default Library;