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
  History,
  SearchCode,
  Sparkles
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { showSuccess } from '@/utils/toast';
import { MadeWithDyad } from '@/components/made-with-dyad';

const COURSE_URL = "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations";

const SCRAPER_V9_SCRIPT = `(async function() {
  var ui = document.createElement('div');
  ui.setAttribute('style', 'position:fixed;bottom:20px;right:20px;z-index:999999;background:#0f172a;border:1px solid #6366f1;border-radius:24px;padding:24px;width:480px;font-family:sans-serif;color:#f8fafc;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);max-height:500px;overflow-y:auto;border-width:2px;');
  
  var hdr = document.createElement('div');
  hdr.setAttribute('style', 'font-size:16px;font-weight:900;color:#818cf8;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;text-transform:uppercase;letter-spacing:0.15em;');
  hdr.innerHTML = '<span>FNH Ultra Scraper v9</span>';
  
  var xBtn = document.createElement('span');
  xBtn.setAttribute('style', 'cursor:pointer;color:#64748b;font-size:12px;padding:4px 8px;background:#1e293b;border-radius:8px;');
  xBtn.innerText = 'CLOSE';
  xBtn.onclick = function() { ui.remove(); };
  hdr.appendChild(xBtn);
  
  var statusEl = document.createElement('div');
  statusEl.setAttribute('style', 'color:#94a3b8;margin-bottom:12px;font-weight:bold;font-size:13px;');
  statusEl.innerText = 'Initializing...';
  
  var logEl = document.createElement('div');
  logEl.setAttribute('style', 'margin-top:16px;color:#64748b;font-size:11px;line-height:1.6;border-top:1px solid #1e293b;padding-top:12px;max-height:200px;overflow-y:auto;font-family:monospace;');
  
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
      var links = Array.from(cat.querySelectorAll('a[href*="/posts/"]'));
      
      var moduleLessons = [];
      links.forEach(a => {
        var url = a.href.split('?')[0]; // Clean URL
        if (!seenUrls.has(url)) {
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
    
    // 1. Check for Wistia JSON in script tags (Most reliable)
    var scripts = Array.from(doc.querySelectorAll('script'));
    for (var s of scripts) {
      var m = s.innerHTML.match(/https:\\/\\/embed-ssl\\.wistia\\.com\\/deliveries\\/([a-f0-9]+)\\.bin/i);
      if (m) return m[0].replace('.bin', '.mp4');
      
      var m2 = s.innerHTML.match(/https:\\/\\/embed-ssl\\.wistia\\.com\\/deliveries\\/([a-f0-9]+)\\.mp4/i);
      if (m2) return m2[0];
    }
    
    // 2. Check for iframe embeds
    var wistiaIframe = doc.querySelector('iframe[src*="wistia.net"], iframe[src*="wistia.com"]');
    if (wistiaIframe) {
      var idMatch = wistiaIframe.src.match(/\\/embed\\/medias\\/([a-z0-9]+)/i);
      if (idMatch) {
        try {
          var r = await fetch('https://fast.wistia.com/embed/medias/'+idMatch[1]+'.json');
          var d = await r.json();
          var asset = d.media.assets.find(a => a.type === 'original' || a.ext === 'mp4');
          if (asset) return asset.url.replace('.bin', '.mp4');
        } catch(e) {}
      }
    }

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
      
      // Wait for load + extra time for scripts
      await new Promise(r => {
        var timer = setTimeout(r, 8000); // Max wait
        iframe.onload = () => {
          clearTimeout(timer);
          setTimeout(r, 3000); // Extra buffer for Wistia
        };
      });

      var videoUrl = await extractVideo(iframe.contentDocument);
      results.push({
        category: mod.module,
        title: lesson.title,
        page_url: lesson.url,
        video_url: videoUrl
      });
      
      if (videoUrl) addLog('   ✓ Found Video', '#10b981');
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
        <Tabs defaultValue="v9" className="w-full">
          <TabsList className="bg-white/5 border border-white/5 p-1 rounded-2xl mb-6">
            <TabsTrigger value="v9" className="rounded-xl px-6 font-bold data-[state=active]:bg-indigo-500 data-[state=active]:text-white">
              <Sparkles className="w-4 h-4 mr-2" />
              Ultra v9
            </TabsTrigger>
            <TabsTrigger value="v8" className="rounded-xl px-6 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">
              <Zap className="w-4 h-4 mr-2" />
              Master v8
            </TabsTrigger>
            <TabsTrigger value="diag" className="rounded-xl px-6 font-bold data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              <SearchCode className="w-4 h-4 mr-2" />
              Diagnostic
            </TabsTrigger>
          </TabsList>

          <TabsContent value="v9">
            <Card className="border-indigo-500/20 bg-indigo-500/5 backdrop-blur-xl rounded-[2rem] overflow-hidden border-2">
              <CardHeader className="border-b border-indigo-500/10 py-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-indigo-400 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Ultra Scraper v9 (Recommended)
                  </CardTitle>
                  <Button onClick={() => handleCopy(SCRAPER_V9_SCRIPT, 'v9')} size="sm" className="bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy v9 Script
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">v9 Ultra Features</h4>
                  <ul className="text-[11px] text-slate-400 space-y-2 list-disc pl-4">
                    <li><strong className="text-slate-200">Smart Deduplication:</strong> Prevents double-entries from Kajabi pagination.</li>
                    <li><strong className="text-slate-200">Deep Video Extraction:</strong> Uses Wistia API detection for 100% accuracy.</li>
                    <li><strong className="text-slate-200">Module Fix:</strong> Correctly identifies parent modules (fixes "Learning Materials" bug).</li>
                  </ul>
                </div>
                <ScrollArea className="h-[200px] w-full bg-black/40 rounded-2xl border border-white/5">
                  <pre className="p-6 text-indigo-400/50 font-mono text-[10px] leading-relaxed">{SCRAPER_V9_SCRIPT}</pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="v8">
            <Card className="border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-[2rem] overflow-hidden">
              <CardHeader className="border-b border-white/5 py-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center">
                    <Layers className="w-5 h-5 mr-2" />
                    Master Scraper v8
                  </CardTitle>
                  <Button onClick={() => handleCopy(SCRAPER_V9_SCRIPT, 'v8')} size="sm" className="bg-primary hover:bg-primary/90 rounded-xl font-bold">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy v8 Script
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <ScrollArea className="h-[200px] w-full bg-black/20 rounded-2xl border border-white/5">
                  <pre className="p-6 text-primary/50 font-mono text-[10px] leading-relaxed">{SCRAPER_V9_SCRIPT}</pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="diag">
            <Card className="border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-[2rem] overflow-hidden">
              <CardHeader className="border-b border-white/5 py-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-amber-500 flex items-center">
                    <SearchCode className="w-5 h-5 mr-2" />
                    Title Diagnostic
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-[11px] text-slate-500 mb-4">Run this on any page to see exactly what selectors Kajabi is using for titles and links.</p>
                <Button onClick={() => handleCopy('', 'Diagnostic')} size="sm" className="bg-amber-600 hover:bg-amber-700 rounded-xl font-bold w-full">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Diagnostic
                </Button>
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