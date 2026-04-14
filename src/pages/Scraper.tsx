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
  FileCode
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { showSuccess } from '@/utils/toast';
import { MadeWithDyad } from '@/components/made-with-dyad';

const SCRAPER_SCRIPT = `(async function() {

  // UI
  var ui = document.createElement('div');
  ui.id = '_fnh_ui';
  ui.setAttribute('style', [
    'position:fixed','bottom:20px','right:20px','z-index:999999',
    'background:#111','border:1px solid #333','border-radius:10px',
    'padding:16px 20px','width:400px','font-family:monospace',
    'font-size:12px','color:#e0e0e0','box-shadow:0 8px 32px rgba(0,0,0,.6)',
    'max-height:300px','overflow-y:auto'
  ].join(';'));

  var uiInner = document.createElement('div');
  uiInner.setAttribute('style', 'font-size:13px;font-weight:bold;color:#fff;margin-bottom:8px');
  uiInner.innerHTML = '&#128302; FNH Scraper v4';

  var closeBtn = document.createElement('span');
  closeBtn.setAttribute('style', 'float:right;cursor:pointer;color:#666;font-weight:normal');
  closeBtn.innerText = 'x close';
  closeBtn.onclick = function() { ui.remove(); };
  uiInner.appendChild(closeBtn);

  var statusEl = document.createElement('div');
  statusEl.id = '_fnh_status';
  statusEl.setAttribute('style', 'color:#aaa');
  statusEl.innerText = 'Initialising...';

  var logEl = document.createElement('div');
  logEl.id = '_fnh_log';
  logEl.setAttribute('style', 'margin-top:8px;color:#666;font-size:11px;line-height:1.6');

  ui.appendChild(uiInner);
  ui.appendChild(statusEl);
  ui.appendChild(logEl);
  document.body.appendChild(ui);

  function setStatus(msg, color) {
    statusEl.style.color = color || '#aaa';
    statusEl.innerText = msg;
  }
  function addLog(msg) {
    logEl.innerHTML = msg + '<br>' + logEl.innerHTML;
  }

  // --- COURSE STRUCTURE from sidebar ---
  function getCourseStructure() {
    var structure = [];
    var selectors = [
      '[class*="category"]',
      '[class*="module"]',
      '[class*="section"]',
      '[class*="chapter"]',
      '[class*="curriculum"]'
    ];
    var categoryEls = document.querySelectorAll(selectors.join(','));
    categoryEls.forEach(function(el) {
      var heading = el.querySelector('h2,h3,h4,[class*="title"],[class*="name"],[class*="heading"]');
      var links = Array.from(el.querySelectorAll('a[href*="/posts/"]'));
      if (links.length) {
        structure.push({
          module: heading ? heading.innerText.trim().replace(/\\n+/g,' ') : 'Uncategorised',
          lessons: links.map(function(a) { return { url: a.href, text: a.innerText.trim().replace(/\\n+/g,' ') }; })
        });
      }
    });
    return structure;
  }

  setStatus('Scanning course structure...');
  var courseStructure = getCourseStructure();

  // Deduplicate lessons that appear in multiple parent containers
  var seenUrls = {};
  courseStructure = courseStructure.map(function(s) {
    var unique = s.lessons.filter(function(l) {
      if (seenUrls[l.url]) return false;
      seenUrls[l.url] = true;
      return true;
    });
    return { module: s.module, lessons: unique };
  }).filter(function(s) { return s.lessons.length > 0; });

  // Flat fallback
  if (!courseStructure.length) {
    addLog('No sidebar structure — using flat scan');
    var allLinks = Array.from(document.querySelectorAll('a[href*="/posts/"]'));
    var seen2 = {};
    var flat = [];
    allLinks.forEach(function(a) {
      if (!seen2[a.href] && !a.href.includes('undefined')) {
        seen2[a.href] = true;
        flat.push({ url: a.href, text: a.innerText.trim().replace(/\\n+/g,' ') });
      }
    });
    courseStructure = [{ module: 'Course Lessons', lessons: flat }];
  }

  var totalLessons = courseStructure.reduce(function(n, s) { return n + s.lessons.length; }, 0);
  setStatus('Found ' + totalLessons + ' lessons in ' + courseStructure.length + ' modules');
  addLog('Modules: ' + courseStructure.map(function(s){ return s.module; }).join(', ').slice(0,80) + '...');
  await new Promise(function(r) { setTimeout(r, 600); });

  // --- IFRAME ---
  var iframe = document.createElement('iframe');
  iframe.setAttribute('style', 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;');
  document.body.appendChild(iframe);

  function loadPage(url, waitMs) {
    waitMs = waitMs || 2800;
    return new Promise(function(resolve) {
      var done = false;
      var finish = function() {
        if (done) return;
        done = true;
        setTimeout(function() {
          resolve(iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document) || null);
        }, waitMs);
      };
      iframe.onload = finish;
      iframe.onerror = function() { done = true; resolve(null); };
      iframe.src = url;
      setTimeout(function() { if (!done) { done = true; resolve(iframe.contentDocument || null); } }, waitMs + 4000);
    });
  }

  // --- MP4 EXTRACTION ---
  async function extractMp4(doc) {
    if (!doc || !doc.body) return null;
    var html = doc.body.innerHTML;

    // S1: .bin delivery URLs in JSON → .mp4 (highest quality = last match)
    var binRe = /"url"\\s*:\\s*"(https:\\/\\/embed-ssl\\.wistia\\.com\\/deliveries\\/[a-f0-9]+\\.bin)"/gi;
    var binMatches = [];
    var bm;
    while ((bm = binRe.exec(html)) !== null) { binMatches.push(bm[1]); }
    if (binMatches.length) {
      return binMatches[binMatches.length - 1].replace('.bin', '.mp4');
    }

    // S2: direct .mp4 delivery URL in HTML
    var mp4Re = /https:\\/\\/embed-ssl\\.wistia\\.com\\/deliveries\\/[a-f0-9]+\\.mp4/i;
    var mp4m = html.match(mp4Re);
    if (mp4m) return mp4m[0];

    // S3: Wistia hashedId → JSON API
    var idPatterns = [
      /"hashedId"\\s*:\\s*"([a-z0-9]{8,})"/i,
      /wistia\\.com\\/medias\\/([a-z0-9]{8,})/i,
      /wistia_async_([a-z0-9]{8,})/i,
      /embed\\/medias\\/([a-z0-9]{8,})/i
    ];
    var hashedId = null;
    for (var i = 0; i < idPatterns.length; i++) {
      var m = html.match(idPatterns[i]);
      if (m) { hashedId = m[1]; break; }
    }

    if (hashedId) {
      try {
        var apiUrl = 'https://fast.wistia.com/embed/medias/' + hashedId + '.json';
        var resp = await fetch(apiUrl);
        var data = await resp.json();
        var assets = (data && data.media && data.media.assets) ? data.media.assets : [];
        var mp4s = assets
          .filter(function(a) {
            return a.type === 'original' || (a.contentType && a.contentType.indexOf('mp4') !== -1);
          })
          .sort(function(a, b) { return (b.bitrate || 0) - (a.bitrate || 0); });
        if (mp4s.length && mp4s[0].url) {
          return mp4s[0].url.replace('.bin', '.mp4');
        }
        var any = assets.find(function(a) { return a.url && a.url.indexOf('deliveries') !== -1; });
        if (any) return any.url.replace('.bin', '.mp4');
      } catch(e) {}
      return 'https://fast.wistia.com/embed/medias/' + hashedId + '.m3u8  (stream fallback)';
    }

    return 'NO VIDEO FOUND';
  }

  // --- SCRAPE ---
  var outputLines = [];
  var lessonCount = 0;
  var sep = Array(73).join('=');

  for (var si = 0; si < courseStructure.length; si++) {
    var section = courseStructure[si];
    outputLines.push('');
    outputLines.push(sep);
    outputLines.push(section.module.toUpperCase());
    outputLines.push(sep);
    outputLines.push('');

    for (var li = 0; li < section.lessons.length; li++) {
      var lesson = section.lessons[li];
      lessonCount++;
      setStatus('Scanning ' + lessonCount + '/' + totalLessons + ': ' + (lesson.text || '').slice(0,35), '#7ec8ff');
      addLog('[' + lessonCount + '/' + totalLessons + '] ' + (lesson.text || 'loading...').slice(0,45));

      var doc = null;
      var attempts = 0;
      while (!doc && attempts < 2) {
        doc = await loadPage(lesson.url, attempts === 0 ? 2800 : 4500);
        attempts++;
      }

      var title = lesson.text || '(untitled)';
      if (doc) {
        var titleEl = doc.querySelector('h1, h2, [class*="post-title"], [class*="lesson-title"], [class*="post_title"]');
        if (titleEl) title = titleEl.innerText.trim().replace(/\\n+/g, ' ');
      }

      var mp4 = await extractMp4(doc);

      outputLines.push(title);
      outputLines.push('  Page:  ' + lesson.url);
      outputLines.push('  Video: ' + (mp4 || 'NO VIDEO FOUND'));
      outputLines.push('');
    }
  }

  document.body.removeChild(iframe);

  var now = new Date().toLocaleString();
  var header = [
    'FNH KAJABI COURSE — FULL VIDEO EXTRACT',
    'Generated: ' + now,
    'Total lessons scanned: ' + lessonCount,
    sep,
    ''
  ].join('\\n');

  var output = header + outputLines.join('\\n');
  var blob = new Blob([output], { type: 'text/plain' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'FNH_Course_MP4s_' + Date.now() + '.txt';
  a.click();

  setStatus('Done! ' + lessonCount + ' lessons. File downloading...', '#4caf50');
  addLog('TXT saved to Downloads folder');
  setTimeout(function() { if (document.getElementById('_fnh_ui')) ui.remove(); }, 10000);

})();`;

const Scraper = () => {
  const navigate = useNavigate();

  const handleCopy = () => {
    navigator.clipboard.writeText(SCRAPER_SCRIPT);
    showSuccess("Script copied to clipboard!");
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
        <Button onClick={handleCopy} className="bg-primary hover:bg-primary/90 rounded-xl h-11 font-bold">
          <Copy className="w-4 h-4 mr-2" />
          Copy Script
        </Button>
      </header>

      <main className="space-y-8">
        <Card className="border-none bg-primary/10 rounded-[2.5rem] p-8 text-white">
          <h2 className="text-sm font-black uppercase tracking-widest text-primary mb-6 flex items-center">
            <Info className="w-5 h-5 mr-2" />
            How to use
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: 1, text: 'Open the FNH Foundations course page in your browser.' },
              { step: 2, text: 'Press F12 to open the Console.' },
              { step: 3, text: 'Paste the script and press Enter. Wait for "DONE!".' }
            ].map((item) => (
              <div key={item.step} className="bg-white/5 p-6 rounded-2xl border border-white/5">
                <span className="font-black text-primary block mb-2">Step {item.step}</span>
                <p className="text-sm text-slate-400">{item.text}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-[2rem] overflow-hidden">
          <CardHeader className="border-b border-white/5 py-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center">
                <FileCode className="w-5 h-5 mr-2 text-primary" />
                Extraction Script
              </CardTitle>
              <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 text-[10px]">v4.0</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px] w-full bg-black/20">
              <pre className="p-8 text-primary/70 font-mono text-[11px] leading-relaxed">
                {SCRAPER_SCRIPT}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center p-12 border-2 border-dashed border-white/5 rounded-[2.5rem] bg-white/5">
          <div className="text-center">
            <Zap className="w-8 h-8 text-amber-400 mx-auto mb-4" />
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">
              Extracts direct MP4 links from Wistia metadata automatically.
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