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
  ExternalLink,
  Bug,
  Database,
  Upload,
  CheckCircle2,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { showSuccess, showError } from '@/utils/toast';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth-context';
import { useQueryClient } from '@tanstack/react-query';

const COURSE_URL = "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations";

const SCRAPER_V16_SCRIPT = `(async function() {
  // --- CONFIGURATION ---
  var LIMIT = 5; // Set to 0 for unlimited
  // ---------------------

  var old = document.getElementById('fnh-scraper-ui');
  if (old) old.remove();

  var ui = document.createElement('div');
  ui.id = 'fnh-scraper-ui';
  ui.setAttribute('style', 'position:fixed;bottom:20px;right:20px;z-index:999999;background:#0f172a;border:2px solid #3b82f6;border-radius:24px;padding:24px;width:500px;font-family:sans-serif;color:#f8fafc;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);max-height:600px;overflow-y:auto;');
  
  var hdr = document.createElement('div');
  hdr.setAttribute('style', 'font-size:16px;font-weight:900;color:#3b82f6;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;text-transform:uppercase;letter-spacing:0.15em;');
  hdr.innerHTML = '<span>FNH Titan v16</span>';
  
  var xBtn = document.createElement('span');
  xBtn.setAttribute('style', 'cursor:pointer;color:#64748b;font-size:12px;padding:4px 8px;background:#1e293b;border-radius:8px;');
  xBtn.innerText = 'CLOSE';
  xBtn.onclick = function() { ui.remove(); };
  hdr.appendChild(xBtn);
  
  var statusEl = document.createElement('div');
  statusEl.setAttribute('style', 'color:#94a3b8;margin-bottom:12px;font-weight:bold;font-size:13px;');
  statusEl.innerText = 'Initializing...';
  
  var logEl = document.createElement('div');
  logEl.setAttribute('style', 'margin-top:16px;color:#64748b;font-size:11px;line-height:1.6;border-top:1px solid #1e293b;padding-top:12px;max-height:250px;overflow-y:auto;font-family:monospace;');
  
  ui.appendChild(hdr); ui.appendChild(statusEl); ui.appendChild(logEl);
  document.body.appendChild(ui);

  function setStatus(m,c){ statusEl.style.color=c||'#94a3b8'; statusEl.innerText=m; }
  function addLog(m,c){ 
    var d = document.createElement('div');
    d.style.color = c || '#64748b';
    d.style.marginBottom = '4px';
    d.innerText = m;
    logEl.prepend(d);
  }

  function getCleanStructure() {
    var structure = [];
    var seenUrls = new Set();
    
    // Smarter category detection: Look for containers that have post links inside them
    var containers = document.querySelectorAll('.syllabus__category, [data-category-id], .panel, .syllabus-section, .course-section, .category-card, .section');
    
    if (containers.length === 0) {
      addLog('No containers found, scanning all links...', '#f59e0b');
      var allLinks = Array.from(document.querySelectorAll('a[href*="/posts/"]'));
      var lessons = allLinks.map(a => ({ url: a.href.split('?')[0], title: a.innerText.trim().split(/[\\r\\n]+/)[0] }))
                           .filter(l => { if(seenUrls.has(l.url)) return false; seenUrls.add(l.url); return true; });
      if (lessons.length > 0) structure.push({ module: 'General', lessons: lessons });
    } else {
      containers.forEach(container => {
        // Try to find a title in or near the container
        var titleEl = container.querySelector('.syllabus__category-title, h2, h3, h4, .category-title, .section-title, .title, [data-role="title"]');
        
        // If no title inside, check the previous sibling (common in some Kajabi themes)
        if (!titleEl && container.previousElementSibling) {
            var prev = container.previousElementSibling;
            if (prev.tagName.match(/H[1-6]/) || prev.classList.contains('section-header')) titleEl = prev;
        }

        var moduleName = titleEl ? titleEl.innerText.trim() : 'Uncategorized';
        var links = Array.from(container.querySelectorAll('a[href*="/posts/"]'));
        var moduleLessons = [];
        
        links.forEach(a => {
          var url = a.href.split('?')[0];
          if (!seenUrls.has(url) && !a.classList.contains('next-post')) {
            seenUrls.add(url);
            var lessonTitle = a.innerText.trim().split(/[\\r\\n]+/)[0];
            moduleLessons.push({ url: url, title: lessonTitle });
          }
        });
        
        if (moduleLessons.length > 0) {
            // If we found "Uncategorized" but there's a heading right above the first link, use that
            if (moduleName === 'Uncategorized') {
                var firstLink = container.querySelector('a[href*="/posts/"]');
                var parent = firstLink.parentElement;
                while (parent && parent !== container) {
                    var h = parent.querySelector('h1,h2,h3,h4');
                    if (h) { moduleName = h.innerText.trim(); break; }
                    parent = parent.parentElement;
                }
            }
            structure.push({ module: moduleName, lessons: moduleLessons });
        }
      });
    }
    return structure;
  }

  async function extractVideo(html) {
    if (!html) return null;

    // 1. Direct Delivery Link (Fastest)
    var deliveryMatch = html.match(/https:\\/\\/embed-ssl\\.wistia\\.com\\/deliveries\\/([a-f0-9]{30,})\\.(bin|mp4)/i);
    if (deliveryMatch) return deliveryMatch[0].replace('.bin', '.mp4');

    // 2. Wistia ID Search (Restored robust v14 logic)
    var idMatch = html.match(/wistia\\.com\\/medias\\/([a-z0-9]{10})/i) || 
                  html.match(/"hashedId"\\s*:\\s*"([a-z0-9]{10})"/i) ||
                  html.match(/wistia-([a-z0-9]{10})/i) ||
                  html.match(/wistia_async_([a-z0-9]{10})/i) ||
                  html.match(/data-wistia-id="([a-z0-9]{10})"/i) ||
                  html.match(/data-video-id="([a-z0-9]{10})"/i);

    if (idMatch) {
      var wistiaId = idMatch[1];
      try {
        var r = await fetch('https://fast.wistia.com/embed/medias/' + wistiaId + '.json');
        var d = await r.json();
        var asset = d.media.assets.find(a => a.slug === 'mp4_h264_2950k' || a.display_name === '1080p') ||
                    d.media.assets.find(a => a.slug === 'mp4_h264_1271k' || a.display_name === '720p') ||
                    d.media.assets.find(a => a.type === 'original' || a.ext === 'mp4');
        if (asset) return asset.url.replace('.bin', '.mp4');
      } catch(e) {}
    }

    // 3. Kajabi Data Props (Restored v14 logic)
    var propsMatch = html.match(/data-props="([^"]+)"/);
    if (propsMatch) {
      try {
        var decoded = propsMatch[1].replace(/&quot;/g, '"');
        var props = JSON.parse(decoded);
        var vidId = props.video_id || (props.video && props.video.wistia_id);
        if (vidId) return await extractVideo('wistia-id-' + vidId);
      } catch(e) {}
    }

    return null;
  }

  setStatus('Scanning curriculum...');
  var fullStructure = getCleanStructure();
  var totalAvailable = fullStructure.reduce((n, s) => n + s.lessons.length, 0);
  var totalToProcess = LIMIT > 0 ? Math.min(LIMIT, totalAvailable) : totalAvailable;

  if (totalAvailable === 0) { setStatus('ERROR: No lessons!', '#ef4444'); return; }
  addLog('Found ' + totalAvailable + ' lessons. Processing ' + totalToProcess + '.', '#10b981');

  var results = [];
  var count = 0;

  for (var mod of fullStructure) {
    for (var lesson of mod.lessons) {
      if (LIMIT > 0 && count >= LIMIT) break;
      count++;
      setStatus('Processing ' + count + ' / ' + totalToProcess + '...');
      addLog('-> ' + lesson.title);
      
      try {
        var response = await fetch(lesson.url);
        var html = await response.text();
        var videoUrl = await extractVideo(html);
        results.push({ category: mod.module, title: lesson.title, page_url: lesson.url, video_url: videoUrl });
        if (videoUrl) addLog('   ✓ Success', '#10b981');
        else addLog('   × No Video', '#ef4444');
        await new Promise(r => setTimeout(r, 500));
      } catch (err) {
        addLog('   ! Error: ' + err.message, '#ef4444');
      }
    }
    if (LIMIT > 0 && count >= LIMIT) break;
  }

  setStatus('COMPLETE!', '#10b981');
  var btn = document.createElement('button');
  btn.innerText = 'COPY FINAL JSON';
  btn.setAttribute('style', 'width:100%;margin-top:12px;padding:14px;background:#3b82f6;color:white;border:none;border-radius:12px;font-weight:900;cursor:pointer;');
  btn.onclick = function() { 
    navigator.clipboard.writeText(JSON.stringify(results, null, 2)); 
    btn.innerText = 'COPIED!';
    setTimeout(() => btn.innerText = 'COPY FINAL JSON', 2000);
  };
  ui.appendChild(btn);
})();`;

const Scraper = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [importJson, setImportJson] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const handleCopy = (script: string, version: string) => {
    navigator.clipboard.writeText(script);
    showSuccess(`${version} script copied!`);
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
        <Button asChild className="bg-indigo-600 hover:bg-indigo-700 rounded-xl h-12 px-6 font-bold shadow-lg shadow-indigo-500/20">
          <a href={COURSE_URL} target="_blank" rel="noopener noreferrer">
            Go to Kajabi Course
            <ExternalLink className="w-4 h-4 ml-2" />
          </a>
        </Button>
      </header>

      <main className="space-y-12">
        <section className="space-y-6">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Database className="w-5 h-5" />
            <h2 className="text-sm font-black uppercase tracking-widest">Step 2: Import to App</h2>
          </div>
          <Card className="border-emerald-500/20 bg-emerald-500/5 backdrop-blur-xl rounded-[2rem] overflow-hidden border-2">
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <p className="text-xs text-slate-400">Paste the JSON results from the scraper here to update your library.</p>
                <Textarea 
                  placeholder='[ { "category": "...", "title": "...", "video_url": "..." }, ... ]'
                  className="min-h-[150px] font-mono text-[10px] bg-black/40 border-white/5 rounded-2xl focus-visible:ring-emerald-500"
                  value={importJson}
                  onChange={(e) => setImportJson(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleManualImport} 
                disabled={isImporting || !importJson.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl h-14 font-black text-lg shadow-lg shadow-emerald-500/20"
              >
                {isImporting ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Importing...</>
                ) : (
                  <><Upload className="w-5 h-5 mr-2" /> Sync to My Library</>
                )}
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          <div className="flex items-center space-x-2 text-blue-400">
            <ShieldCheck className="w-5 h-5" />
            <h2 className="text-sm font-black uppercase tracking-widest">Step 1: Run Scraper</h2>
          </div>
          
          <Tabs defaultValue="v16" className="w-full">
            <TabsList className="bg-white/5 border border-white/5 p-1 rounded-2xl mb-6">
              <TabsTrigger value="v16" className="rounded-xl px-6 font-bold data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                <Zap className="w-4 h-4 mr-2" />
                Titan v16
              </TabsTrigger>
              <TabsTrigger value="v15" className="rounded-xl px-6 font-bold data-[state=active]:bg-slate-800 data-[state=active]:text-white">
                Collector v15
              </TabsTrigger>
            </TabsList>

            <TabsContent value="v16">
              <Card className="border-blue-500/20 bg-blue-500/5 backdrop-blur-xl rounded-[2rem] overflow-hidden border-2">
                <CardHeader className="border-b border-blue-500/10 py-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-blue-400 flex items-center">
                      <Zap className="w-5 h-5 mr-2" />
                      FNH Titan v16 (Robust Mode)
                    </CardTitle>
                    <Button onClick={() => handleCopy(SCRAPER_V16_SCRIPT, 'v16')} size="sm" className="bg-blue-600 hover:bg-blue-500 rounded-xl font-bold">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy v16 Script
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">v16 Titan Improvements</h4>
                    <ul className="text-[11px] text-slate-400 space-y-2 list-disc pl-4">
                      <li><strong className="text-slate-200">Restored Extraction:</strong> Re-added the deep-scan logic that found videos in v14.</li>
                      <li><strong className="text-slate-200">Aggressive Categories:</strong> Now searches for headings above containers to fix "Uncategorized" issues.</li>
                      <li><strong className="text-slate-200">Limit Variable:</strong> Still set to 5 for testing. Change to 0 for full course.</li>
                    </ul>
                  </div>
                  <ScrollArea className="h-[200px] w-full bg-black/40 rounded-2xl border border-white/5">
                    <pre className="p-6 text-blue-400/50 font-mono text-[10px] leading-relaxed">{SCRAPER_V16_SCRIPT}</pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="v15">
              <Card className="border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-[2rem] overflow-hidden">
                <CardHeader className="border-b border-white/5 py-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center">
                      <Bug className="w-5 h-5 mr-2" />
                      Collector v15
                    </CardTitle>
                    <Button onClick={() => handleCopy(SCRAPER_V16_SCRIPT, 'v15')} size="sm" className="bg-slate-700 hover:bg-slate-600 rounded-xl font-bold">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy v15 Script
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <ScrollArea className="h-[200px] w-full bg-black/20 rounded-2xl border border-white/5">
                    <pre className="p-6 text-slate-500 font-mono text-[10px] leading-relaxed">{SCRAPER_V16_SCRIPT}</pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>
      </main>

      <footer className="mt-24 opacity-30">
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default Scraper;