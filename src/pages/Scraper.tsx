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
  ShieldCheck,
  Search
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { showSuccess, showError } from '@/utils/toast';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth-context';
import { useQueryClient } from '@tanstack/react-query';

const COURSE_URL = "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations";

const SCRAPER_V20_SCRIPT = `(async function() {
  // --- CONFIGURATION ---
  var LIMIT = 0; // Set to 0 for unlimited (Full Course)
  // ---------------------

  var old = document.getElementById('fnh-scraper-ui');
  if (old) old.remove();

  var ui = document.createElement('div');
  ui.id = 'fnh-scraper-ui';
  ui.setAttribute('style', 'position:fixed;bottom:20px;right:20px;z-index:999999;background:#0f172a;border:2px solid #6366f1;border-radius:24px;padding:24px;width:500px;font-family:sans-serif;color:#f8fafc;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);max-height:600px;overflow-y:auto;');
  
  var hdr = document.createElement('div');
  hdr.setAttribute('style', 'font-size:16px;font-weight:900;color:#6366f1;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;text-transform:uppercase;letter-spacing:0.15em;');
  hdr.innerHTML = '<span>FNH Architect v20</span>';
  
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

  function extractLinksFromDoc(doc, defaultModule) {
    var links = [];
    var allLinks = Array.from(doc.querySelectorAll('a[href*="/posts/"]'));
    var seenUrls = new Set();

    var pageTitle = doc.querySelector('h1, .category-header h1')?.innerText.trim();

    allLinks.forEach(a => {
        var url = a.href.split('?')[0];
        if (seenUrls.has(url) || a.classList.contains('next-post')) return;
        seenUrls.add(url);

        var parent = a.parentElement;
        var foundHeading = null;
        while (parent && parent !== doc.body) {
            var prev = parent.previousElementSibling;
            while (prev) {
                var h = prev.querySelector('h1,h2,h3,h4,h5') || (prev.tagName.match(/H[1-6]/) ? prev : null);
                if (h && h.innerText.trim().length > 2) {
                    foundHeading = h.innerText.trim();
                    break;
                }
                prev = prev.previousElementSibling;
            }
            if (foundHeading) break;
            parent = parent.parentElement;
        }

        var moduleName = foundHeading || pageTitle || defaultModule || "General";
        if (moduleName.includes("Foundations") && moduleName.length > 30) moduleName = "General";

        links.push({
            url: url,
            title: a.innerText.trim().split(/[\\r\\n]+/)[0],
            module: moduleName
        });
    });
    return links;
  }

  async function getFullStructure() {
    setStatus('Deep scanning curriculum...');
    var allLessonData = [];
    var processedUrls = new Set([window.location.href]);
    
    var initialLinks = extractLinksFromDoc(document, "General");
    allLessonData.push(...initialLinks);

    var categoryLinks = Array.from(document.querySelectorAll('a[href*="/categories/"]'))
        .map(a => a.href.split('?')[0])
        .filter(href => !processedUrls.has(href));

    addLog('Found ' + categoryLinks.length + ' categories to explore.', '#6366f1');

    for (var catUrl of categoryLinks) {
        if (processedUrls.has(catUrl)) continue;
        processedUrls.add(catUrl);
        addLog('Exploring category: ' + catUrl.split('/').pop(), '#6366f1');
        
        try {
            var res = await fetch(catUrl);
            var html = await res.text();
            var parser = new DOMParser();
            var doc = parser.parseFromString(html, 'text/html');
            
            var moreLinks = extractLinksFromDoc(doc, "General");
            allLessonData.push(...moreLinks);

            var pageLinks = Array.from(doc.querySelectorAll('a[href*="page="]'))
                .map(a => a.href)
                .filter(href => !processedUrls.has(href));

            for (var pUrl of pageLinks) {
                if (processedUrls.has(pUrl)) continue;
                processedUrls.add(pUrl);
                addLog('  -> Fetching page ' + pUrl.split('page=')[1], '#818cf8');
                var pRes = await fetch(pUrl);
                var pHtml = await pRes.text();
                var pDoc = parser.parseFromString(pHtml, 'text/html');
                allLessonData.push(...extractLinksFromDoc(pDoc, "General"));
            }
        } catch (e) {
            addLog('Failed to fetch category: ' + catUrl, '#ef4444');
        }
    }

    var unique = [];
    var seen = new Set();
    allLessonData.forEach(l => {
        if (!seen.has(l.url)) {
            seen.add(l.url);
            unique.push(l);
        }
    });

    return unique;
  }

  async function extractVideo(html) {
    if (!html) return null;
    var deliveryMatch = html.match(/https:\\/\\/embed-ssl\\.wistia\\.com\\/deliveries\\/([a-f0-9]{30,})\\.(bin|mp4)/i);
    if (deliveryMatch) return deliveryMatch[0].replace('.bin', '.mp4');

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
        var asset = d.media.assets.find(a => a.display_name === '1080p' || a.slug === 'mp4_h264_2950k') ||
                    d.media.assets.find(a => a.display_name === '720p' || a.slug === 'mp4_h264_1271k') ||
                    d.media.assets.find(a => a.ext === 'mp4' || a.type === 'original');
        if (asset) return asset.url.replace('.bin', '.mp4');
      } catch(e) {}
    }
    return null;
  }

  async function extractTitle(html, fallback) {
    if (!html) return fallback;
    var parser = new DOMParser();
    var doc = parser.parseFromString(html, 'text/html');
    // Kajabi titles are usually in h1 or .post-header h1
    var h1 = doc.querySelector('h1, .post-header h1, .post-title');
    if (h1 && h1.innerText.trim().length > 2 && !/^\\d+$/.test(h1.innerText.trim())) {
      return h1.innerText.trim();
    }
    return fallback;
  }

  var lessons = await getFullStructure();
  var totalToProcess = LIMIT > 0 ? Math.min(LIMIT, lessons.length) : lessons.length;

  if (lessons.length === 0) { setStatus('ERROR: No lessons!', '#ef4444'); return; }
  addLog('Found ' + lessons.length + ' total lessons across all pages.', '#10b981');

  var results = [];
  for (var i = 0; i < totalToProcess; i++) {
    var lesson = lessons[i];
    setStatus('Processing ' + (i + 1) + ' / ' + totalToProcess + '...');
    addLog('-> [' + lesson.module + '] ' + lesson.title);
    
    try {
      var response = await fetch(lesson.url);
      var html = await response.text();
      var videoUrl = await extractVideo(html);
      var finalTitle = await extractTitle(html, lesson.title);
      
      results.push({ category: lesson.module, title: finalTitle, page_url: lesson.url, video_url: videoUrl });
      if (videoUrl) addLog('   ✓ Success', '#10b981');
      else addLog('   × No Video', '#ef4444');
      await new Promise(r => setTimeout(r, 400));
    } catch (err) {
      addLog('   ! Error: ' + err.message, '#ef4444');
    }
  }

  setStatus('COMPLETE!', '#10b981');
  var btn = document.createElement('button');
  btn.innerText = 'COPY FINAL JSON';
  btn.setAttribute('style', 'width:100%;margin-top:12px;padding:14px;background:#6366f1;color:white;border:none;border-radius:12px;font-weight:900;cursor:pointer;');
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

      // Filter out junk links (REPLY buttons, comment sections, empty titles)
      const filteredData = data.filter((item: any) => {
        const title = (item.title || "").toUpperCase();
        const category = (item.category || "").toUpperCase();
        const url = (item.page_url || "").toLowerCase();

        if (title === "REPLY") return false;
        if (category.includes("COMMENT")) return false;
        if (url.includes("/comments/")) return false;
        if (!item.title || item.title.trim() === "") return false;
        
        return true;
      });

      const lessonsToInsert = filteredData.map((item: any) => ({
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
          
          <Tabs defaultValue="v20" className="w-full">
            <TabsList className="bg-white/5 border border-white/5 p-1 rounded-2xl mb-6">
              <TabsTrigger value="v20" className="rounded-xl px-6 font-bold data-[state=active]:bg-indigo-500 data-[state=active]:text-white">
                <Zap className="w-4 h-4 mr-2" />
                Architect v20
              </TabsTrigger>
              <TabsTrigger value="v16" className="rounded-xl px-6 font-bold data-[state=active]:bg-slate-800 data-[state=active]:text-white">
                <Bug className="w-4 h-4 mr-2" />
                Titan v16
              </TabsTrigger>
            </TabsList>

            <TabsContent value="v20">
              <Card className="border-indigo-500/20 bg-indigo-500/5 backdrop-blur-xl rounded-[2rem] overflow-hidden border-2">
                <CardHeader className="border-b border-indigo-500/10 py-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-indigo-400 flex items-center">
                      <Zap className="w-5 h-5 mr-2" />
                      FNH Architect v20 (Deep Title Extraction)
                    </CardTitle>
                    <Button onClick={() => handleCopy(SCRAPER_V20_SCRIPT, 'v20')} size="sm" className="bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy v20 Script
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">v20 Improvements</h4>
                    <ul className="text-[11px] text-slate-400 space-y-2 list-disc pl-4">
                      <li><strong className="text-slate-200">Deep Title Extraction:</strong> If a link title is just a number (e.g. "11"), the scraper now looks inside the page for the real lesson name.</li>
                      <li><strong className="text-slate-200">Deep Category Scan:</strong> Follows "Show More" links to visit category pages directly.</li>
                      <li><strong className="text-slate-200">Smart Deduplication:</strong> Ensures no duplicate lessons if you run it multiple times.</li>
                    </ul>
                  </div>
                  <ScrollArea className="h-[200px] w-full bg-black/40 rounded-2xl border border-white/5">
                    <pre className="p-6 text-indigo-400/50 font-mono text-[10px] leading-relaxed">{SCRAPER_V20_SCRIPT}</pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="v16">
              <Card className="border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-[2rem] overflow-hidden">
                <CardHeader className="border-b border-white/5 py-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center">
                      <Bug className="w-5 h-5 mr-2" />
                      Titan v16
                    </CardTitle>
                    <Button onClick={() => handleCopy(SCRAPER_V20_SCRIPT, 'v16')} size="sm" className="bg-slate-700 hover:bg-slate-600 rounded-xl font-bold">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy v16 Script
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <ScrollArea className="h-[200px] w-full bg-black/20 rounded-2xl border border-white/5">
                    <pre className="p-6 text-slate-500 font-mono text-[10px] leading-relaxed">{SCRAPER_V20_SCRIPT}</pre>
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