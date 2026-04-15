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
  ShieldAlert,
  ShieldCheck,
  Ghost
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { showSuccess } from '@/utils/toast';
import { MadeWithDyad } from '@/components/made-with-dyad';

const COURSE_URL = "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations";

const SCRAPER_V12_SCRIPT = `(async function() {
  // Cleanup any previous UI
  var old = document.getElementById('fnh-scraper-ui');
  if (old) old.remove();

  var ui = document.createElement('div');
  ui.id = 'fnh-scraper-ui';
  ui.setAttribute('style', 'position:fixed;bottom:20px;right:20px;z-index:999999;background:#0f172a;border:2px solid #10b981;border-radius:24px;padding:24px;width:500px;font-family:sans-serif;color:#f8fafc;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);max-height:600px;overflow-y:auto;');
  
  var hdr = document.createElement('div');
  hdr.setAttribute('style', 'font-size:16px;font-weight:900;color:#10b981;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;text-transform:uppercase;letter-spacing:0.15em;');
  hdr.innerHTML = '<span>FNH Ghost Scraper v12</span>';
  
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
    
    // Broad selectors for Kajabi themes
    var categories = document.querySelectorAll('.syllabus__category, [data-category-id], .panel, .syllabus-section, .course-section');
    
    if (categories.length === 0) {
      // Fallback: just find all post links if no category containers found
      addLog('No category containers found, using global link scan...', '#f59e0b');
      var allLinks = Array.from(document.querySelectorAll('a[href*="/posts/"]'));
      var lessons = allLinks.map(a => ({ url: a.href.split('?')[0], title: a.innerText.trim().split(/[\\r\\n]+/)[0] }))
                           .filter(l => { if(seenUrls.has(l.url)) return false; seenUrls.add(l.url); return true; });
      if (lessons.length > 0) structure.push({ module: 'General', lessons: lessons });
    } else {
      categories.forEach(cat => {
        var titleEl = cat.querySelector('.syllabus__category-title, h2, h3, h4, .category-title, .section-title');
        var moduleName = titleEl ? titleEl.innerText.trim() : 'Uncategorized';
        var links = Array.from(cat.querySelectorAll('a[href*="/posts/"]'));
        
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
          structure.push({ module: moduleName, lessons: moduleLessons });
        }
      });
    }
    
    return structure;
  }

  setStatus('Scanning curriculum structure...');
  var fullStructure = getCleanStructure();
  var total = fullStructure.reduce((n, s) => n + s.lessons.length, 0);
  
  if (total === 0) {
    setStatus('ERROR: No lessons found!', '#ef4444');
    addLog('Check if you are on the main course curriculum page.', '#ef4444');
    return;
  }

  addLog('Found ' + total + ' unique lessons.', '#10b981');

  async function extractVideo(html) {
    if (!html) return null;

    var idMatch = html.match(/wistia\\.com\\/medias\\/([a-z0-9]{10})/i) || 
                  html.match(/"hashedId"\\s*:\\s*"([a-z0-9]{10})"/i) ||
                  html.match(/wistia-([a-z0-9]{10})/i);

    if (idMatch) {
      var wistiaId = idMatch[1];
      try {
        var r = await fetch('https://fast.wistia.com/embed/medias/' + wistiaId + '.json');
        var d = await r.json();
        var asset = d.media.assets.find(a => a.type === 'original' || a.ext === 'mp4' || a.display_name === 'Original file');
        if (asset) return asset.url.replace('.bin', '.mp4');
      } catch(e) {}
    }
    
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
      
      try {
        // Use fetch instead of iframe to avoid Kajabi script conflicts
        var response = await fetch(lesson.url);
        var html = await response.text();

        var videoUrl = await extractVideo(html);
        results.push({
          category: mod.module,
          title: lesson.title,
          page_url: lesson.url,
          video_url: videoUrl
        });
        
        if (videoUrl) addLog('   ✓ Success', '#10b981');
        else addLog('   × No Video', '#ef4444');
        
        // Small delay to be polite to the server
        await new Promise(r => setTimeout(r, 300));
      } catch (err) {
        addLog('   ! Error: ' + err.message, '#ef4444');
      }
    }
  }

  setStatus('COMPLETE!', '#10b981');
  
  var btn = document.createElement('button');
  btn.innerText = 'COPY FINAL JSON';
  btn.setAttribute('style', 'width:100%;margin-top:16px;padding:14px;background:#10b981;color:white;border:none;border-radius:12px;font-weight:900;cursor:pointer;');
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex items-start space-x-4">
            <Ghost className="w-6 h-6 text-emerald-500 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-emerald-500">v12 "Ghost" Mode</h4>
              <p className="text-xs text-slate-400 mt-1">
                Uses background <code className="text-white">fetch</code> instead of iframes. This bypasses Kajabi's layout scripts and prevents the <code className="text-white">TypeError: top</code> error.
              </p>
            </div>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 flex items-start space-x-4">
            <ShieldAlert className="w-6 h-6 text-amber-500 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-amber-500">CORS Note</h4>
              <p className="text-xs text-slate-400 mt-1">
                This script must be run while logged into Kajabi. It uses your active session to fetch lesson data.
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="v12" className="w-full">
          <TabsList className="bg-white/5 border border-white/5 p-1 rounded-2xl mb-6">
            <TabsTrigger value="v12" className="rounded-xl px-6 font-bold data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              <Ghost className="w-4 h-4 mr-2" />
              Ghost v12
            </TabsTrigger>
            <TabsTrigger value="v11" className="rounded-xl px-6 font-bold data-[state=active]:bg-indigo-500 data-[state=active]:text-white">
              <Sparkles className="w-4 h-4 mr-2" />
              Titan v11
            </TabsTrigger>
          </TabsList>

          <TabsContent value="v12">
            <Card className="border-emerald-500/20 bg-emerald-500/5 backdrop-blur-xl rounded-[2rem] overflow-hidden border-2">
              <CardHeader className="border-b border-emerald-500/10 py-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-emerald-400 flex items-center">
                    <Ghost className="w-5 h-5 mr-2" />
                    Ghost Scraper v12 (Iframe-Free)
                  </CardTitle>
                  <Button onClick={() => handleCopy(SCRAPER_V12_SCRIPT, 'v12')} size="sm" className="bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy v12 Script
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2">Why v12?</h4>
                  <ul className="text-[11px] text-slate-400 space-y-2 list-disc pl-4">
                    <li><strong className="text-slate-200">No Iframe:</strong> Eliminates conflicts with Kajabi's <code className="text-white">scripts.js</code>.</li>
                    <li><strong className="text-slate-200">Faster:</strong> Fetches raw HTML directly without waiting for full page rendering.</li>
                    <li><strong className="text-slate-200">Better Detection:</strong> Improved selectors to find lessons even on custom Kajabi themes.</li>
                  </ul>
                </div>
                <ScrollArea className="h-[200px] w-full bg-black/40 rounded-2xl border border-white/5">
                  <pre className="p-6 text-emerald-400/50 font-mono text-[10px] leading-relaxed">{SCRAPER_V12_SCRIPT}</pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="v11">
            <Card className="border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-[2rem] overflow-hidden">
              <CardHeader className="border-b border-white/5 py-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-indigo-400 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Titan Scraper v11
                  </CardTitle>
                  <Button onClick={() => handleCopy(SCRAPER_V12_SCRIPT, 'v11')} size="sm" className="bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy v11 Script
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <ScrollArea className="h-[200px] w-full bg-black/20 rounded-2xl border border-white/5">
                  <pre className="p-6 text-indigo-400/50 font-mono text-[10px] leading-relaxed">{SCRAPER_V12_SCRIPT}</pre>
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