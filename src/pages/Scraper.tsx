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
  History
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { showSuccess } from '@/utils/toast';
import { MadeWithDyad } from '@/components/made-with-dyad';

const COURSE_URL = "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations";

const SCRAPER_V7_SCRIPT = `(async function() {
  var ui = document.createElement('div');
  ui.setAttribute('style', 'position:fixed;bottom:20px;right:20px;z-index:999999;background:#0f172a;border:1px solid #1e293b;border-radius:16px;padding:20px;width:460px;font-family:sans-serif;font-size:12px;color:#f8fafc;box-shadow:0 20px 50px rgba(0,0,0,.8);max-height:400px;overflow-y:auto;');
  var hdr = document.createElement('div');
  hdr.setAttribute('style', 'font-size:14px;font-weight:900;color:#6366f1;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;text-transform:uppercase;letter-spacing:0.1em;');
  hdr.innerHTML = '<span>FNH Scraper v7</span>';
  var xBtn = document.createElement('span');
  xBtn.setAttribute('style', 'cursor:pointer;color:#64748b;font-weight:bold;font-size:10px;');
  xBtn.innerText = 'CLOSE';
  xBtn.onclick = function() { ui.remove(); };
  hdr.appendChild(xBtn);
  var statusEl = document.createElement('div');
  statusEl.setAttribute('style', 'color:#94a3b8;margin-bottom:8px;font-weight:bold;');
  statusEl.innerText = 'Initializing...';
  var pathEl = document.createElement('div');
  pathEl.setAttribute('style', 'color:#10b981;font-size:10px;min-height:14px;word-break:break-all;background:rgba(16,185,129,0.1);padding:4px 8px;border-radius:4px;');
  var logEl = document.createElement('div');
  logEl.setAttribute('style', 'margin-top:12px;color:#64748b;font-size:10px;line-height:1.6;border-top:1px solid #1e293b;padding-top:8px;');
  ui.appendChild(hdr); ui.appendChild(statusEl); ui.appendChild(pathEl); ui.appendChild(logEl);
  document.body.appendChild(ui);
  function setStatus(m,c){ statusEl.style.color=c||'#94a3b8'; statusEl.innerText=m; }
  function setPath(m){ pathEl.innerText=m; }
  function addLog(m){ logEl.innerHTML='<div style="margin-bottom:2px;">'+m+'</div>'+logEl.innerHTML; }

  function getCourseStructure() {
    var structure = [];
    var seenUrls = {};
    var allEls = document.querySelectorAll('div,section,li,nav,aside,ul');
    allEls.forEach(function(el) {
      var links = Array.from(el.querySelectorAll('a[href*="/posts/"]'));
      if (links.length < 1) return;
      var heading = el.querySelector('h2,h3,h4,h5,[class*="category"],[class*="module"],[class*="section-title"],[class*="chapter-title"]');
      if (!heading) return;
      var moduleName = heading.innerText.trim().replace(/[\\n\\r]+/g,' ').replace(/\\s+/g,' ');
      if (moduleName.length < 2 || moduleName.length > 120) return;
      var uniqueLinks = links.filter(function(a) {
        if (seenUrls[a.href] || a.href.indexOf('undefined') !== -1) return false;
        seenUrls[a.href] = true;
        return true;
      });
      if (!uniqueLinks.length) return;
      structure.push({
        module: moduleName,
        lessons: uniqueLinks.map(function(a) {
          return { url: a.href, sidebarText: a.innerText.trim().replace(/[\\n\\r]+/g,' ').replace(/\\s+/g,' ') };
        })
      });
    });
    return structure;
  }

  setStatus('Scanning curriculum...');
  var courseStructure = getCourseStructure();
  var total = courseStructure.reduce(function(n,s){ return n+s.lessons.length; },0);
  setStatus('Found ' + total + ' lessons', '#6366f1');

  var iframe = document.createElement('iframe');
  iframe.setAttribute('style','position:fixed;top:-9999px;left:-9999px;width:1024px;height:768px;');
  document.body.appendChild(iframe);

  function loadPage(url, ms) {
    ms = ms || 6000;
    return new Promise(function(resolve) {
      var settled = false;
      function done() {
        if (settled) return; settled = true;
        setTimeout(function() {
          resolve(iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document) || null);
        }, ms);
      }
      iframe.onload = done;
      iframe.onerror = function(){ settled=true; resolve(null); };
      iframe.src = url;
      setTimeout(function(){ if(!settled){ settled=true; resolve(iframe.contentDocument||null); } }, ms+6000);
    });
  }

  async function extractMp4(doc) {
    if (!doc || !doc.body) return 'NO VIDEO FOUND';
    var html = doc.body.innerHTML;
    var binRe = /"url"\\s*:\\s*"(https:\\/\\/embed-ssl\\.wistia\\.com\\/deliveries\\/[a-f0-9]+\\.bin)"/gi;
    var bins = []; var bm;
    while ((bm = binRe.exec(html)) !== null) bins.push(bm[1]);
    if (bins.length) return bins[bins.length-1].replace('.bin','.mp4');
    var m = html.match(/https:\\/\\/embed-ssl\\.wistia\\.com\\/deliveries\\/[a-f0-9]+\\.mp4/i);
    if (m) return m[0];
    var idRe = [/"hashedId"\\s*:\\s*"([a-z0-9]{8,})"/i,/wistia\\.com\\/medias\\/([a-z0-9]{8,})/i];
    for (var j=0;j<idRe.length;j++){ var mm=html.match(idRe[j]); if(mm){ 
      try {
        var r = await fetch('https://fast.wistia.com/embed/medias/'+mm[1]+'.json');
        var d = await r.json();
        var assets = (d&&d.media&&d.media.assets)?d.media.assets:[];
        var mp4s = assets.filter(a => a.type==='original'||(a.contentType&&a.contentType.indexOf('mp4')!==-1)).sort((a,b) => (b.bitrate||0)-(a.bitrate||0));
        if (mp4s.length&&mp4s[0].url) return mp4s[0].url.replace('.bin','.mp4');
      } catch(e){}
    } }
    return 'NO VIDEO FOUND';
  }

  var lines = [];
  var jsonResults = [];
  var count = 0;
  var sep = Array(80).join('=');

  for (var si=0; si<courseStructure.length; si++) {
    var sec = courseStructure[si];
    lines.push(''); lines.push(sep); lines.push(sec.module.toUpperCase()); lines.push(sep); lines.push('');
    for (var li=0; li<sec.lessons.length; li++) {
      var lesson = sec.lessons[li];
      count++;
      setStatus('Processing ' + count + ' / ' + total, '#6366f1');
      setPath(sec.module + ' > ' + lesson.sidebarText);
      var doc = await loadPage(lesson.url, 6000);
      var mp4 = await extractMp4(doc);
      lines.push(sec.module + ' / ' + lesson.sidebarText);
      lines.push('  Page:  ' + lesson.url);
      lines.push('  Video: ' + mp4);
      lines.push('');
      jsonResults.push({ category: sec.module, title: lesson.sidebarText, page_url: lesson.url, video_url: mp4 === 'NO VIDEO FOUND' ? null : mp4 });
    }
  }

  document.body.removeChild(iframe);
  setStatus('Extraction Complete!', '#10b981');
  var btnContainer = document.createElement('div');
  btnContainer.setAttribute('style', 'margin-top:16px;display:flex;gap:8px;');
  var dlJson = document.createElement('button');
  dlJson.innerText = 'Copy JSON';
  dlJson.setAttribute('style', 'flex:1;padding:10px;background:#1e293b;color:white;border:1px solid #334155;border-radius:8px;font-weight:bold;cursor:pointer;');
  dlJson.onclick = function() { navigator.clipboard.writeText(JSON.stringify(jsonResults, null, 2)); alert('JSON copied!'); };
  btnContainer.appendChild(dlJson);
  ui.appendChild(btnContainer);
})();`;

const SCRAPER_V8_SCRIPT = `(async function() {
  var ui = document.createElement('div');
  ui.setAttribute('style', 'position:fixed;bottom:20px;right:20px;z-index:999999;background:#0f172a;border:1px solid #1e293b;border-radius:16px;padding:20px;width:460px;font-family:sans-serif;font-size:12px;color:#f8fafc;box-shadow:0 20px 50px rgba(0,0,0,.8);max-height:400px;overflow-y:auto;');
  var hdr = document.createElement('div');
  hdr.setAttribute('style', 'font-size:14px;font-weight:900;color:#6366f1;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;text-transform:uppercase;letter-spacing:0.1em;');
  hdr.innerHTML = '<span>FNH Master Scraper v8</span>';
  var xBtn = document.createElement('span');
  xBtn.setAttribute('style', 'cursor:pointer;color:#64748b;font-weight:bold;font-size:10px;');
  xBtn.innerText = 'CLOSE';
  xBtn.onclick = function() { ui.remove(); };
  hdr.appendChild(xBtn);
  var statusEl = document.createElement('div');
  statusEl.setAttribute('style', 'color:#94a3b8;margin-bottom:8px;font-weight:bold;');
  statusEl.innerText = 'Initializing...';
  var pathEl = document.createElement('div');
  pathEl.setAttribute('style', 'color:#10b981;font-size:10px;min-height:14px;word-break:break-all;background:rgba(16,185,129,0.1);padding:4px 8px;border-radius:4px;');
  var logEl = document.createElement('div');
  logEl.setAttribute('style', 'margin-top:12px;color:#64748b;font-size:10px;line-height:1.6;border-top:1px solid #1e293b;padding-top:8px;');
  ui.appendChild(hdr); ui.appendChild(statusEl); ui.appendChild(pathEl); ui.appendChild(logEl);
  document.body.appendChild(ui);
  function setStatus(m,c){ statusEl.style.color=c||'#94a3b8'; statusEl.innerText=m; }
  function setPath(m){ pathEl.innerText=m; }
  function addLog(m){ logEl.innerHTML='<div style="margin-bottom:2px;">'+m+'</div>'+logEl.innerHTML; }

  var iframe = document.createElement('iframe');
  iframe.setAttribute('style','position:fixed;top:-9999px;left:-9999px;width:1024px;height:768px;');
  document.body.appendChild(iframe);

  function loadPage(url, ms) {
    ms = ms || 6000;
    return new Promise(function(resolve) {
      var settled = false;
      function done() {
        if (settled) return; settled = true;
        setTimeout(function() {
          resolve(iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document) || null);
        }, ms);
      }
      iframe.onload = done;
      iframe.onerror = function(){ settled=true; resolve(null); };
      iframe.src = url;
      setTimeout(function(){ if(!settled){ settled=true; resolve(iframe.contentDocument||null); } }, ms+10000);
    });
  }

  function getStructureFromDoc(doc) {
    var structure = [];
    var seenUrls = {};
    var categories = doc.querySelectorAll('.syllabus__category, [class*="category"], .panel');
    if (categories.length === 0) {
        var links = Array.from(doc.querySelectorAll('a[href*="/posts/"]'));
        return [{ module: 'Uncategorized', lessons: links.map(a => ({ url: a.href, sidebarText: a.innerText.trim() })) }];
    }
    categories.forEach(function(cat) {
      var titleEl = cat.querySelector('.syllabus__category-title, h2, h3, h4, [class*="title"]');
      if (!titleEl) return;
      var moduleName = titleEl.innerText.trim();
      var links = Array.from(cat.querySelectorAll('a[href*="/posts/"]'));
      var uniqueLessons = [];
      links.forEach(function(a) {
        if (!seenUrls[a.href]) {
          seenUrls[a.href] = true;
          uniqueLessons.push({ url: a.href, sidebarText: a.innerText.trim() });
        }
      });
      if (uniqueLessons.length > 0) structure.push({ module: moduleName, lessons: uniqueLessons });
    });
    return structure;
  }

  setStatus('Detecting pagination...');
  var allPages = [window.location.href];
  document.querySelectorAll('a[href*="page="]').forEach(a => { if (allPages.indexOf(a.href) === -1) allPages.push(a.href); });
  allPages.sort();

  var fullStructure = [];
  for (var i=0; i<allPages.length; i++) {
    setStatus('Scanning Page ' + (i+1) + ' of ' + allPages.length);
    var pageDoc = (i === 0 && window.location.href === allPages[0]) ? document : await loadPage(allPages[i], 3000);
    if (pageDoc) {
      getStructureFromDoc(pageDoc).forEach(newMod => {
        var existing = fullStructure.find(m => m.module === newMod.module);
        if (existing) existing.lessons = existing.lessons.concat(newMod.lessons);
        else fullStructure.push(newMod);
      });
    }
  }

  var totalLessons = fullStructure.reduce((n, s) => n + s.lessons.length, 0);
  setStatus('Found ' + totalLessons + ' lessons across ' + allPages.length + ' pages.', '#6366f1');

  async function extractMp4(doc) {
    if (!doc || !doc.body) return 'NO VIDEO FOUND';
    var html = doc.body.innerHTML;
    var binRe = /"url"\\s*:\\s*"(https:\\/\\/embed-ssl\\.wistia\\.com\\/deliveries\\/[a-f0-9]+\\.bin)"/gi;
    var bins = []; var bm;
    while ((bm = binRe.exec(html)) !== null) bins.push(bm[1]);
    if (bins.length) return bins[bins.length-1].replace('.bin','.mp4');
    var m = html.match(/https:\\/\\/embed-ssl\\.wistia\\.com\\/deliveries\\/[a-f0-9]+\\.mp4/i);
    if (m) return m[0];
    var idRe = [/"hashedId"\\s*:\\s*"([a-z0-9]{8,})"/i,/wistia\\.com\\/medias\\/([a-z0-9]{8,})/i];
    for (var j=0;j<idRe.length;j++){ var mm=html.match(idRe[j]); if(mm){ 
      try {
        var r = await fetch('https://fast.wistia.com/embed/medias/'+mm[1]+'.json');
        var d = await r.json();
        var assets = (d&&d.media&&d.media.assets)?d.media.assets:[];
        var mp4s = assets.filter(a => a.type==='original'||(a.contentType&&a.contentType.indexOf('mp4')!==-1)).sort((a,b) => (b.bitrate||0)-(a.bitrate||0));
        if (mp4s.length&&mp4s[0].url) return mp4s[0].url.replace('.bin','.mp4');
      } catch(e){}
    } }
    return 'NO VIDEO FOUND';
  }

  var jsonResults = [];
  var count = 0;
  for (var si=0; si<fullStructure.length; si++) {
    var sec = fullStructure[si];
    for (var li=0; li<sec.lessons.length; li++) {
      var lesson = sec.lessons[li];
      count++;
      setStatus('Extracting ' + count + ' / ' + totalLessons, '#6366f1');
      setPath(sec.module + ' > ' + lesson.sidebarText);
      var doc = await loadPage(lesson.url, 6000);
      var mp4 = await extractMp4(doc);
      jsonResults.push({ category: sec.module, title: lesson.sidebarText, page_url: lesson.url, video_url: mp4 === 'NO VIDEO FOUND' ? null : mp4 });
    }
  }

  document.body.removeChild(iframe);
  setStatus('Extraction Complete!', '#10b981');
  var btnContainer = document.createElement('div');
  btnContainer.setAttribute('style', 'margin-top:16px;display:flex;gap:8px;');
  var dlJson = document.createElement('button');
  dlJson.innerText = 'Copy JSON';
  dlJson.setAttribute('style', 'flex:1;padding:10px;background:#1e293b;color:white;border:1px solid #334155;border-radius:8px;font-weight:bold;cursor:pointer;');
  dlJson.onclick = function() { navigator.clipboard.writeText(JSON.stringify(jsonResults, null, 2)); alert('JSON copied!'); };
  btnContainer.appendChild(dlJson);
  ui.appendChild(btnContainer);
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
        <Tabs defaultValue="v8" className="w-full">
          <TabsList className="bg-white/5 border border-white/5 p-1 rounded-2xl mb-6">
            <TabsTrigger value="v8" className="rounded-xl px-6 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">
              <Zap className="w-4 h-4 mr-2" />
              Master v8 (Multi-Page)
            </TabsTrigger>
            <TabsTrigger value="v7" className="rounded-xl px-6 font-bold data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              <History className="w-4 h-4 mr-2" />
              Legacy v7
            </TabsTrigger>
          </TabsList>

          <TabsContent value="v8">
            <Card className="border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-[2rem] overflow-hidden">
              <CardHeader className="border-b border-white/5 py-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center">
                    <Layers className="w-5 h-5 mr-2" />
                    Master Scraper v8
                  </CardTitle>
                  <Button onClick={() => handleCopy(SCRAPER_V8_SCRIPT, 'v8')} size="sm" className="bg-primary hover:bg-primary/90 rounded-xl font-bold">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy v8 Script
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">v8 Master Features</h4>
                  <ul className="text-[11px] text-slate-500 space-y-2 list-disc pl-4">
                    <li><strong className="text-slate-300">Auto-Pagination:</strong> Scans Page 1 & 2 automatically</li>
                    <li><strong className="text-slate-300">Perfect Structure:</strong> Maps lessons to their correct modules</li>
                    <li><strong className="text-slate-300">Background Processing:</strong> Uses hidden iframes for speed</li>
                  </ul>
                </div>
                <ScrollArea className="h-[200px] w-full bg-black/20 rounded-2xl border border-white/5">
                  <pre className="p-6 text-primary/50 font-mono text-[10px] leading-relaxed">{SCRAPER_V8_SCRIPT}</pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="v7">
            <Card className="border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-[2rem] overflow-hidden">
              <CardHeader className="border-b border-white/5 py-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center">
                    <History className="w-5 h-5 mr-2" />
                    Legacy Scraper v7
                  </CardTitle>
                  <Button onClick={() => handleCopy(SCRAPER_V7_SCRIPT, 'v7')} size="sm" variant="outline" className="border-white/10 hover:bg-white/5 rounded-xl font-bold">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy v7 Script
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <p className="text-[11px] text-slate-500">Use this version if v8 has trouble detecting the course structure. Note: v7 only scans the current page.</p>
                </div>
                <ScrollArea className="h-[200px] w-full bg-black/20 rounded-2xl border border-white/5">
                  <pre className="p-6 text-slate-600 font-mono text-[10px] leading-relaxed">{SCRAPER_V7_SCRIPT}</pre>
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