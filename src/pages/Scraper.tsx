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
  SearchCode
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { showSuccess } from '@/utils/toast';
import { MadeWithDyad } from '@/components/made-with-dyad';

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
  results.push('');
  results.push('=== Elements with "post" in class ===');
  document.querySelectorAll('[class*="post"]').forEach(function(el, i) {
    var t = el.innerText.trim().slice(0,60);
    if (t && el.children.length < 5) results.push('[' + i + '] .' + el.className.split(' ').join('.').slice(0,60) + ': ' + JSON.stringify(t));
  });
  results.push('');
  results.push('=== Elements with "lesson" in class ===');
  document.querySelectorAll('[class*="lesson"]').forEach(function(el, i) {
    var t = el.innerText.trim().slice(0,80);
    if (t && el.children.length < 5) results.push('[' + i + '] .' + el.className.split(' ').join('.').slice(0,60) + ': ' + JSON.stringify(t));
  });
  results.push('');
  results.push('=== Elements with "content" in class (shallow) ===');
  document.querySelectorAll('[class*="content"]').forEach(function(el, i) {
    var t = el.innerText.trim().slice(0,60);
    if (t && el.children.length < 3) results.push('[' + i + '] .' + el.className.split(' ').join('.').slice(0,60) + ': ' + JSON.stringify(t));
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
  alert('Diagnostic output shown on screen + logged to console. Copy all text from the box.');
})();`;

const SCRAPER_V6_SCRIPT = `(async function() {

  // UI helpers
  var ui = document.createElement('div');
  ui.setAttribute('style', 'position:fixed;bottom:20px;right:20px;z-index:999999;background:#111;border:1px solid #333;border-radius:10px;padding:16px 20px;width:440px;font-family:monospace;font-size:12px;color:#e0e0e0;box-shadow:0 8px 32px rgba(0,0,0,.6);max-height:320px;overflow-y:auto;');
  var hdr = document.createElement('div');
  hdr.setAttribute('style', 'font-size:13px;font-weight:bold;color:#fff;margin-bottom:8px;');
  hdr.innerText = 'FNH Scraper v6';
  var xBtn = document.createElement('span');
  xBtn.setAttribute('style', 'float:right;cursor:pointer;color:#666;font-weight:normal;font-size:11px;');
  xBtn.innerText = '[close]';
  xBtn.onclick = function() { ui.remove(); };
  hdr.appendChild(xBtn);
  var statusEl = document.createElement('div');
  statusEl.setAttribute('style', 'color:#aaa;margin-bottom:4px;');
  statusEl.innerText = 'Starting...';
  var pathEl = document.createElement('div');
  pathEl.setAttribute('style', 'color:#5a9a5a;font-size:10px;min-height:14px;word-break:break-all;');
  var logEl = document.createElement('div');
  logEl.setAttribute('style', 'margin-top:6px;color:#555;font-size:10px;line-height:1.5;');
  ui.appendChild(hdr); ui.appendChild(statusEl); ui.appendChild(pathEl); ui.appendChild(logEl);
  document.body.appendChild(ui);
  function setStatus(m,c){ statusEl.style.color=c||'#aaa'; statusEl.innerText=m; }
  function setPath(m){ pathEl.innerText=m; }
  function addLog(m){ logEl.innerHTML=m+'<br>'+logEl.innerHTML; }

  // Collect lesson links + module groupings from sidebar
  function getCourseStructure() {
    var structure = [];
    var seenUrls = {};
    // Walk every element — find ones with a heading + post links
    var allEls = document.querySelectorAll('div,section,li,nav,aside,ul');
    allEls.forEach(function(el) {
      var links = Array.from(el.querySelectorAll('a[href*="/posts/"]'));
      if (links.length < 1) return;
      // Must have a text-only heading child (not just inherited from body)
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

  setStatus('Scanning sidebar...');
  var courseStructure = getCourseStructure();

  if (!courseStructure.length) {
    var seen2 = {};
    var flat = Array.from(document.querySelectorAll('a[href*="/posts/"]')).filter(function(a) {
      if (seen2[a.href] || a.href.indexOf('undefined') !== -1) return false;
      seen2[a.href] = true; return true;
    }).map(function(a) { return { url: a.href, sidebarText: a.innerText.trim().replace(/[\\n\\r]+/g,' ') }; });
    courseStructure = [{ module: 'Course Lessons', lessons: flat }];
    addLog('Flat fallback: ' + flat.length + ' lessons');
  }

  var courseName = 'Functional Neuro Approach Foundations';
  var cnEl = document.querySelector('h1,[class*="course-title"],[class*="product-title"]');
  if (cnEl) courseName = cnEl.innerText.trim().replace(/[\\n\\r]+/g,' ');

  var total = courseStructure.reduce(function(n,s){ return n+s.lessons.length; },0);
  setStatus('Found ' + total + ' lessons in ' + courseStructure.length + ' modules');
  addLog('Course: ' + courseName);
  await new Promise(function(r){ setTimeout(r,500); });

  // IFRAME
  var iframe = document.createElement('iframe');
  iframe.setAttribute('style','position:fixed;top:-9999px;left:-9999px;width:800px;height:600px;');
  document.body.appendChild(iframe);

  function loadPage(url, ms) {
    ms = ms || 5000;
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

  // TITLE — try many strategies, log what we find
  function extractTitle(doc, url, sidebarText) {
    if (!doc) return sidebarText || '(untitled)';

    // Strategy A: document.title — Kajabi sets this to the lesson name
    // Format is usually "Lesson Name | Course Name" or just "Lesson Name"
    var docTitle = '';
    try { docTitle = doc.title || ''; } catch(e){}
    if (docTitle) {
      // Strip everything after | or — (course/site suffix)
      var stripped = docTitle.split('|')[0].split(' — ')[0].split(' - ')[0].trim();
      if (stripped.length > 2 && stripped.length < 150) {
        console.log('[FNH] docTitle gave: ' + stripped + ' (url: ' + url + ')');
        return stripped;
      }
    }

    // Strategy B: known Kajabi lesson title selectors
    var selectors = [
      '[data-post-title]',
      '[data-lesson-title]',
      '.kjb-post-title',
      '.kjb-lesson-title',
      '[class*="kjb"][class*="title"]',
      '[class*="post-title"]',
      '[class*="lesson-title"]',
      '[class*="post_title"]',
      '[class*="lesson_title"]',
      '[class*="content-title"]',
      '[class*="entry-title"]',
      '[class*="page-title"]',
      'h1',
      'h2'
    ];
    for (var i = 0; i < selectors.length; i++) {
      var el = doc.querySelector(selectors[i]);
      if (el) {
        var t = el.innerText.trim().replace(/[\\n\\r]+/g,' ').replace(/\\s+/g,' ');
        if (t.length > 2 && t.length < 200) {
          console.log('[FNH] Selector ' + selectors[i] + ' gave: ' + t);
          return t;
        }
      }
    }

    console.log('[FNH] All selectors failed, using sidebarText: ' + sidebarText + ' (url: ' + url + ')');
    return sidebarText || '(untitled)';
  }

  // MP4 EXTRACTION
  async function extractMp4(doc) {
    if (!doc || !doc.body) return 'NO VIDEO FOUND';
    var html = doc.body.innerHTML;
    // S1: .bin -> .mp4
    var binRe = /"url"\\s*:\\s*"(https:\\/\\/embed-ssl\\.wistia\\.com\\/deliveries\\/[a-f0-9]+\\.bin)"/gi;
    var bins = []; var bm;
    while ((bm = binRe.exec(html)) !== null) bins.push(bm[1]);
    if (bins.length) return bins[bins.length-1].replace('.bin','.mp4');
    // S2: direct mp4
    var m = html.match(/https:\\/\\/embed-ssl\\.wistia\\.com\\/deliveries\\/[a-f0-9]+\\.mp4/i);
    if (m) return m[0];
    // S3: hashedId -> Wistia API
    var idRe = [/"hashedId"\\s*:\\s*"([a-z0-9]{8,})"/i,/wistia\\.com\\/medias\\/([a-z0-9]{8,})/i,/wistia_async_([a-z0-9]{8,})/i,/embed\\/medias\\/([a-z0-9]{8,})/i];
    var hid = null;
    for (var j=0;j<idRe.length;j++){ var mm=html.match(idRe[j]); if(mm){ hid=mm[1]; break; } }
    if (hid) {
      try {
        var r = await fetch('https://fast.wistia.com/embed/medias/'+hid+'.json');
        var d = await r.json();
        var assets = (d&&d.media&&d.media.assets)?d.media.assets:[];
        var mp4s = assets.filter(function(a){ return a.type==='original'||(a.contentType&&a.contentType.indexOf('mp4')!==-1); }).sort(function(a,b){ return (b.bitrate||0)-(a.bitrate||0); });
        if (mp4s.length&&mp4s[0].url) return mp4s[0].url.replace('.bin','.mp4');
        var any=assets.find(function(a){ return a.url&&a.url.indexOf('deliveries')!==-1; });
        if (any) return any.url.replace('.bin','.mp4');
      } catch(e){}
      return 'https://fast.wistia.com/embed/medias/'+hid+'.m3u8  [stream]';
    }
    return 'NO VIDEO FOUND';
  }

  // MAIN LOOP
  var lines = [];
  var count = 0;
  var sep = Array(80).join('=');

  for (var si=0; si<courseStructure.length; si++) {
    var sec = courseStructure[si];
    lines.push(''); lines.push(sep); lines.push(sec.module.toUpperCase()); lines.push(sep); lines.push('');

    for (var li=0; li<sec.lessons.length; li++) {
      var lesson = sec.lessons[li];
      count++;
      setStatus('Loading ' + count + ' / ' + total, '#7ec8ff');
      setPath(sec.module + ' > ' + (lesson.sidebarText||'').slice(0,50));
      addLog('['+count+'/'+total+'] '+((lesson.sidebarText||'').slice(0,50)));

      // First attempt: 5s wait
      var doc = await loadPage(lesson.url, 5000);
      // If title extraction would fail, retry with 7s
      var titleTest = extractTitle(doc, lesson.url, lesson.sidebarText);
      if (titleTest === lesson.sidebarText && doc) {
        addLog('Retrying for better title...');
        doc = await loadPage(lesson.url, 7000);
      }

      var title = extractTitle(doc, lesson.url, lesson.sidebarText);
      var mp4 = await extractMp4(doc);
      var breadcrumb = courseName + ' / Modules / ' + sec.module + ' / ' + title;

      lines.push(breadcrumb);
      lines.push('  Page:  ' + lesson.url);
      lines.push('  Video: ' + mp4);
      lines.push('');
    }
  }

  document.body.removeChild(iframe);

  var header = ['FNH KAJABI COURSE — FULL VIDEO EXTRACT','Generated: '+new Date().toLocaleString(),'Lessons: '+count,sep,''].join('\\n');
  var blob = new Blob([header+lines.join('\\n')],{type:'text/plain'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'FNH_v6_'+Date.now()+'.txt';
  a.click();

  setStatus('Done! ' + count + ' lessons.', '#4caf50');
  setPath('Check Downloads folder');
  setTimeout(function(){ ui.remove(); }, 15000);
})();`;

const Scraper = () => {
  const navigate = useNavigate();

  const handleCopyV6 = () => {
    navigator.clipboard.writeText(SCRAPER_V6_SCRIPT);
    showSuccess("v6 Scraper script copied!");
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
              Run this <strong>FIRST</strong> on a single lesson page to see what Kajabi actually renders. It dumps every possible title candidate so we know exactly what selector to use.
            </p>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-[11px] text-amber-200/70 leading-relaxed">
              <Info className="w-4 h-4 mb-2 text-amber-500" />
              Navigate to ONE lesson page, paste this into the console, and copy the output back to your AI assistant if titles are missing.
            </div>
          </CardContent>
        </Card>

        {/* Step 2: v6 Scraper */}
        <Card className="border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-[2rem] overflow-hidden">
          <CardHeader className="border-b border-white/5 py-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Step 2: Full Scraper v6
              </CardTitle>
              <Button onClick={handleCopyV6} size="sm" className="bg-primary hover:bg-primary/90 rounded-xl font-bold">
                <Copy className="w-4 h-4 mr-2" />
                Copy v6 Script
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">What's New in v6</h4>
                <ul className="text-[11px] text-slate-500 space-y-2 list-disc pl-4">
                  <li>5s wait for full JS rendering</li>
                  <li>Direct <code className="text-slate-300">document.title</code> fallback</li>
                  <li>Improved Kajabi selector list</li>
                  <li>Automatic retry for better titles</li>
                </ul>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Instructions</h4>
                <ul className="text-[11px] text-slate-500 space-y-2 list-disc pl-4">
                  <li>Open course main page</li>
                  <li>Open Console (F12)</li>
                  <li>Paste script & press Enter</li>
                  <li>Wait for TXT download</li>
                </ul>
              </div>
            </div>
            
            <ScrollArea className="h-[200px] w-full bg-black/20 rounded-2xl border border-white/5">
              <pre className="p-6 text-primary/50 font-mono text-[10px] leading-relaxed">
                {SCRAPER_V6_SCRIPT}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center p-12 border-2 border-dashed border-white/5 rounded-[2.5rem] bg-white/5">
          <div className="text-center">
            <FileCode className="w-8 h-8 text-slate-700 mx-auto mb-4" />
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">
              v6 uses a longer wait + reads the iframe title directly via window.frames
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