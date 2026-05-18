"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Terminal, 
  Copy, 
  Zap, 
  Upload,
  Loader2,
  ShieldCheck,
  Sparkles,
  FileJson,
  Rocket,
  Database
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { showSuccess, showError } from '@/utils/toast';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth-context';
import { useQueryClient } from '@tanstack/react-query';
import { useJobLessons } from '@/hooks/use-job-lessons';

const SCRAPER_V23_SCRIPT = `(async function() {
  const log = (msg, color = "#4f46e5") => console.log("%c" + msg, "background: " + color + "; color: white; padding: 2px 5px; border-radius: 3px; font-weight: bold;");
  log(" FNH Architect v23: Deep Scan Initiated ");

  const category = document.querySelector('.section__heading, h1, .syllabus__category-title')?.innerText?.trim() || "Uncategorized";
  const links = Array.from(document.querySelectorAll('a[href*="/posts/"]'))
    .map(a => ({ title: a.innerText.trim().split('\\n')[0], url: a.href }))
    .filter((v, i, a) => a.findIndex(t => t.url === v.url) === i);

  log(\`Found \${links.length} lessons. Starting extraction...\`);

  const results = [];
  for (let i = 0; i < links.length; i++) {
    const { title, url } = links[i];
    log(\`[\${i+1}/\${links.length}] Scanning: \${title}\`, "#6366f1");

    try {
      const response = await fetch(url);
      const text = await response.text();
      
      // Try to find Wistia ID or direct MP4 link
      let video_url = null;
      
      // Pattern 1: Direct Wistia Delivery URL
      const wistiaMp4 = text.match(/https:\\/\\/embed-ssl\\.wistia\\.com\\/deliveries\\/[a-z0-9]+\\.mp4/i);
      
      // Pattern 2: Wistia Media ID in embed code
      const wistiaId = text.match(/wistia\\.com\\/embed\\/medias\\/([a-z0-9]+)/i) || 
                       text.match(/wistia_async_([a-z0-9]+)/i);

      if (wistiaMp4) {
        video_url = wistiaMp4[0];
      } else if (wistiaId) {
        video_url = \`https://embed-ssl.wistia.com/deliveries/\${wistiaId[1]}.mp4\`;
      }

      results.push({ category, title, page_url: url, video_url });
    } catch (err) {
      console.error("Failed to fetch " + title, err);
      results.push({ category, title, page_url: url, video_url: null });
    }
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 400));
  }

  log(" Scan Complete! JSON copied to clipboard. ", "#10b981");
  const finalJson = JSON.stringify(results, null, 2);
  console.log(finalJson);
  
  // Attempt to copy to clipboard
  const el = document.createElement('textarea');
  el.value = finalJson;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  
  alert(\`Successfully scanned \${results.length} lessons from "\${category}". JSON is in your clipboard!\`);
})();`;

const Scraper = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: lessons, cleanJunk, isCleaning } = useJobLessons();
  const [importJson, setImportJson] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  const handleArchiveCourse = async () => {
    if (!user) return;
    setIsArchiving(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-course', {
        body: { user_id: user.id }
      });
      if (error) throw error;
      showSuccess("Foundations Course archived successfully!");
      queryClient.invalidateQueries({ queryKey: ['allLessons'] });
      navigate('/gallery');
    } catch (err: any) {
      showError("Archive failed: " + err.message);
    } finally {
      setIsArchiving(false);
    }
  };

  const handleCopy = (script: string, version: string) => {
    navigator.clipboard.writeText(script);
    showSuccess(`${version} script copied!`);
  };

  const handleExportLibrary = () => {
    if (!lessons || lessons.length === 0) {
      showError("No lessons to export.");
      return;
    }
    const exportData = lessons.map(l => ({
      category: l.category,
      title: l.title,
      page_url: l.lesson_url,
      video_url: l.video_url
    }));
    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
    showSuccess("Full library JSON copied to clipboard!");
  };

  const handleManualImport = async () => {
    if (!user) return;
    if (!importJson.trim()) {
      showError("Please paste the JSON first.");
      return;
    }
    setIsImporting(true);
    try {
      const data = JSON.parse(importJson);
      if (!Array.isArray(data)) throw new Error("Invalid format: Expected an array of lessons.");
      const lessonsToInsert = data.map((item: any) => ({
        user_id: user.id,
        lesson_url: item.page_url,
        title: item.title,
        video_url: item.video_url,
        status: item.video_url ? 'completed' : 'failed',
        category: item.category || 'Uncategorized',
      }));
      const { error } = await supabase
        .from('lessons')
        .upsert(lessonsToInsert, { onConflict: 'user_id,lesson_url' });
      if (error) throw error;
      showSuccess(`Successfully imported ${lessonsToInsert.length} lessons!`);
      setImportJson('');
      queryClient.invalidateQueries({ queryKey: ['allLessons'] });
      navigate('/gallery');
    } catch (err: any) {
      showError("Import failed: " + err.message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 sm:p-12 max-w-5xl mx-auto w-full">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-full hover:bg-white/5 text-slate-400">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center">
              <Terminal className="w-6 h-6 mr-3 text-primary" />
              Scraper
            </h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Extraction Tools</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleExportLibrary} className="border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 rounded-xl h-12 px-6 font-bold">
            <FileJson className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
          <Button variant="outline" onClick={() => cleanJunk()} disabled={isCleaning} className="border-amber-500/20 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 rounded-xl h-12 px-6 font-bold">
            {isCleaning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Clean Junk
          </Button>
        </div>
      </header>

      <main className="space-y-12">
        <section className="space-y-6">
          <div className="flex items-center space-x-2 text-primary">
            <Rocket className="w-5 h-5" />
            <h2 className="text-sm font-black uppercase tracking-widest">Verified Course Archive</h2>
          </div>
          <Card className="border-primary/20 bg-primary/5 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border-2">
            <CardContent className="p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 text-center md:text-left">
                <h3 className="text-2xl font-black text-white tracking-tight">Foundations Course</h3>
                <p className="text-slate-400 text-sm max-w-md leading-relaxed">
                  Instantly populate your library with all 60+ verified lessons. No scraping required.
                </p>
              </div>
              <Button onClick={handleArchiveCourse} disabled={isArchiving} className="bg-primary hover:bg-primary/90 text-white rounded-2xl px-10 py-8 h-auto font-black text-lg shadow-2xl shadow-primary/20 transition-all transform hover:scale-105 active:scale-95 shrink-0">
                {isArchiving ? <><Loader2 className="w-6 h-6 mr-3 animate-spin" /> Archiving...</> : <><Zap className="w-6 h-6 mr-3 fill-current" /> Archive Course Now</>}
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Database className="w-5 h-5" />
            <h2 className="text-sm font-black uppercase tracking-widest">Manual Import</h2>
          </div>
          <Card className="border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-[2rem] overflow-hidden">
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <p className="text-xs text-slate-400">Paste custom JSON results here to update your library manually.</p>
                <Textarea 
                  placeholder='[ { "category": "...", "title": "...", "video_url": "..." }, ... ]'
                  className="min-h-[150px] font-mono text-[10px] bg-black/40 border-white/5 rounded-2xl focus-visible:ring-emerald-500"
                  value={importJson}
                  onChange={(e) => setImportJson(e.target.value)}
                />
              </div>
              <Button onClick={handleManualImport} disabled={isImporting || !importJson.trim()} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl h-14 font-black shadow-lg shadow-emerald-500/20">
                {isImporting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Importing...</> : <><Upload className="w-5 h-5 mr-2" /> Sync to My Library</>}
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          <div className="flex items-center space-x-2 text-blue-400">
            <ShieldCheck className="w-5 h-5" />
            <h2 className="text-sm font-black uppercase tracking-widest">Live Scraper Tools</h2>
          </div>
          <Card className="border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-[2rem] overflow-hidden">
            <CardHeader className="border-b border-white/5 py-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-indigo-400 flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  FNH Architect v23 (Deep Scan)
                </CardTitle>
                <Button onClick={() => handleCopy(SCRAPER_V23_SCRIPT, 'v23')} size="sm" className="bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Script
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <ScrollArea className="h-[200px] w-full bg-black/40 rounded-2xl border border-white/5">
                <pre className="p-6 text-indigo-400/50 font-mono text-[10px] leading-relaxed">{SCRAPER_V23_SCRIPT}</pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="mt-24 opacity-30">
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default Scraper;