(async function () {
  "use strict";

  const VERSION = "v38";
  const CFG = {
    delay: 250,          // ms between lessons
    verify: true,        // load each MP4's metadata to confirm it plays
    maxPages: 50,        // per listing
    checkpointKey: "fnh-scraper-v38-checkpoint",
  };

  const JUNK = new Set([
    "reply", "next", "back", "show more", "play now", "next module",
    "next lesson", "previous", "resume course", "modules", "store",
    "my library", "blog", "search", "mark as complete", "complete",
    "watch", "watch lesson", "download", "home",
  ]);

  const log = (msg, color = "#4f46e5") => {
    console.log("%c" + msg, "background:" + color + ";color:white;padding:2px 5px;border-radius:3px;font-weight:bold;");
    addLog(msg);
  };

  // ── panel ────────────────────────────────────────────────────────────────
  const panel = document.createElement("div");
  panel.id = "fnh-v38-panel";
  panel.style.cssText = [
    "position:fixed", "right:16px", "bottom:16px", "width:390px",
    "max-width:calc(100vw - 32px)", "background:#0f172a", "color:#e2e8f0",
    "border:1px solid #334155", "border-radius:14px", "padding:14px",
    "font:12px/1.45 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
    "z-index:2147483647", "box-shadow:0 20px 60px rgba(0,0,0,.55)",
  ].join(";");
  panel.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
      <strong style="color:#a5b4fc;letter-spacing:.08em;font-size:11px">FNH ARCHITECT ${VERSION}</strong>
      <span id="fnh-v38-count" style="color:#94a3b8;font-size:11px">0 lessons</span>
    </div>
    <div style="height:4px;background:#1e293b;border-radius:99px;overflow:hidden;margin-bottom:8px">
      <div id="fnh-v38-bar" style="height:100%;width:0%;background:#6366f1;transition:width .25s"></div>
    </div>
    <div id="fnh-v38-current" style="color:#cbd5e1;margin-bottom:8px;min-height:18px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">starting…</div>
    <div id="fnh-v38-log" style="background:#020617;border:1px solid #1e293b;border-radius:8px;padding:8px;height:84px;overflow:hidden;color:#64748b;font:10px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre-wrap"></div>
    <div style="display:flex;gap:8px;margin-top:10px">
      <button id="fnh-v38-pause" style="flex:1;background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:8px;padding:8px;font-weight:700;cursor:pointer">Pause</button>
      <button id="fnh-v38-stop" style="flex:1;background:#7f1d1d;color:#fecaca;border:1px solid #991b1b;border-radius:8px;padding:8px;font-weight:700;cursor:pointer">Stop &amp; export</button>
    </div>
    <div style="color:#475569;font-size:9px;margin-top:8px">Leave this tab open. Progress is saved after every lesson.</div>`;
  document.body.appendChild(panel);

  const logLines = [];
  function addLog(msg) {
    logLines.push(msg);
    if (logLines.length > 7) logLines.shift();
    const el = document.getElementById("fnh-v38-log");
    if (el) el.textContent = logLines.join("\n");
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const $ = (id) => document.getElementById(id);

  // ── state ────────────────────────────────────────────────────────────────
  let stopped = false;
  let paused = false;
  let totalKnown = 0;
  let state = { results: [] };
  let categories = [];       // ordered [{ id, name, url, lessonCount }]
  const categoryIds = new Set();
  const seen = new Set();    // lesson page URLs

  const saved = readCheckpoint();
  if (saved && saved.results?.length) {
    const resume = confirm(
      `FNH v38: resume the previous run (${saved.results.length} lessons already captured)?\n\n` +
      `Cancel starts a fresh crawl and discards the checkpoint.`
    );
    if (resume) {
      state = saved;
      (saved.categories || []).forEach((c) => {
        if (!categoryIds.has(c.id)) { categoryIds.add(c.id); categories.push({ ...c, lessonCount: 0 }); }
      });
      state.results.forEach((r) => seen.add(r.page_url));
      log(`Resuming with ${state.results.length} lessons`);
    } else {
      clearCheckpoint();
    }
  }

  function readCheckpoint() {
    try { return JSON.parse(localStorage.getItem(CFG.checkpointKey) || "null"); } catch { return null; }
  }
  function clearCheckpoint() {
    try { localStorage.removeItem(CFG.checkpointKey); } catch { /* ignore */ }
  }
  function saveCheckpoint() {
    try {
      localStorage.setItem(CFG.checkpointKey, JSON.stringify({
        savedAt: Date.now(),
        results: state.results,
        categories: categories.map(({ id, name, url }) => ({ id, name, url })),
      }));
    } catch { /* quota — ignore */ }
  }

  // ── helpers ──────────────────────────────────────────────────────────────
  function getText(el) {
    return (el?.textContent || "").replace(/\s+/g, " ").trim();
  }

  function cleanName(s) {
    return String(s || "")
      .replace(/\s+/g, " ")
      .replace(/\s*\(\s*\d+\s*(lessons?|videos?|items?)\s*\)\s*$/i, "")
      .replace(/\s*\|\s*FNH.*$/i, "")
      .trim()
      .slice(0, 140);
  }

  function validName(s) {
    if (!s || s.length < 3 || s.length > 140) return false;
    if (JUNK.has(s.toLowerCase())) return false;
    if (/^\d+$/.test(s)) return false;
    return true;
  }

  // An anchor's own title, before any nested description text.
  // Kajabi wraps titles in <p>/<h4> inside the <a>, so prefer a heading-ish
  // child first, then fall back to the first meaningful line of text.
  function linkTitle(a) {
    const heading = a.querySelector("h1,h2,h3,h4,h5,h6,strong,b,.title,.post-title,.lesson-title");
    if (heading) {
      const t = cleanName(getText(heading));
      if (validName(t)) return t;
    }
    const aria = a.getAttribute("aria-label") || a.getAttribute("title");
    if (aria) {
      const t = cleanName(aria);
      if (validName(t)) return t;
    }
    const raw = (a.textContent || "").replace(/\r/g, "");
    const lines = raw.split("\n").map((s) => s.replace(/\s+/g, " ").trim()).filter(Boolean);
    for (const line of lines) {
      const t = cleanName(line);
      if (validName(t)) return t;
    }
    return "";
  }

  function categoryIdFromUrl(url) {
    const m = String(url || "").match(/\/categories\/(\d+)/);
    return m ? m[1] : null;
  }
  function postIdFromUrl(url) {
    const m = String(url || "").match(/\/posts\/(\d+)/);
    return m ? m[1] : null;
  }

  function resolveUrl(href, base) {
    if (!href) return "";
    try { return new URL(href, base).href; } catch { return href; }
  }

  function fetchWithRetry(url, retries = 3, delay = 700) {
    return (async () => {
      for (let i = 0; i < retries; i++) {
        try {
          const res = await fetch(url, { credentials: "same-origin" });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res;
        } catch (e) {
          if (i === retries - 1) throw e;
          await sleep(delay * (i + 1));
        }
      }
      throw new Error("fetch failed");
    })();
  }

  async function fetchDoc(url) {
    const res = await fetchWithRetry(url);
    return new DOMParser().parseFromString(await res.text(), "text/html");
  }
  async function fetchText(url) {
    const res = await fetchWithRetry(url);
    return res.text();
  }

  function hasNext(doc, nextPage) {
    if (doc.querySelector('a[rel="next"]')) return true;
    return Array.from(doc.querySelectorAll("a[href]")).some((a) => {
      const href = a.getAttribute("href") || "";
      if (href.includes(`page=${nextPage}`)) return true;
      return getText(a) === String(nextPage) && /page=/.test(href);
    });
  }

  async function crawlListing(startUrl, onDoc) {
    let page = 1;
    const visited = new Set();
    while (page <= CFG.maxPages && !stopped) {
      const url = page === 1 ? startUrl : `${startUrl}?page=${page}`;
      if (visited.has(url)) break;
      visited.add(url);
      let doc;
      try {
        doc = await fetchDoc(url);
      } catch (e) {
        if (page === 1) throw e;
        break;
      }
      onDoc(doc, url);
      if (!hasNext(doc, page + 1)) break;
      page++;
      await sleep(150);
    }
  }

  // ── where are we? ────────────────────────────────────────────────────────
  const productMatch = location.pathname.match(/\/products\/([^/]+)/);
  if (!productMatch) {
    alert("Open the FNH course inside Kajabi first, then run this script.");
    panel.remove();
    return;
  }
  const productRoot = `${location.origin}/products/${productMatch[1]}`;
  const currentCatId = categoryIdFromUrl(location.href);
  const currentPostId = postIdFromUrl(location.href);
  const singleModule = !!currentCatId; // category or lesson page

  log(`FNH Architect ${VERSION} — ${singleModule ? "single module" : "full course"}`);

  function addCategory(id, name, url) {
    if (!id || categoryIds.has(id)) return;
    categoryIds.add(id);
    categories.push({ id, name: name || `Module ${id}`, url: url || `${productRoot}/categories/${id}`, lessonCount: 0 });
  }

  function headingAbove(el) {
    let node = el;
    for (let depth = 0; depth < 12 && node && node !== document.body; depth++) {
      let sib = node.previousElementSibling;
      while (sib) {
        const h = /^H[1-6]$/.test(sib.tagName) ? sib : sib.querySelector?.("h1,h2,h3,h4,h5,h6");
        if (h) {
          const t = cleanName(getText(h));
          if (validName(t)) return t;
        }
        sib = sib.previousElementSibling;
      }
      node = node.parentElement;
    }
    return "";
  }

  function collectFromDoc(doc, pageUrl) {
    // Explicit module links (the /categories index, sidebars).
    doc.querySelectorAll('a[href*="/categories/"]').forEach((a) => {
      const href = resolveUrl(a.getAttribute('href'), pageUrl);
      if (/\/posts\//.test(href)) return;
      const id = categoryIdFromUrl(href);
      if (!id) return;
      const name = cleanName(linkTitle(a));
      if (validName(name)) addCategory(id, name, href.split("?")[0]);
    });

    // Lessons grouped by their category id, named from the nearest heading.
    const firstByCat = new Map();
    doc.querySelectorAll('a[href*="/posts/"]').forEach((a) => {
      const id = categoryIdFromUrl(resolveUrl(a.getAttribute('href'), pageUrl));
      if (!id || firstByCat.has(id)) return;
      firstByCat.set(id, a);
    });
    firstByCat.forEach((a, id) => {
      if (categoryIds.has(id)) return;
      const heading = headingAbove(a);
      if (heading) addCategory(id, heading, `${productRoot}/categories/${id}`);
    });
  }

  // ── discover modules ─────────────────────────────────────────────────────
  if (singleModule && !categoryIds.has(currentCatId)) {
    const doc = await fetchDoc(location.href.split("?")[0]);
    const h = doc.querySelector("main h1, h1");
    let name = cleanName(getText(h));
    if (!validName(name)) name = cleanName(document.title.split(/[|–]/)[0]);
    addCategory(currentCatId, name || `Module ${currentCatId}`, `${productRoot}/categories/${currentCatId}`);
  }

  if (!singleModule) {
    log("Reading syllabus…", "#3b82f6");
    try {
      await crawlListing(productRoot, (doc, url) => collectFromDoc(doc, url));
    } catch (e) {
      log(`⚠ syllabus failed: ${e.message}`, "#ef4444");
    }

    log("Reading categories index…", "#3b82f6");
    try {
      const doc = await fetchDoc(`${productRoot}/categories`);
      collectFromDoc(doc, `${productRoot}/categories`);
    } catch (e) {
      log("⚠ categories index unavailable", "#f59e0b");
    }

    // Drop anything without a numeric id or a sane name.
    categories = categories.filter((c) => c.id && validName(c.name));
  }

  if (!categories.length) {
    log("⚠ No modules found. Open the syllabus page and retry.", "#ef4444");
    return;
  }

  categories.forEach((c, i) => log(`  ${i + 1}. ${c.name}`));
  window.__FNH_DEBUG = { categories: categories.map((c) => ({ id: c.id, name: c.name, url: c.url })), totalKnown };
  updateUI();

  // ── crawl lessons ────────────────────────────────────────────────────────
  outer:
  for (let ci = 0; ci < categories.length; ci++) {
    const cat = categories[ci];
    if (stopped) break;

    log(`[${ci + 1}/${categories.length}] ${cat.name}`, "#6366f1");
    const links = [];
    let rawSeen = 0;

    try {
      await crawlListing(cat.url, (doc, pageUrl) => {
        doc.querySelectorAll('a[href*="/posts/"]').forEach((a) => {
          const url = resolveUrl(a.getAttribute('href'), pageUrl).split("?")[0].split("#")[0];
          if (!postIdFromUrl(url) || seen.has(url)) return;
          rawSeen++;
          if (links.some((l) => l.url === url)) return;
          const title = linkTitle(a);
          if (!validName(title)) return;
          links.push({ url, title });
        });
      });
    } catch (e) {
      log(`  ⚠ could not read module: ${e.message}`, "#ef4444");
      continue;
    }

    totalKnown += links.length;
    log(`  ${links.length} lessons (${rawSeen} raw links)`, "#64748b");

    for (const link of links) {
      if (stopped) break outer;
      while (paused && !stopped) await sleep(150);
      if (stopped) break outer;

      seen.add(link.url);
      cat.lessonCount = (cat.lessonCount || 0) + 1;

      const lesson = {
        category: cat.name,
        module_index: ci + 1,
        lesson_index: cat.lessonCount,
        title: link.title,
        page_url: link.url,
        video_url: null,
        wistia_id: null,
        duration: null,
        thumbnail_url: null,
        captions_url: null,
        embed_url: null,
        verified: false,
        error: null,
      };

      setCurrent(`[${state.results.length + 1}] ${link.title}`);

      try {
        const html = await fetchText(link.url);
        const wistiaId = extractWistiaId(html);
        lesson.wistia_id = wistiaId || null;

        if (wistiaId) {
          const meta = await fetchWistiaMeta(wistiaId);
          if (meta) applyWistiaMeta(lesson, meta);
        }

        if (!lesson.video_url) {
          const direct = html.match(/<(?:video|source)[^>]+src=["']([^"']+\.mp4[^"']*)["']/i);
          if (direct) lesson.video_url = decodeHtml(direct[1]);
        }

        if (!lesson.video_url) {
          const iframe = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
          if (iframe && /wistia|vimeo|youtube|youtu\.be/i.test(iframe[1])) {
            lesson.embed_url = decodeHtml(iframe[1]);
          }
        }

        if (lesson.video_url && CFG.verify) {
          const probe = await probeVideo(lesson.video_url);
          lesson.verified = probe.ok;
          if (!lesson.duration && probe.duration) lesson.duration = probe.duration;
        }
      } catch (e) {
        lesson.error = e.message;
        log(`  ⚠ ${link.title}: ${e.message}`, "#f59e0b");
      }

      state.results.push(lesson);
      saveCheckpoint();
      updateUI();
      await sleep(CFG.delay);
    }
  }

  const finished = !stopped && state.results.length > 0;
  if (finished) clearCheckpoint();
  showResults(stopped ? "Stopped — checkpoint kept" : finished ? "Complete" : "Nothing captured");

  // ── Wistia ───────────────────────────────────────────────────────────────
  function extractWistiaId(html) {
    const patterns = [
      /wistia_async_([a-z0-9]{8,})/i,
      /wistia\.com\/embed\/medias\/([a-z0-9]{8,})/i,
      /wistia\.com\/medias\/([a-z0-9]{8,})/i,
      /wistia\.net\/embed\/iframe\/([a-z0-9]{8,})/i,
      /"hashed_id"\s*:\s*"([a-z0-9]{8,})"/i,
      /data-wistia-id=["']([a-z0-9]{8,})["']/i,
    ];
    for (const re of patterns) {
      const m = html.match(re);
      if (m) return m[1];
    }
    return null;
  }

  async function fetchWistiaMeta(id) {
    const urls = [
      `https://fast.wistia.com/embed/medias/${id}.json`,
      `https://fast.wistia.net/embed/medias/${id}.json`,
    ];
    for (const url of urls) {
      try {
        const res = await fetchWithRetry(url, 2, 500);
        return await res.json();
      } catch { /* try next */ }
    }
    return null;
  }

  function applyWistiaMeta(lesson, meta) {
    const media = meta.media || meta;
    const assets = Array.isArray(media.assets) ? media.assets : [];

    const mp4s = assets.filter((a) => {
      const ext = (a.ext || "").toLowerCase();
      const type = (a.content_type || a.type || "").toLowerCase();
      return ext === "mp4" || type.includes("mp4");
    });
    const original = mp4s.find((a) => a.type === "original");
    const best = original || mp4s.sort((a, b) => (b.size || 0) - (a.size || 0))[0];

    if (best?.url) {
      lesson.video_url = best.url.replace(/\.bin(?=$|\?)/i, ".mp4");
    }

    if (typeof media.duration === "number" && media.duration > 0) {
      lesson.duration = Math.round(media.duration);
    }

    const still = assets
      .filter((a) => a.type === "still_image" || /image/.test(a.content_type || ""))
      .sort((a, b) => (b.width || 0) - (a.width || 0))[0];
    lesson.thumbnail_url = media.thumbnail_url || still?.url || null;

    const captions = media.captions || media.text_tracks || [];
    const firstCaption = Array.isArray(captions) ? captions[0] : null;
    lesson.captions_url = firstCaption?.url || firstCaption?.text_file_url || null;
  }

  function probeVideo(url) {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.muted = true;
      video.style.cssText = "position:fixed;left:-10px;top:-10px;width:1px;height:1px;opacity:0;pointer-events:none";
      let settled = false;
      const timer = setTimeout(() => done(false, null), 12000);

      function done(ok, duration) {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        video.removeAttribute("src");
        try { video.load(); } catch { /* ignore */ }
        video.remove();
        resolve({ ok, duration });
      }

      video.onloadedmetadata = () => {
        const d = Number.isFinite(video.duration) ? Math.round(video.duration) : null;
        done(true, d);
      };
      video.onerror = () => done(false, null);
      video.src = url;
      document.body.appendChild(video);
    });
  }

  // ── export ───────────────────────────────────────────────────────────────
  function toCSV() {
    const head = ["module_index", "lesson_index", "category", "title", "page_url", "video_url", "wistia_id", "duration_seconds", "thumbnail_url", "captions_url", "verified"];
    const esc = (v) => `"${String(v == null ? "" : v).replace(/"/g, '""')}"`;
    return [head.join(",")].concat(
      state.results.map((r) => [
        r.module_index, r.lesson_index, r.category, r.title, r.page_url,
        r.video_url, r.wistia_id, r.duration, r.thumbnail_url, r.captions_url, r.verified,
      ].map(esc).join(","))
    ).join("\n");
  }

  function showResults(status) {
    const json = JSON.stringify(state.results, null, 2);
    const csv = toCSV();
    const videos = state.results.filter((r) => r.video_url).length;
    panel.style.width = "min(760px, calc(100vw - 32px))";
    panel.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <strong style="color:#a5b4fc;font-size:12px;letter-spacing:.08em">FNH ARCHITECT ${VERSION} — ${status}</strong>
        <button id="fnh-v38-close" style="background:none;border:0;color:#64748b;font-size:18px;cursor:pointer">×</button>
      </div>
      <div style="color:#94a3b8;margin-bottom:10px">
        <b style="color:#e2e8f0">${state.results.length}</b> lessons ·
        <b style="color:#e2e8f0">${videos}</b> video URLs ·
        <b style="color:#e2e8f0">${categories.length}</b> modules
      </div>
      <textarea id="fnh-v38-out" spellcheck="false" style="width:100%;height:240px;background:#020617;color:#cbd5e1;border:1px solid #1e293b;border-radius:8px;padding:10px;font:10px/1.5 ui-monospace,Menlo,monospace;resize:vertical">${escapeHtml(json)}</textarea>
      <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
        <button id="fnh-v38-copy-json" style="flex:1;min-width:120px;background:#4f46e5;color:#fff;border:0;border-radius:8px;padding:10px;font-weight:800;cursor:pointer">Copy JSON</button>
        <button id="fnh-v38-copy-csv" style="flex:1;min-width:120px;background:#0f766e;color:#fff;border:0;border-radius:8px;padding:10px;font-weight:800;cursor:pointer">Copy CSV</button>
        <button id="fnh-v38-download" style="flex:1;min-width:120px;background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:8px;padding:10px;font-weight:800;cursor:pointer">Download JSON</button>
      </div>
      <div style="color:#475569;font-size:10px;margin-top:8px">Paste the JSON into Scraper → Manual Import, or keep the CSV next to the downloads.</div>`;

    const ta = $("fnh-v38-out");
    $("fnh-v38-close").onclick = () => panel.remove();
    $("fnh-v38-copy-json").onclick = () => copyText(json, ta);
    $("fnh-v38-copy-csv").onclick = () => copyText(csv, ta);
    $("fnh-v38-download").onclick = () => download("fnh-lessons-v38.json", json, "application/json");

    log(`DONE — ${state.results.length} lessons / ${videos} videos`, "#10b981");
  }

  function copyText(text, fallbackEl) {
    navigator.clipboard.writeText(text).then(
      () => log("Copied to clipboard"),
      () => { fallbackEl.value = text; fallbackEl.select(); document.execCommand("copy"); log("Copied"); }
    );
  }

  function download(name, text, type) {
    const blob = new Blob([text], { type });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function decodeHtml(s) {
    const t = document.createElement("textarea");
    t.innerHTML = s;
    return t.value;
  }

  // ── live UI ──────────────────────────────────────────────────────────────
  function setCurrent(text) {
    const el = $("fnh-v38-current");
    if (el) el.textContent = text;
  }

  function updateUI() {
    const count = $("fnh-v38-count");
    if (count) count.textContent = `${state.results.length} lessons`;
    const bar = $("fnh-v38-bar");
    if (bar) {
      const done = state.results.length;
      const pct = totalKnown > 0 ? Math.min(100, Math.round((done / totalKnown) * 100)) : 0;
      bar.style.width = `${pct}%`;
    }
  }

  const pauseBtn = $("fnh-v38-pause");
  if (pauseBtn) {
    pauseBtn.onclick = () => {
      paused = !paused;
      pauseBtn.textContent = paused ? "Resume" : "Pause";
      pauseBtn.style.background = paused ? "#78350f" : "#1e293b";
      log(paused ? "Paused — progress saved" : "Resumed");
    };
  }

  const stopBtn = $("fnh-v38-stop");
  if (stopBtn) {
    stopBtn.onclick = () => {
      stopped = true;
      log("Stopping after this lesson…", "#f59e0b");
    };
  }
})();
