"use client";

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/integrations/supabase/auth-context';
import { useJobLessons } from '@/hooks/use-job-lessons';
import { useLocalInventory } from '@/hooks/use-local-inventory';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Library as LibraryIcon, 
  CheckCircle2, 
  Circle, 
  Search,
  Terminal,
  PlayCircle,
  Download,
  RefreshCw,
  Trash2,
  Command
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { MODULE_ORDER, generateLessonFilename } from '@/utils/filenames';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { showSuccess } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { downloadFile } from '@/utils/download';
import VideoProgressIndicator from '@/components/VideoProgressIndicator';

const VIDEO_PATH = "/Users/danielebuatti/Library/CloudStorage/Dropbox/Wellness, Meditation and Kinesiology/FNH/Videos";

const Library = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: lessons, isLoading: lessonsLoading, refetch: refetchLessons, deleteLesson } = useJobLessons();
  const { data: localFiles, syncInventory, isSyncing } = useLocalInventory();
  
  const [pasteValue, setPasteValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleSync = () => {
    const lines = pasteValue.split('\n');
    syncInventory(lines);
    setPasteValue('');
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refetchLessons();
    setIsRefreshing(false);
    showSuccess("Lessons refreshed.");
  };

  const copyTerminalCommand = (recursive: boolean) => {
    const cmd = recursive 
      ? `find "${VIDEO_PATH}" -type f | pbcopy`
      : `find "${VIDEO_PATH}" -maxdepth 1 -type f | pbcopy`;
    navigator.clipboard.writeText(cmd);
    showSuccess("Command copied to clipboard!");
  };

  const processedData = useMemo(() => {
    if (!lessons || !localFiles) return { groups: [], stats: { total: 0, downloaded: 0 } };

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

    const groups = sortedCategories.map((category, catIdx) => {
      const categoryLessons = grouped[category].map((lesson, lesIdx) => {
        const expectedFilename = generateLessonFilename(catIdx + 1, lesIdx + 1, category, lesson.title || 'Untitled');
        const isDownloaded = localFileNames.has(expectedFilename.toLowerCase());
        
        total++;
        if (isDownloaded) downloaded++;

        return { ...lesson, expectedFilename, isDownloaded, displayIndex: `${catIdx + 1}.${lesIdx + 1}` };
      });

      return { category, categoryNumber: catIdx + 1, lessons: categoryLessons, downloadedCount: categoryLessons.filter(l => l.isDownloaded).length, totalCount: categoryLessons.length };
    });

    return { groups, stats: { total, downloaded } };
  }, [lessons, localFiles]);

  const filteredGroups = useMemo(() => {
    if (!searchQuery) return processedData.groups;
    return processedData.groups.map(group => ({
      ...group,
      lessons: group.lessons.filter(l => l.title?.toLowerCase().includes(searchQuery.toLowerCase()) || group.category.toLowerCase().includes(searchQuery.toLowerCase()))
    })).filter(group => group.lessons.length > 0);
  }, [processedData.groups, searchQuery]);

  return (
    <div className="min-h-screen bg-background p-6 sm:p-12 max-w-6xl mx-auto w-full">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-full hover:bg-white/5 text-slate-400">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center">
              <LibraryIcon className="w-6 h-6 mr-3 text-primary" />
              Inventory
            </h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Local File Sync</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={handleManualRefresh} disabled={isRefreshing} className="border-white/5 bg-white/5 text-slate-400 rounded-xl h-10">
            <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
          <Button asChild className="bg-primary hover:bg-primary/90 rounded-xl h-10 font-bold">
            <Link to="/gallery">
              <PlayCircle className="w-4 h-4 mr-2" />
              Gallery
            </Link>
          </Button>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <Card className="border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-[2rem] overflow-hidden">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center">
                <Terminal className="w-4 h-4 mr-2" /> Sync Local
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-2">
                <Button variant="ghost" size="sm" className="justify-start text-[10px] font-mono text-slate-400 hover:bg-white/5" onClick={() => copyTerminalCommand(false)}>
                  <Command className="w-3 h-3 mr-2" /> Copy Folder Cmd
                </Button>
                <Button variant="ghost" size="sm" className="justify-start text-[10px] font-mono text-slate-400 hover:bg-white/5" onClick={() => copyTerminalCommand(true)}>
                  <Command className="w-3 h-3 mr-2" /> Copy Subfolders Cmd
                </Button>
              </div>
              <Textarea 
                placeholder="Paste terminal output here..."
                className="min-h-[150px] font-mono text-[10px] bg-black/40 border-white/5 rounded-xl focus-visible:ring-primary"
                value={pasteValue}
                onChange={(e) => setPasteValue(e.target.value)}
              />
              <Button onClick={handleSync} disabled={isSyncing || !pasteValue.trim()} className="w-full bg-primary hover:bg-primary/90 rounded-xl h-12 font-bold">
                {isSyncing ? "Syncing..." : "Update Progress"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-[2rem]">
            <CardContent className="p-8 space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-4xl font-black text-primary">{processedData.stats.downloaded}</p>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Downloaded</p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-black text-slate-700">{processedData.stats.total}</p>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Total</p>
                </div>
              </div>
              <Progress value={processedData.stats.total > 0 ? (processedData.stats.downloaded / processedData.stats.total) * 100 : 0} className="h-2 bg-white/5" />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input 
              placeholder="Search lessons..." 
              className="pl-11 pr-11 rounded-2xl border-white/5 bg-white/5 h-12 text-sm focus-visible:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-6">
            {filteredGroups.map((group) => (
              <Card key={group.category} className="border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-[2rem] overflow-hidden">
                <div className="p-6 flex items-center justify-between border-b border-white/5">
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/20 text-primary w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border border-primary/20">
                      {group.categoryNumber}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{group.category}</h3>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">
                        {group.downloadedCount} / {group.totalCount} Ready
                      </p>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-white/5">
                  {group.lessons.map((lesson: any) => (
                    <div key={lesson.id} className="p-4 flex flex-col space-y-3 hover:bg-white/5 transition-colors group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 min-w-0">
                          {lesson.isDownloaded ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-700 shrink-0" />
                          )}
                          <p className={cn("text-xs font-bold truncate", lesson.isDownloaded ? "text-slate-400" : "text-white")}>
                            <span className="text-primary/50 mr-2">{lesson.displayIndex}</span>
                            {lesson.title}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-white" onClick={() => downloadFile(lesson.video_url!, lesson.expectedFilename)}>
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-500 hover:text-red-400" 
                            onClick={() => {
                              if (confirm(`Delete "${lesson.title}"?`)) deleteLesson(lesson.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="pl-7 pr-8">
                        <VideoProgressIndicator videoId={lesson.id} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <footer className="mt-24 opacity-30">
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default Library;