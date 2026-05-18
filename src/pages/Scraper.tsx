"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Terminal, 
  Copy, 
  Zap, 
  Upload,
  Loader2,
  ShieldCheck,
  Sparkles,
  FileJson,
  Rocket,
  Database
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { showSuccess, showError } from '@/utils/toast';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth-context';
import { useQueryClient } from '@tanstack/react-query';
import { useJobLessons } from '@/hooks/use-job-lessons';

const SCRAPER_MASTER_CRAWLER = `(async function() {
  const log = (msg, color = "#4f46e5") => console.log("%c" + msg, "background: " + color + "; color: white; padding: 2px 5px; border-radius: 3px; font-weight: bold;");
  log(" FNH Architect v37 ");

  const results = [];
  const seenLessons = new Set();
  const seenCatIds = new Set();
  const junk = new Set(['reply','next','back','show more','play now','next module','next lesson','previous','resume course','modules','store','my library','blog','search']);

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  // ✅ Title-only: take text up to the first newline, then cap at 120 chars
  const getTitle = (el) => {
    if (!el) return "";
    const raw = (el.textContent || "").trim();
    // Split on newline or double-space (Kajabi uses both as title/description separators)
    return raw.split(/\\n|\\r|  /)[0].trim().slice(0, 120);
  };

  const getText = (el) => (el?.textContent || "").trim().replace(/\\s+/g, ' ');

  const fetchWithRetry = async (url, retries = 3, delay = 600) => {
    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
        return res;
      } catch (e) {
        if (i < retries - 1) await sleep(delay * (i + 1));
        else throw e;
      }
    }
  };

  const getCatId = (url) => { const m = url.match(/\\/categories\\/(\\d+)/); return m ? m[1] : null; };

  const baseUrl = window.location.href.split('?')[0];
  const categoryMap = new Map(); // catId → { name, url }

  // ── PHASE 1a: /categories index — top-level modules ──────────────────────
  log("Phase 1a: /categories index...", "#3b82f6");
  try {
    const res = await fetchWithRetry(baseUrl + "/categories");
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    doc.querySelectorAll('a[href*="/categories/"]').forEach(a => {
      const catId = getCatId(a.href);
      if (!catId || a.href.includes('/posts/') || categoryMap.has(catId)) return;
      const name = getTitle(a);
      if (name.length >= 3 && !junk.has(name.toLowerCase())) {
        categoryMap.set(catId, { name, url: a.href.split('?')[0] });
      }
    });
  } catch(e) { log("⚠ /categories failed", "#ef4444"); }

  // ── PHASE 1b: Syllabus pages — sub-modules not on /categories index ───────
  // Strategy: for each /posts/ link on the syllabus, extract its category ID
  // from the URL itself (it's always /categories/CATID/posts/POSTID).
  // Group posts by category ID → each unique catId is a module.
  // Get the module name from the nearest heading above that group.
  log("Phase 1b: Syllabus pages for sub-modules...", "#3b82f6");

  for (const pageUrl of [baseUrl, baseUrl + "?page=2"]) {
    try {
      const res = await fetchWithRetry(pageUrl);
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');

      // Collect ALL post links and group by the catId embedded in the URL
      const postLinks = Array.from(doc.querySelectorAll('a[href*="/posts/"]'));
      const firstLinkByCat = new Map(); // catId → first <a> element with that catId

      postLinks.forEach(a => {
        const catId = getCatId(a.href);
        if (!catId || firstLinkByCat.has(catId)) return;
        firstLinkByCat.set(catId, a);
      });

      // For each category ID found via posts, find its module heading
      firstLinkByCat.forEach((firstLink, catId) => {
        if (categoryMap.has(catId)) return; // already have it

        // Walk up the DOM from this link, scanning for a preceding heading
        let moduleName = null;
        let el = firstLink.parentElement;
        for (let depth = 0; depth < 10 && el && el !== doc.body; depth++) {
          // Scan previous siblings at this level for a heading
          let sib = el.previousElementSibling;
          while (sib) {
            const h = sib.matches?.('h1,h2,h3,h4,h5') ? sib : sib.querySelector('h1,h2,h3,h4,h5');
            if (h) {
              const txt = getTitle(h);
              if (txt.length >= 3 && !junk.has(txt.toLowerCase())) {
                moduleName = txt;
                break;
              }
            }
            sib = sib.previousElementSibling;
          }
          if (moduleName) break;
          el = el.parentElement;
        }

        // Fallback: use the first link's own title text as a last resort
        if (!moduleName) {
          // Try to get a clean name from the category URL itself if it has one
          // (some Kajabi setups embed slug info — here it's just a number, so skip)
          moduleName = null;
        }

        if (moduleName) {
          const catUrl = firstLink.href.replace(/\\/posts\\/.*/, '').split('?')[0];
          categoryMap.set(catId, { name: moduleName, url: catUrl });
        }
      });

    } catch(e) { log(\`⚠ Syllabus page failed: \${pageUrl}\`, "#ef4444"); }
  }

  // Remove any entries where URL somehow contains /posts/
  for (const [id, entry] of categoryMap) {
    if (entry.url.includes('/posts/')) categoryMap.delete(id);
  }

  const categoriesToCrawl = Array.from(categoryMap.values());
  log(\`Found \${categoriesToCrawl.length} modules:\`, "#10b981");
  categoriesToCrawl.forEach(c => log(\`  → \${c.name}\`, "#6366f1"));

  // ── PHASE 2: Crawl each module, all pages ────────────────────────────────
  for (const cat of categoriesToCrawl) {
    const moduleName = cat.name;
    const catBaseUrl = cat.url;
    let pageNum = 1;
    let keepGoing = true;

    while (keepGoing) {
      const currentUrl = pageNum === 1 ? catBaseUrl : catBaseUrl + \`?page=\${pageNum}\`;
      log(\`  [\${moduleName}] Page \${pageNum}...\`, "#6366f1");

      try {
        const res = await fetchWithRetry(currentUrl);
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');

        const lessonLinks = Array.from(doc.querySelectorAll('a[href*="/posts/"]'))
          .map(a => ({ title: getTitle(a), url: a.href.split('?')[0] }))
          .filter(l => l.url && !seenLessons.has(l.url) && l.title.length > 2 && !junk.has(l.title.toLowerCase()));

        if (lessonLinks.length === 0 && pageNum > 1) { keepGoing = false; break; }

        for (const lesson of lessonLinks) {
          seenLessons.add(lesson.url);
          log(\`    [\${results.length + 1}] \${lesson.title}\`, "#8b5cf6");

          let video_url = null;
          try {
            const lessonRes = await fetchWithRetry(lesson.url);
            const lessonHtml = await lessonRes.text();
            const m = lessonHtml.match(/wistia\\.com\\/embed\\/medias\\/([a-z0-9]+)/i)
                   || lessonHtml.match(/wistia_async_([a-z0-9]+)/i)
                   || lessonHtml.match(/mediaData\\["([a-z0-9]+)"\\]/i)
                   || lessonHtml.match(/"hashed_id":"([a-z0-9]+)"/i);
            if (m) {
              const metaRes = await fetchWithRetry(\`https://fast.wistia.com/embed/medias/\${m[1]}.json\`);
              const meta = await metaRes.json();
              const assets = meta?.media?.assets || [];
              const mp4 = assets.find(a => a.type === 'original' && a.ext === 'mp4')
                       || assets.filter(a => a.ext === 'mp4').sort((a,b) => b.size - a.size)[0];
              if (mp4) video_url = mp4.url.replace('.bin', '.mp4');
            }
          } catch(e) { log(\`      ⚠ Video failed: \${lesson.title}\`, "#f59e0b"); }

          results.push({ category: moduleName, title: lesson.title, page_url: lesson.url, video_url });
          await sleep(200);
        }

        const nextPageNum = pageNum + 1;
        const hasNext = !!doc.querySelector('a[rel="next"]') ||
          Array.from(doc.querySelectorAll('a')).some(a =>
            getText(a).trim() === String(nextPageNum) || (a.href||'').includes(\`page=\${nextPageNum}\`)
          );
        hasNext ? pageNum++ : (keepGoing = false);

      } catch(e) {
        log(\`  ⚠ [\${moduleName}] page \${pageNum}: \${e.message}\`, "#ef4444");
        keepGoing = false;
      }
    }
  }

  // ── PHASE 3: UI ──────────────────────────────────────────────────────────
  const finalJson = JSON.stringify(results, null, 2);
  const container = document.createElement('div');
  container.style.cssText = "position:fixed;top:10px;left:10px;right:10px;bottom:10px;background:white;z-index:999999;padding:20px;border:5px solid #4f46e5;border-radius:20px;display:flex;flex-direction:column;box-shadow:0 0 50px rgba(0,0,0,0.5);";
  container.innerHTML = \`
    <h1 style="color:#4f46e5;margin:0 0 10px 0;font-family:sans-serif;">✅ \${results.length} Lessons across \${categoriesToCrawl.length} Modules</h1>
    <p style="margin-bottom:10px;font-family:sans-serif;color:#666;">Copy and paste into the Scraper app.</p>
    <textarea id="fnh-results" style="flex:1;width:100%;font-family:monospace;font-size:12px;padding:10px;border:1px solid #ccc;border-radius:10px;background:#f9fafb;">\${finalJson}</textarea>
    <div style="margin-top:10px;display:flex;gap:10px;">
      <button id="fnh-copy" style="background:#4f46e5;color:white;border:none;padding:15px 30px;border-radius:10px;font-weight:bold;cursor:pointer;flex:1;font-size:16px;">COPY TO CLIPBOARD</button>
      <button id="fnh-close" style="background:#ccc;color:black;border:none;padding:15px 30px;border-radius:10px;font-weight:bold;cursor:pointer;">CLOSE</button>
    </div>\`;
  document.body.appendChild(container);
  document.getElementById('fnh-copy').onclick = async () => {
    try { await navigator.clipboard.writeText(finalJson); alert("Copied!"); }
    catch { document.getElementById('fnh-results').select(); document.execCommand('copy'); alert("Copied!"); }
  };
  document.getElementById('fnh-close').onclick = () => container.remove();
  log(\` DONE! \${results.length} lessons / \${categoriesToCrawl.length} modules \`, "#10b981");
})();`;

const Scraper = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: lessons, cleanJunk, isCleaning } = useJobLessons();
  const [importJson, setImportJson] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  const handleArchiveCourse = async () => {
    if (!user) return;
    setIsArchiving(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-course', {
        body: { user_id: user.id }
      });
      if (error) throw error;
      showSuccess("Foundations Course archived successfully!");
      queryClient.invalidateQueries({ queryKey: ['allLessons'] });
      navigate('/gallery');
    } catch (err: any) {
      showError("Archive failed: " + err.message);
    } finally {
      setIsArchiving(false);
    }
  };

  const handleCopy = (script: string, version: string) => {
    navigator.clipboard.writeText(script);
    showSuccess(`${version} script copied!`);
  };

  const handleExportLibrary = () => {
    if (!lessons || lessons.length === 0) {
      showError("No lessons to export.");
      return;
    }
    const exportData = lessons.map(l => ({
      category: l.category,
      title: l.title,
      page_url: l.lesson_url,
      video_url: l.video_url
    }));
    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
    showSuccess("Full library JSON copied to clipboard!");
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
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleExportLibrary} className="border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 rounded-xl h-12 px-6 font-bold">
            <FileJson className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
          <Button variant="outline" onClick={() => cleanJunk()} disabled={isCleaning} className="border-amber-500/20 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 rounded-xl h-12 px-6 font-bold">
            {isCleaning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Clean Junk
          </Button>
        </div>
      </header>

      <main className="space-y-12">
        <section className="space-y-6">
          <div className="flex items-center space-x-2 text-primary">
            <Rocket className="w-5 h-5" />
            <h2 className="text-sm font-black uppercase tracking-widest">Verified Course Archive</h2>
          </div>
          <Card className="border-primary/20 bg-primary/5 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border-2">
            <CardContent className="p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 text-center md:text-left">
                <h3 className="text-2xl font-black text-white tracking-tight">Foundations Course</h3>
                <p className="text-slate-400 text-sm max-w-md leading-relaxed">
                  Instantly populate your library with all 60+ verified lessons. No scraping required.
                </p>
              </div>
              <Button onClick={handleArchiveCourse} disabled={isArchiving} className="bg-primary hover:bg-primary/90 text-white rounded-2xl px-10 py-8 h-auto font-black text-lg shadow-2xl shadow-primary/20 transition-all transform hover:scale-105 active:scale-95 shrink-0">
                {isArchiving ? <><Loader2 className="w-6 h-6 mr-3 animate-spin" /> Archiving...</> : <><Zap className="w-6 h-6 mr-3 fill-current" /> Archive Course Now</>}
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          <div className="flex items-center space-x-2 text-blue-400">
            <ShieldCheck className="w-5 h-5" />
            <h2 className="text-sm font-black uppercase tracking-widest">Live Scraper Tools</h2>
          </div>
          <Card className="border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-[2rem] overflow-hidden">
            <CardHeader className="border-b border-white/5 py-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-indigo-400 flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  FNH Master Crawler (v37)
                </CardTitle>
                <Button onClick={() => handleCopy(SCRAPER_MASTER_CRAWLER, 'Master Crawler')} size="sm" className="bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Script
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <p className="text-xs text-slate-400">
                Run this on the <strong>Main Syllabus Page</strong> to crawl the entire course, or on a <strong>Category Page</strong> to crawl just that module (including Page 2).
              </p>
              <ScrollArea className="h-[200px] w-full bg-black/40 rounded-2xl border border-white/5">
                <pre className="p-6 text-indigo-400/50 font-mono text-[10px] leading-relaxed">{SCRAPER_MASTER_CRAWLER}</pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Database className="w-5 h-5" />
            <h2 className="text-sm font-black uppercase tracking-widest">Manual Import</h2>
          </div>
          <Card className="border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-[2rem] overflow-hidden">
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <p className="text-xs text-slate-400">Paste custom JSON results here to update your library manually.</p>
                <Textarea 
                  placeholder='[ { "category": "...", "title": "...", "video_url": "..." }, ... ]'
                  className="min-h-[150px] font-mono text-[10px] bg-black/40 border-white/5 rounded-2xl focus-visible:ring-emerald-500"
                  value={importJson}
                  onChange={(e) => setImportJson(e.target.value)}
                />
              </div>
              <Button onClick={handleManualImport} disabled={isImporting || !importJson.trim()} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl h-14 font-black shadow-lg shadow-emerald-500/20">
                {isImporting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Importing...</> : <><Upload className="w-5 h-5 mr-2" /> Sync to My Library</>}
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="mt-24 opacity-30">
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default Scraper;