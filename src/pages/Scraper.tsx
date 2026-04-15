"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Terminal, 
  Copy, 
  Zap, 
  Info,
  FileCode,
  SearchCode,
  CheckCircle2,
  ExternalLink,
  Layers
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { showSuccess } from '@/utils/toast';
import { MadeWithDyad } from '@/components/made-with-dyad';

const COURSE_URL = "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations";

const SCRAPER_V8_SCRIPT = `(async function() {

  // UI helpers
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

  // IFRAME for background loading
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

  // Collect structure from a specific document
  function getStructureFromDoc(doc) {
    var structure = [];
    var seenUrls = {};
    // Look for category containers
    var categories = doc.querySelectorAll('.syllabus__category, [class*="category"], .panel');
    
    if (categories.length === 0) {
        // Fallback to flat list if no category containers found
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
        var lessonTitle = a.querySelector('.syllabus__title') ? a.querySelector('.syllabus__title').innerText.trim() : a.innerText.trim();
        if (!seenUrls[a.href]) {
          seenUrls[a.href] = true;
          uniqueLessons.push({ url: a.href, sidebarText: lessonTitle });
        }
      });

      if (uniqueLessons.length > 0) {
        structure.push({ module: moduleName, lessons: uniqueLessons });
      }
    });
    return structure;
  }

  // 1. SCAN ALL PAGES
  setStatus('Detecting pagination...');
  var allPages = [window.location.href];
  var paginationLinks = document.querySelectorAll('a[href*="page="]');
  paginationLinks.forEach(function(a) {
    if (allPages.indexOf(a.href) === -1) allPages.push(a.href);
  });
  allPages.sort();

  addLog('Found ' + allPages.length + ' curriculum pages.');
  
  var fullStructure = [];
  for (var i=0; i<allPages.length; i++) {
    setStatus('Scanning Page ' + (i+1) + ' of ' + allPages.length);
    var pageDoc = (i === 0 && window.location.href === allPages[0]) ? document : await loadPage(allPages[i], 3000);
    if (pageDoc) {
      var pageStruct = getStructureFromDoc(pageDoc);
      // Merge logic: if module exists, append lessons, else add new module
      pageStruct.forEach(function(newMod) {
        var existing = fullStructure.find(m => m.module === newMod.module);
        if (existing) {
          existing.lessons = existing.lessons.concat(newMod.lessons);
        } else {
          fullStructure.push(newMod);
        }
      });
    }
  }

  var totalLessons = fullStructure.reduce((n, s) => n + s.lessons.length, 0);
  setStatus('Found ' + totalLessons + ' total lessons across ' + allPages.length + ' pages.', '#6366f1');
  await new Promise(r => setTimeout(r, 1000));

  // 2. EXTRACT VIDEOS
  async function extractMp4(doc) {
    if (!doc || !doc.body) return 'NO VIDEO FOUND';
    var html = doc.body.innerHTML;
    var binRe = /"url"\\\\s*:\\\\s*"(https:\\\\/\\\\/embed-ssl\\\\.wistia\\\\.com\\\\/deliveries\\\\/[a-f0-9]+\\\\.bin)"/gi;
    var bins = []; var bm;
    while ((bm = binRe.exec(html)) !== null) bins.push(bm[1]);
    if (bins.length) return bins[bins.length-1].replace('.bin','.mp4');
    var m = html.match(/https:\\\\/\\\\/embed-ssl\\\\.wistia\\\\.com\\\\/deliveries\\\\/[a-f0-9]+\\\\.mp4/i);
    if (m) return m[0];
    var idRe = [/"hashedId"\\\\s*:\\\\s*"([a-z0-9]{8,})"/i,/wistia\\\\.com\\\\/medias\\\\/([a-z0-9]{8,})/i];
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

  for (var si=0; si<fullStructure.length; si++) {
    var sec = fullStructure[si];
    lines.push(''); lines.push(sep); lines.push(sec.module.toUpperCase()); lines.push(sep); lines.push('');

    for (var li=0; li<sec.lessons.length; li++) {
      var lesson = sec.lessons[li];
      count++;
      setStatus('Extracting ' + count + ' / ' + totalLessons, '#6366f1');
      setPath(sec.module + ' > ' + lesson.sidebarText);
      addLog('['+count+'/'+totalLessons+'] ' + lesson.sidebarText);

      var doc = await loadPage(lesson.url, 6000);
      var mp4 = await extractMp4(doc);
      
      // Final Breadcrumb Format
      var breadcrumb = 'Functional Neuro Approach Foundations / Modules / ' + sec.module + ' / ' + lesson.sidebarText;
      lines.push(breadcrumb);
      lines.push('  Page:  ' + lesson.url);
      lines.push('  Video: ' + mp4);
      lines.push('');

      jsonResults.push({
        category: sec.module,
        title: lesson.sidebarText,
        page_url: lesson.url,
        video_url: mp4 === 'NO VIDEO FOUND' ? null : mp4
      });
    }
  }

  document.body.removeChild(iframe);
  setStatus('Extraction Complete!', '#10b981');
  
  var btnContainer = document.createElement('div');
  btnContainer.setAttribute('style', 'margin-top:16px;display:flex;gap:8px;');
  
  var dlTxt = document.createElement('button');
  dlTxt.innerText = 'Download TXT';
  dlTxt.setAttribute('style', 'flex:1;padding:10px;background:#6366f1;color:white;border:none;border-radius:8px;font-weight:bold;cursor:pointer;');
  dlTxt.onclick = function() {
    var header = ['FNH KAJABI COURSE — FULL VIDEO EXTRACT','Generated: '+new Date().toLocaleString(),'Lessons: '+count,sep,''].join('\\\\n');
    var blob = new Blob([header+lines.join('\\\\n')],{type:'text/plain'});
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'FNH_Full_Archive_v8.txt';
    a.click();
  };

  var dlJson = document.createElement('button');
  dlJson.innerText = 'Copy JSON';
  dlJson.setAttribute('style', 'flex:1;padding:10px;background:#1e293b;color:white;border:1px solid #334155;border-radius:8px;font-weight:bold;cursor:pointer;');
  dlJson.onclick = function() {
    navigator.clipboard.writeText(JSON.stringify(jsonResults, null, 2));
    alert('JSON copied to clipboard!');
  };

  btnContainer.appendChild(dlTxt);
  btnContainer.appendChild(dlJson);
  ui.appendChild(btnContainer);

})();`;

const Scraper = () => {
  const navigate = useNavigate();

  const handleCopyV8 = () => {
    navigator.clipboard.writeText(SCRAPER_V8_SCRIPT);
    showSuccess("v8 Master Scraper script copied!");
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
        {/* Step 1: v8 Master Scraper */}
        <Card className="border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-[2rem] overflow-hidden">
          <CardHeader className="border-b border-white/5 py-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Master Scraper v8
              </CardTitle>
              <Button onClick={handleCopyV8} size="sm" className="bg-primary hover:bg-primary/90 rounded-xl font-bold">
                <Copy className="w-4 h-4 mr-2" />
                Copy v8 Script
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">v8 Master Features</h4>
                <ul className="text-[11px] text-slate-500 space-y-2 list-disc pl-4">
                  <li><strong className="text-slate-300">Auto-Pagination:</strong> Scans Page 1 & 2 automatically</li>
                  <li><strong className="text-slate-300">Perfect Structure:</strong> Maps lessons to their correct modules</li>
                  <li><strong className="text-slate-300">Full Breadcrumbs:</strong> Outputs the exact path you requested</li>
                  <li><strong className="text-slate-300">Background Processing:</strong> Uses hidden iframes for speed</li>
                </ul>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Instructions</h4>
                <ul className="text-[11px] text-slate-500 space-y-2 list-disc pl-4">
                  <li>Open course curriculum page</li>
                  <li>Open Console (F12)</li>
                  <li>Paste script & press Enter</li>
                  <li>Wait for the floating UI to finish</li>
                </ul>
              </div>
            </div>
            
            <ScrollArea className="h-[200px] w-full bg-black/20 rounded-2xl border border-white/5">
              <pre className="p-6 text-primary/50 font-mono text-[10px] leading-relaxed">
                {SCRAPER_V8_SCRIPT}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center p-12 border-2 border-dashed border-white/5 rounded-[2.5rem] bg-white/5">
          <div className="text-center">
            <Layers className="w-8 h-8 text-emerald-500 mx-auto mb-4" />
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">
              v8 handles multi-page courses and maintains full hierarchy
            </p>
          </div>
        </div>
      </main>

      <footer className="mt-24 opacity-30">
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default Scraper;