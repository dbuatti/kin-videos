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
  ExternalLink
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { showSuccess } from '@/utils/toast';
import { MadeWithDyad } from '@/components/made-with-dyad';

const COURSE_URL = "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations";

const DIAGNOSTIC_SCRIPT = `// TITLE DIAGNOSTIC — paste on a single Kajabi lesson page
(function() {
  var results = [];
  results.push('=== PAGE URL ===');
  results.push(window.location.href);
  results.push('');
  results.push('=== document.title ===');
  results.push(document.title);
  results.push('');
  results.push('=== All H1 elements ===');
  document.querySelectorAll('h1').forEach(function(el, i) {
    results.push('h1[' + i + ']: ' + JSON.stringify(el.innerText.trim().slice(0,100)));
    results.push('  classes: ' + el.className);
  });
  results.push('');
  results.push('=== All H2 elements ===');
  document.querySelectorAll('h2').forEach(function(el, i) {
    results.push('h2[' + i + ']: ' + JSON.stringify(el.innerText.trim().slice(0,100)));
    results.push('  classes: ' + el.className);
  });
  results.push('');
  results.push('=== Elements with "title" in class ===');
  document.querySelectorAll('[class*="title"]').forEach(function(el, i) {
    var t = el.innerText.trim().slice(0,80);
    if (t) results.push('[' + i + '] .' + el.className.split(' ').join('.') + ': ' + JSON.stringify(t));
  });

  var out = results.join('\\n');
  console.log(out);

  var ta = document.createElement('textarea');
  ta.value = out;
  ta.setAttribute('style', 'position:fixed;top:10px;left:10px;width:90vw;height:80vh;z-index:999999;font-family:monospace;font-size:11px;background:#111;color:#0f0;border:1px solid #333;padding:12px;');
  document.body.appendChild(ta);
  ta.select();
  var closeX = document.createElement('button');
  closeX.innerText = 'Close';
  closeX.setAttribute('style', 'position:fixed;top:10px;right:10px;z-index:9999999;padding:8px 16px;background:#c00;color:#fff;border:none;cursor:pointer;font-size:13px;');
  closeX.onclick = function() { ta.remove(); closeX.remove(); };
  document.body.appendChild(closeX);
  alert('Diagnostic output shown on screen. Copy all text from the box.');
})();`;

const SCRAPER_V7_SCRIPT = `(async function() {

  // UI helpers
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

  // Collect lesson links + module groupings from sidebar
  function getCourseStructure() {
    var structure = [];
    var seenUrls = {};
    var allEls = document.querySelectorAll('div,section,li,nav,aside,ul');
    allEls.forEach(function(el) {
      var links = Array.from(el.querySelectorAll('a[href*="/posts/"]'));
      if (links.length < 1) return;
      var heading = el.querySelector('h2,h3,h4,h5,[class*="category"],[class*="module"],[class*="section-title"],[class*="chapter-title"]');
      if (!heading) return;
      var moduleName = heading.innerText.trim().replace(/[\\\\n\\\\r]+/g,' ').replace(/\\\\s+/g,' ');
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
          return { url: a.href, sidebarText: a.innerText.trim().replace(/[\\\\n\\\\r]+/g,' ').replace(/\\\\s+/g,' ') };
        })
      });
    });
    return structure;
  }

  setStatus('Scanning curriculum...');
  var courseStructure = getCourseStructure();

  if (!courseStructure.length) {
    var seen2 = {};
    var flat = Array.from(document.querySelectorAll('a[href*="/posts/"]')).filter(function(a) {
      if (seen2[a.href] || a.href.indexOf('undefined') !== -1) return false;
      seen2[a.href] = true; return true;
    }).map(function(a) { return { url: a.href, sidebarText: a.innerText.trim().replace(/[\\\\n\\\\r]+/g,' ') }; });
    courseStructure = [{ module: 'Course Lessons', lessons: flat }];
    addLog('Flat fallback: ' + flat.length + ' lessons');
  }

  var courseName = 'Functional Neuro Approach Foundations';
  var cnEl = document.querySelector('h1,[class*="course-title"],[class*="product-title"],[class*="product__title"]');
  if (cnEl) courseName = cnEl.innerText.trim().replace(/[\\\\n\\\\r]+/g,' ');

  var total = courseStructure.reduce(function(n,s){ return n+s.lessons.length; },0);
  setStatus('Found ' + total + ' lessons', '#6366f1');
  addLog('Course: ' + courseName);
  await new Promise(function(r){ setTimeout(r,500); });

  // IFRAME
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

  // TITLE — Updated for v7 based on diagnostic
  function extractTitle(doc, url, sidebarText) {
    if (!doc) return sidebarText || '(untitled)';

    // Strategy A: Specific Kajabi post title class (from diagnostic)
    var postTitle = doc.querySelector('.post__title, .post-title, .lesson-title, [data-post-title]');
    if (postTitle) {
      var t = postTitle.innerText.trim().replace(/[\\\\n\\\\r]+/g,' ').replace(/\\\\s+/g,' ');
      if (t.length > 2) return t;
    }

    // Strategy B: document.title (very reliable in Kajabi)
    var docTitle = '';
    try { docTitle = doc.title || ''; } catch(e){}
    if (docTitle) {
      var stripped = docTitle.split('|')[0].split(' — ')[0].split(' - ')[0].trim();
      if (stripped.length > 2 && stripped.toLowerCase() !== 'kajabi') return stripped;
    }

    // Strategy C: Any H1
    var h1 = doc.querySelector('h1');
    if (h1) {
      var t1 = h1.innerText.trim().replace(/[\\\\n\\\\r]+/g,' ').replace(/\\\\s+/g,' ');
      if (t1.length > 2) return t1;
    }

    return sidebarText || '(untitled)';
  }

  // MP4 EXTRACTION
  async function extractMp4(doc) {
    if (!doc || !doc.body) return 'NO VIDEO FOUND';
    var html = doc.body.innerHTML;
    // S1: .bin -> .mp4
    var binRe = /"url"\\\\s*:\\\\s*"(https:\\\\/\\\\/embed-ssl\\\\.wistia\\\\.com\\\\/deliveries\\\\/[a-f0-9]+\\\\.bin)"/gi;
    var bins = []; var bm;
    while ((bm = binRe.exec(html)) !== null) bins.push(bm[1]);
    if (bins.length) return bins[bins.length-1].replace('.bin','.mp4');
    // S2: direct mp4
    var m = html.match(/https:\\\\/\\\\/embed-ssl\\\\.wistia\\\\.com\\\\/deliveries\\\\/[a-f0-9]+\\\\.mp4/i);
    if (m) return m[0];
    // S3: hashedId -> Wistia API
    var idRe = [/"hashedId"\\\\s*:\\\\s*"([a-z0-9]{8,})"/i,/wistia\\\\.com\\\\/medias\\\\/([a-z0-9]{8,})/i,/wistia_async_([a-z0-9]{8,})/i,/embed\\\\/medias\\\\/([a-z0-9]{8,})/i];
    var hid = null;
    for (var j=0;j<idRe.length;j++){ var mm=html.match(idRe[j]); if(mm){ hid=mm[1]; break; } }
    if (hid) {
      try {
        var r = await fetch('https://fast.wistia.com/embed/medias/'+hid+'.json');
        var d = await r.json();
        var assets = (d&&d.media&&d.media.assets)?d.media.assets:[];
        var mp4s = assets.filter(function(a){ return a.type==='original'||(a.contentType&&a.contentType.indexOf('mp4')!==-1); }).sort(function(a,b){ return (b.bitrate||0)-(a.bitrate||0); });
        if (mp4s.length&&mp4s[0].url) return mp4s[0].url.replace('.bin','.mp4');
      } catch(e){}
    }
    return 'NO VIDEO FOUND';
  }

  // MAIN LOOP
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
      setPath(sec.module + ' > ' + (lesson.sidebarText||'').slice(0,50));
      addLog('['+count+'/'+total+'] '+((lesson.sidebarText||'').slice(0,50)));

      var doc = await loadPage(lesson.url, 6000);
      var title = extractTitle(doc, lesson.url, lesson.sidebarText);
      var mp4 = await extractMp4(doc);
      var breadcrumb = courseName + ' / Modules / ' + sec.module + ' / ' + title;

      lines.push(breadcrumb);
      lines.push('  Page:  ' + lesson.url);
      lines.push('  Video: ' + mp4);
      lines.push('');

      jsonResults.push({
        category: sec.module,
        title: title,
        page_url: lesson.url,
        video_url: mp4 === 'NO VIDEO FOUND' ? null : mp4
      });
    }
  }

  document.body.removeChild(iframe);

  // Final UI with download buttons
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
    a.download = 'FNH_v7_'+Date.now()+'.txt';
    a.click();
  };

  var dlJson = document.createElement('button');
  dlJson.innerText = 'Copy JSON';
  dlJson.setAttribute('style', 'flex:1;padding:10px;background:#1e293b;color:white;border:1px solid #334155;border-radius:8px;font-weight:bold;cursor:pointer;');
  dlJson.onclick = function() {
    navigator.clipboard.writeText(JSON.stringify(jsonResults, null, 2));
    alert('JSON copied to clipboard! You can paste this into the app verified map.');
  };

  btnContainer.appendChild(dlTxt);
  btnContainer.appendChild(dlJson);
  ui.appendChild(btnContainer);

})();`;

const Scraper = () => {
  const navigate = useNavigate();

  const handleCopyV7 = () => {
    navigator.clipboard.writeText(SCRAPER_V7_SCRIPT);
    showSuccess("v7 Scraper script copied!");
  };

  const handleCopyDiag = () => {
    navigator.clipboard.writeText(DIAGNOSTIC_SCRIPT);
    showSuccess("Diagnostic script copied!");
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
        {/* Step 1: Diagnostic */}
        <Card className="border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-[2rem] overflow-hidden">
          <CardHeader className="border-b border-white/5 py-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-amber-500 flex items-center">
                <SearchCode className="w-5 h-5 mr-2" />
                Step 1: Title Diagnostic
              </CardTitle>
              <Button onClick={handleCopyDiag} size="sm" className="bg-amber-600 hover:bg-amber-700 rounded-xl font-bold">
                <Copy className="w-4 h-4 mr-2" />
                Copy Diagnostic
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-4">
            <p className="text-sm text-slate-400 leading-relaxed">
              Run this on a single lesson page to verify selectors. Based on your last run, we confirmed that <code className="text-white">.post__title</code> is the primary target.
            </p>
          </CardContent>
        </Card>

        {/* Step 2: v7 Scraper */}
        <Card className="border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-[2rem] overflow-hidden">
          <CardHeader className="border-b border-white/5 py-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Step 2: Full Scraper v7
              </CardTitle>
              <Button onClick={handleCopyV7} size="sm" className="bg-primary hover:bg-primary/90 rounded-xl font-bold">
                <Copy className="w-4 h-4 mr-2" />
                Copy v7 Script
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">v7 Improvements</h4>
                <ul className="text-[11px] text-slate-500 space-y-2 list-disc pl-4">
                  <li>Prioritizes <code className="text-slate-300">.post__title</code> for lesson names</li>
                  <li>Cleans <code className="text-slate-300">document.title</code> more aggressively</li>
                  <li>Added "Copy JSON" for easy app integration</li>
                  <li>Increased wait time to 6s for heavy pages</li>
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
                {SCRAPER_V7_SCRIPT}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center p-12 border-2 border-dashed border-white/5 rounded-[2.5rem] bg-white/5">
          <div className="text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-4" />
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">
              v7 is optimized for the "Functional Neuro Approach" Kajabi theme
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