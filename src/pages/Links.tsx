"use client";

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Link2, Copy, ExternalLink, Download, Search, Film, ListFilter,
} from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { MadeWithDyad } from "@/components/made-with-dyad";
import verified from "@/data/verifiedLessons.json";

type Lesson = {
  category: string;
  title: string;
  page_url: string;
  video_url: string;
  duration: number;
  module_index: number | null;
  lesson_index: number | null;
};

const LESSONS = verified as Lesson[];

const fmt = (s: number) => {
  s = Math.round(s || 0);
  if (!s) return "—";
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return h ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}:${String(sec).padStart(2, "0")}`;
};

const copy = async (text: string, what: string) => {
  try {
    await navigator.clipboard.writeText(text);
    showSuccess(`${what} copied`);
  } catch {
    showError("Copy failed");
  }
};

const Links = () => {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [onlyVideo, setOnlyVideo] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  const modules = useMemo(() => {
    const m = new Map<string, Lesson[]>();
    for (const l of LESSONS) {
      if (!m.has(l.category)) m.set(l.category, []);
      m.get(l.category)!.push(l);
    }
    return Array.from(m.entries());
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return modules
      .map(([cat, rows]) => [
        cat,
        rows.filter(
          (l) =>
            (!onlyVideo || !!l.video_url) &&
            (!needle ||
              l.title.toLowerCase().includes(needle) ||
              cat.toLowerCase().includes(needle))
        ),
      ] as [string, Lesson[]])
      .filter(([, rows]) => rows.length > 0);
  }, [modules, q, onlyVideo]);

  const total = LESSONS.length;
  const withVideo = LESSONS.filter((l) => l.video_url).length;
  const hours = LESSONS.reduce((a, l) => a + (l.duration || 0), 0) / 3600;

  const copyAll = async () => {
    const lines = filtered
      .flatMap(([, rows]) => rows)
      .map((l) => `${l.title}\t${l.video_url || "(no video)"}\t${l.page_url}`);
    await copy(lines.join("\n"), `${lines.length} links`);
  };

  return (
    <div className="min-h-screen bg-background p-6 sm:p-12 max-w-5xl mx-auto w-full">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="rounded-full hover:bg-white/5 text-slate-400">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center">
              <Link2 className="w-6 h-6 mr-3 text-primary" />
              Links
            </h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
              Direct video links · scraped 21 Oct 2026
            </p>
          </div>
        </div>
        <Button onClick={copyAll} variant="outline" className="border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 rounded-xl h-12 px-6 font-bold">
          <Copy className="w-4 h-4 mr-2" /> Copy all visible
        </Button>
      </header>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Lessons", value: total },
          { label: "With video", value: withVideo },
          { label: "Runtime", value: `${hours.toFixed(1)} h` },
        ].map((s) => (
          <Card key={s.label} className="border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-2xl">
            <CardContent className="p-5">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{s.label}</div>
              <div className="text-2xl font-black text-white mt-1 tabular-nums">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search lesson or module…"
            className="pl-10"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Button
          variant={onlyVideo ? "default" : "outline"}
          onClick={() => setOnlyVideo((v) => !v)}
          className="rounded-xl h-10 px-5 font-bold"
        >
          <ListFilter className="w-4 h-4 mr-2" /> Video only
        </Button>
      </div>

      <div className="space-y-6">
        {filtered.map(([cat, rows]) => (
          <Card key={cat} className="border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-widest text-primary">{cat}</h2>
              <span className="text-[10px] font-black text-slate-500">{rows.length} lessons</span>
            </div>
            <div className="divide-y divide-white/5">
              {rows.map((l) => (
                <div key={l.page_url} className="px-5 py-3 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-100">{l.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        {l.video_url ? (
                          <Badge className="bg-emerald-500/15 text-emerald-300 border-none text-[9px] font-black uppercase tracking-widest">
                            <Film className="w-2.5 h-2.5 mr-1" /> {fmt(l.duration)}
                          </Badge>
                        ) : (
                          <Badge className="bg-slate-700/50 text-slate-400 border-none text-[9px] font-black uppercase tracking-widest">
                            No video
                          </Badge>
                        )}
                        <span className="text-[10px] text-slate-600 font-mono truncate">{l.page_url}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {l.video_url && (
                        <>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-white"
                            title="Copy direct video link"
                            onClick={() => copy(l.video_url, "Video link")}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-white" title="Open video">
                            <a href={l.video_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /></a>
                          </Button>
                          <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-white" title="Download">
                            <a href={l.video_url} download><Download className="h-4 w-4" /></a>
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-white"
                        title="Copy portal link"
                        onClick={() => copy(l.page_url, "Portal link")}>
                        <Link2 className="h-4 w-4" />
                      </Button>
                      <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-white" title="Open in Kajabi">
                        <a href={l.page_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /></a>
                      </Button>
                    </div>
                  </div>
                  {open === l.page_url && l.video_url && (
                    <div className="mt-3 rounded-lg bg-black/40 border border-white/5 p-3">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Direct video URL</div>
                      <code className="text-[10px] font-mono text-emerald-300/80 break-all">{l.video_url}</code>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}
        {!filtered.length && (
          <div className="text-center text-slate-500 py-12">Nothing matches that search.</div>
        )}
      </div>

      <footer className="mt-24 opacity-30">
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default Links;
