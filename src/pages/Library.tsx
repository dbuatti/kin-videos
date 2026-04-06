"use client";

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/integrations/supabase/auth-context';
import { useJobLessons } from '@/hooks/use-job-lessons';
import { useLocalInventory } from '@/hooks/use-local-inventory';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Library as LibraryIcon, 
  CheckCircle2, 
  Circle, 
  AlertCircle,
  Search,
  Terminal,
  PlayCircle,
  Download,
  RefreshCw,
  FolderDown,
  Command,
  CloudDownload
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MODULE_ORDER, generateLessonFilename } from '@/utils/filenames';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const VIDEO_PATH = "/Users/danielebuatti/Library/CloudStorage/Dropbox/Wellness, Meditation and Kinesiology/FNH/Videos";

const Library = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: lessons, isLoading: lessonsLoading, refetch: refetchLessons } = useJobLessons();
  const { data: localFiles, syncInventory, isSyncing } = useLocalInventory();
  
  const [pasteValue, setPasteValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showSuccess(`${label} copied to clipboard!`);
  };

  const copyTerminalCommand = (recursive: boolean) => {
    const cmd = recursive 
      ? `find "${VIDEO_PATH}" -type f | pbcopy`
      : `find "${VIDEO_PATH}" -maxdepth 1 -type f | pbcopy`;
    copyToClipboard(cmd, recursive ? "Subfolders Command" : "Folder Command");
  };

  const processedData = useMemo(() => {
    if (!lessons || !localFiles) return { groups: [], stats: { total: 0, downloaded: 0 }, remainingLessons: [] };

    const localFileNames = new Set(localFiles.map(f => f.file_name.toLowerCase()));
    
    const validLessons = lessons.filter(l => l.title && l.title !== 'Untitled' && l.video_url);

    const grouped = validLessons.reduce((acc, lesson) => {
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
    const remainingLessons: any[] = [];

    const groups = sortedCategories.map((category, catIdx) => {
      const categoryLessons = grouped[category].map((lesson, lesIdx) => {
        const expectedFilename = generateLessonFilename(
          catIdx + 1,
          lesIdx + 1,
          category,
          lesson.title
        );

        const isDownloaded = localFileNames.has(expectedFilename.toLowerCase());
        
        let fuzzyMatch = false;
        if (!isDownloaded) {
          const cleanTitle = lesson.title.toLowerCase();
          for (const localName of localFileNames) {
            if (localName.includes(cleanTitle)) {
              fuzzyMatch = true;
              break;
            }
          }
        }

        const finalMatch = isDownloaded || fuzzyMatch;
        total++;
        if (finalMatch) {
          downloaded++;
        } else {
          remainingLessons.push({
            ...lesson,
            expectedFilename,
            displayIndex: `${catIdx + 1}.${lesIdx + 1}`
          });
        }

        return {
          ...lesson,
          expectedFilename,
          isDownloaded: finalMatch,
          displayIndex: `${catIdx + 1}.${lesIdx + 1}`
        };
      });

      return {
        category,
        categoryNumber: catIdx + 1,
        lessons: categoryLessons,
        downloadedCount: categoryLessons.filter(l => l.isDownloaded).length,
        totalCount: categoryLessons.length
      };
    });

    return { groups, stats: { total, downloaded }, remainingLessons };
  }, [lessons, localFiles]);

  const filteredGroups = useMemo(() => {
    if (!searchQuery) return processedData.groups;
    
    return processedData.groups.map(group => ({
      ...group,
      lessons: group.lessons.filter(l => 
        l.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(group => group.lessons.length > 0);
  }, [processedData.groups, searchQuery]);

  const triggerDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadModule = async (group: any) => {
    const toDownload = group.lessons.filter((l: any) => !l.isDownloaded);
    if (toDownload.length === 0) {
      showSuccess("All videos in this module are already downloaded!");
      return;
    }

    showSuccess(`Starting sequential download for ${toDownload.length} videos in "${group.category}"...`);
    
    for (let i = 0; i < toDownload.length; i++) {
      const lesson = toDownload[i];
      triggerDownload(lesson.video_url!, lesson.expectedFilename);
      await new Promise(resolve => setTimeout(resolve, 1200));
    }
  };

  const handleDownloadRemaining = async () => {
    const remaining = processedData.remainingLessons;
    if (remaining.length === 0) {
      showSuccess("No remaining videos to download!");
      return;
    }

    setIsDownloadingAll(true);
    showSuccess(`Starting bulk download for ${remaining.length} remaining videos...`);
    
    try {
      for (let i = 0; i < remaining.length; i++) {
        const lesson = remaining[i];
        triggerDownload(lesson.video_url!, lesson.expectedFilename);
        // Slightly longer delay for bulk downloads to prevent browser blocking
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      showSuccess("All remaining downloads triggered!");
    } catch (err) {
      showError("Bulk download interrupted.");
    } finally {
      setIsDownloadingAll(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b pb-4 border-indigo-100">
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
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="text-indigo-600 border-indigo-200 rounded-xl"
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
          
          <Button 
            onClick={handleDownloadRemaining}
            disabled={isDownloadingAll || processedData.remainingLessons.length === 0}
            variant="outline" 
            size="sm" 
            className="text-amber-600 border-amber-200 hover:bg-amber-50 rounded-xl"
          >
            <CloudDownload className={cn("w-4 h-4 mr-2", isDownloadingAll && "animate-bounce")} />
            {isDownloadingAll ? "Downloading..." : `Download Remaining (${processedData.remainingLessons.length})`}
          </Button>

          <Button asChild variant="default" size="sm" className="bg-indigo-600 hover:bg-indigo-700 rounded-xl">
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
            <CardHeader className="bg-indigo-600 text-white py-4">
              <CardTitle className="text-md flex items-center">
                <Terminal className="w-4 h-4 mr-2" />
                Sync Local Files
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="justify-start text-xs font-mono border-indigo-100 text-indigo-600 hover:bg-indigo-50"
                  onClick={() => copyTerminalCommand(false)}
                >
                  <Command className="w-3 h-3 mr-2" />
                  Copy Folder Command
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="justify-start text-xs font-mono border-indigo-100 text-indigo-600 hover:bg-indigo-50"
                  onClick={() => copyTerminalCommand(true)}
                >
                  <Command className="w-3 h-3 mr-2" />
                  Copy Subfolders Command
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-400">Then Paste Below</span>
                </div>
              </div>

              <Textarea 
                placeholder="Paste terminal output here..."
                className="min-h-[120px] font-mono text-[10px] border-indigo-100 rounded-xl"
                value={pasteValue}
                onChange={(e) => setPasteValue(e.target.value)}
              />
              <Button 
                onClick={handleSync}
                disabled={isSyncing || !pasteValue.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-xl"
              >
                {isSyncing ? "Syncing..." : "Update Progress"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-indigo-100 shadow-lg rounded-2xl">
            <CardHeader className="py-4">
              <CardTitle className="text-md">Overall Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-3xl font-black text-indigo-600">{processedData.stats.downloaded}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Downloaded</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-amber-500">{processedData.stats.total - processedData.stats.downloaded}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Remaining</p>
                </div>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full transition-all duration-500" 
                  style={{ width: `${(processedData.stats.downloaded / processedData.stats.total) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search lessons or modules..." 
              className="pl-10 rounded-xl border-indigo-100 focus-visible:ring-indigo-500 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group) => (
                <Card key={group.category} className="border-indigo-100 shadow-sm rounded-2xl overflow-hidden bg-white">
                  <div className="p-4 flex items-center justify-between bg-indigo-50/50 border-b border-indigo-100">
                    <div className="flex items-center space-x-3">
                      <div className="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm">
                        {group.categoryNumber}
                      </div>
                      <div>
                        <h3 className="font-bold text-indigo-900 text-sm">{group.category}</h3>
                        <p className="text-[10px] text-indigo-400 font-medium">
                          {group.downloadedCount} / {group.totalCount} Videos Downloaded
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleDownloadModule(group)}
                      variant="outline" 
                      size="sm" 
                      className="rounded-lg border-indigo-200 text-indigo-600 hover:bg-indigo-100 h-8 text-xs"
                      disabled={group.downloadedCount === group.totalCount}
                    >
                      <FolderDown className="w-3.5 h-3.5 mr-1.5" />
                      Download Module
                    </Button>
                  </div>
                  
                  <div className="divide-y divide-indigo-50">
                    {group.lessons.map((lesson: any) => (
                      <div key={lesson.id} className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                        <div className="flex items-center space-x-3 min-w-0">
                          {lesson.isDownloaded ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-gray-300 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className={cn(
                              "text-xs font-medium truncate",
                              lesson.isDownloaded ? "text-gray-500" : "text-gray-900"
                            )}>
                              <span className="text-indigo-400 mr-2">{lesson.displayIndex}</span>
                              {lesson.title}
                            </p>
                          </div>
                        </div>
                        <Button asChild variant="ghost" size="icon" className="h-7 w-7 text-indigo-300 hover:text-indigo-600">
                          <a href={lesson.video_url} download={lesson.expectedFilename} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 h-4" />
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              ))
            ) : (
              <div className="p-20 text-center bg-white rounded-3xl border border-dashed border-indigo-200">
                <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No matching lessons found.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-12">
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default Library;