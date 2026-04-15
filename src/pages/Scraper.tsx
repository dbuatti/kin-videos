"use client";

import React from 'react';
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
  Layers,
  SearchCode,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { showSuccess } from '@/utils/toast';
import { MadeWithDyad } from '@/components/made-with-dyad';

const COURSE_URL = "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations";

const SCRAPER_V10_SCRIPT = `(async function() {
  var ui = document.createElement('div');
  ui.setAttribute('style', 'position:fixed;bottom:20px;right:20px;z-index:999999;background:#0f172a;border:2px solid #6366f1;border-radius:24px;padding:24px;width:500px;font-family:sans-serif;color:#f8fafc;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);max-height:600px;overflow-y:auto;');
  
  var hdr = document.createElement('div');
  hdr.setAttribute('style', 'font-size:16px;font-weight:900;color:#818cf8;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;text-transform:uppercase;letter-spacing:0.15em;');
  hdr.innerHTML = '<span>FNH Ultra Scraper v10</span>';
  
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
    
    // Target the specific Kajabi syllabus containers
    var categories = document.querySelectorAll('.syllabus__category, [data-category-id], .panel');
    
    categories.forEach(cat => {
      var titleEl = cat.querySelector('.syllabus__category-title, h2, h3, h4, .category-title');
      if (!titleEl) return;
      
      var moduleName = titleEl.innerText.trim();
      // Only grab links that are inside the syllabus list, not footer/nav
      var links = Array.from(cat.querySelectorAll('a[href*="/posts/"]'));
      
      var moduleLessons = [];
      links.forEach(a => {
        var url = a.href.split('?')[0];
        // Deduplicate and ensure it's not a "Next Lesson" button
        if (!seenUrls.has(url) && !a.classList.contains('next-post')) {
          seenUrls.add(url);
          var lessonTitle = a.innerText.trim().split('\\n')[0];
          moduleLessons.push({ url: url, title: lessonTitle });
        }
      });
      
      if (moduleLessons.length > 0) {
        structure.push({ module: moduleName, lessons: moduleLessons });
      }
    });
    
    return structure;
  }

  setStatus('Scanning curriculum structure...');
  var fullStructure = getCleanStructure();
  var total = fullStructure.reduce((n, s) => n + s.lessons.length, 0);
  addLog('Found ' + total + ' unique lessons in ' + fullStructure.length + ' modules.', '#818cf8');

  var iframe = document.createElement('iframe');
  iframe.setAttribute('style','position:fixed;top:-9999px;left:-9999px;width:1280px;height:720px;');
  document.body.appendChild(iframe);

  async function extractVideo(doc) {
    if (!doc || !doc.body) return null;
    var html = doc.body.innerHTML;

    // 1. Look for Wistia Hashed ID (The most reliable way)
    var idMatch = html.match(/wistia\\.com\\/medias\\/([a-z0-9]{10})/i) || 
                  html.match(/"hashedId"\\s*:\\s*"([a-z0-9]{10})"/i) ||
                  html.match(/wistia-([a-z0-9]{10})/i);

    if (idMatch) {
      var wistiaId = idMatch[1];
      addLog('   Found Wistia ID: ' + wistiaId, '#6366f1');
      try {
        // Fetch metadata directly from Wistia API (Bypasses ad-blockers/player load)
        var r = await fetch('https://fast.wistia.com/embed/medias/' + wistiaId + '.json');
        var d = await r.json();
        var asset = d.media.assets.find(a => a.type === 'original' || a.ext === 'mp4');
        if (asset) return asset.url.replace('.bin', '.mp4');
      } catch(e) {
        addLog('   API Fetch failed, trying regex...', '#f59e0b');
      }
    }
    
    // 2. Fallback: Direct delivery URL regex
    var deliveryMatch = html.match(/https:\\/\\/embed-ssl\\.wistia\\.com\\/deliveries\\/([a-f0-9]+)\\.bin/i) ||
                        html.match(/https:\\/\\/embed-ssl\\.wistia\\.com\\/deliveries\\/([a-f0-9]+)\\.mp4/i);
    
    if (deliveryMatch) return deliveryMatch[0].replace('.bin', '.mp4');

    return null;
  }

  var results = [];
  var count = 0;

  for (var mod of fullStructure) {
    for (var lesson of mod.lessons) {
      count++;
      setStatus('Processing ' + count + ' / ' + total + '...');
      addLog('-> ' + lesson.title);
      
      iframe.src = lesson.url;
      
      // Wait for load
      await new Promise(r => {
        var timer = setTimeout(r, 10000); // Max wait 10s
        iframe.onload = () => {
          clearTimeout(timer);
          setTimeout(r, 2000); // Small buffer
        };
      });

      var videoUrl = await extractVideo(iframe.contentDocument);
      results.push({
        category: mod.module,
        title: lesson.title,
        page_url: lesson.url,
        video_url: videoUrl
      });
      
      if (videoUrl) addLog('   ✓ Success', '#10b981');
      else addLog('   × No Video', '#ef4444');
    }
  }

  document.body.removeChild(iframe);
  setStatus('COMPLETE!', '#10b981');
  
  var btn = document.createElement('button');
  btn.innerText = 'COPY FINAL JSON';
  btn.setAttribute('style', 'width:100%;margin-top:16px;padding:14px;background:#6366f1;color:white;border:none;border-radius:12px;font-weight:900;cursor:pointer;box-shadow:0 10px 15px -3px rgba(99,102,241,0.4);');
  btn.onclick = function() { 
    navigator.clipboard.writeText(JSON.stringify(results, null, 2)); 
    btn.innerText = 'COPIED!';
    setTimeout(() => btn.innerText = 'COPY FINAL JSON', 2000);
  };
  ui.appendChild(btn);
})();`;

const Scraper = () => {
  const navigate = useNavigate();

  const handleCopy = (script: string, version: string) => {
    navigator.clipboard.writeText(script);
    showSuccess(`${version} script copied!`);
  };

  return (
    <div className="min-h-screen bg-background p-6 sm:p-12 max-w-4xl mx-auto w-full">
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

      <main className="space-y-8">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 flex items-start space-x-4">
          <ShieldAlert className="w-6 h-6 text-amber-500 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-amber-500">Important: Disable Ad-Blockers</h4>
            <p className="text-xs text-slate-400 mt-1">
              Your browser is blocking Wistia scripts. Please disable <strong>uBlock Origin, AdBlock, or Brave Shields</strong> on the Kajabi site before running the script, or video links will return as NULL.
            </p>
          </div>
        </div>

        <Tabs defaultValue="v10" className="w-full">
          <TabsList className="bg-white/5 border border-white/5 p-1 rounded-2xl mb-6">
            <TabsTrigger value="v10" className="rounded-xl px-6 font-bold data-[state=active]:bg-indigo-500 data-[state=active]:text-white">
              <Sparkles className="w-4 h-4 mr-2" />
              Ultra v10
            </TabsTrigger>
            <TabsTrigger value="v9" className="rounded-xl px-6 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">
              <Zap className="w-4 h-4 mr-2" />
              Master v9
            </TabsTrigger>
          </TabsList>

          <TabsContent value="v10">
            <Card className="border-indigo-500/20 bg-indigo-500/5 backdrop-blur-xl rounded-[2rem] overflow-hidden border-2">
              <CardHeader className="border-b border-indigo-500/10 py-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-indigo-400 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Ultra Scraper v10 (Recommended)
                  </CardTitle>
                  <Button onClick={() => handleCopy(SCRAPER_V10_SCRIPT, 'v10')} size="sm" className="bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy v10 Script
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">v10 Ultra Features</h4>
                  <ul className="text-[11px] text-slate-400 space-y-2 list-disc pl-4">
                    <li><strong className="text-slate-200">Direct API Extraction:</strong> Fetches video links directly from Wistia's servers.</li>
                    <li><strong className="text-slate-200">Duplicate Filter:</strong> Ignores "Next Lesson" and "Previous Lesson" links.</li>
                    <li><strong className="text-slate-200">Deep Scan:</strong> Finds videos even if the player is blocked by an ad-blocker.</li>
                  </ul>
                </div>
                <ScrollArea className="h-[200px] w-full bg-black/40 rounded-2xl border border-white/5">
                  <pre className="p-6 text-indigo-400/50 font-mono text-[10px] leading-relaxed">{SCRAPER_V10_SCRIPT}</pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="v9">
            <Card className="border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-[2rem] overflow-hidden">
              <CardHeader className="border-b border-white/5 py-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center">
                    <Layers className="w-5 h-5 mr-2" />
                    Master Scraper v9
                  </CardTitle>
                  <Button onClick={() => handleCopy(SCRAPER_V10_SCRIPT, 'v9')} size="sm" className="bg-primary hover:bg-primary/90 rounded-xl font-bold">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy v9 Script
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <ScrollArea className="h-[200px] w-full bg-black/20 rounded-2xl border border-white/5">
                  <pre className="p-6 text-primary/50 font-mono text-[10px] leading-relaxed">{SCRAPER_V10_SCRIPT}</pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="mt-24 opacity-30">
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default Scraper;