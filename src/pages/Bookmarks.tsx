"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Bookmark, 
  ExternalLink, 
  Library, 
  GraduationCap, 
  FileJson, 
  Sparkles,
  Globe,
  Activity
} from 'lucide-react';
import { MadeWithDyad } from '@/components/made-with-dyad';

const bookmarks = [
  { title: "Kinesiology App", url: "https://kinesiology-app.vercel.app/", description: "Access the Kinesiology application.", icon: Activity, color: "text-rose-400", bg: "bg-rose-400/10" },
  { title: "Local Library", url: "http://localhost:32110/library", description: "Access your local FNH library server.", icon: Library, color: "text-blue-400", bg: "bg-blue-400/10" },
  { title: "FNH Foundations Home", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations?page=1", description: "Main course dashboard on Kajabi.", icon: GraduationCap, color: "text-indigo-400", bg: "bg-indigo-400/10" },
  { title: "Specific Lesson Page", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099722/posts/2164655462", description: "Direct link to a specific course lesson.", icon: Globe, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  { title: "Wistia Media JSON", url: "https://fast.wistia.com/embed/medias/ynribqn4x1.json", description: "Raw Wistia metadata for video extraction.", icon: FileJson, color: "text-amber-400", bg: "bg-amber-400/10" },
  { title: "Gemini AI Assistant", url: "https://gemini.google.com/app/298621e0b01137f0", description: "Your custom Gemini workspace for FNH tasks.", icon: Sparkles, color: "text-purple-400", bg: "bg-purple-400/10" }
];

const Bookmarks = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-6 sm:p-12 max-w-4xl mx-auto w-full">
      <header className="flex items-center space-x-4 mb-12">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-full hover:bg-white/5 text-slate-400">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center">
            <Bookmark className="w-6 h-6 mr-3 text-primary" />
            Bookmarks
          </h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Quick Access</p>
        </div>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bookmarks.map((bookmark, index) => (
          <a key={index} href={bookmark.url} target="_blank" rel="noopener noreferrer" className="group">
            <Card className="border-white/5 bg-slate-900/40 backdrop-blur-xl hover:bg-slate-900/60 transition-all rounded-[2rem] overflow-hidden h-full">
              <CardContent className="p-8 flex flex-col space-y-4">
                <div className={`${bookmark.bg} w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-white/5`}>
                  <bookmark.icon className={`w-6 h-6 ${bookmark.color}`} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white group-hover:text-primary transition-colors">{bookmark.title}</h3>
                    <ExternalLink className="w-4 h-4 text-slate-700 group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2">{bookmark.description}</p>
                  <p className="text-[10px] text-slate-700 font-mono truncate pt-2">{bookmark.url}</p>
                </div>
              </CardContent>
            </Card>
          </a>
        ))}
      </main>

      <footer className="mt-24 opacity-30">
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default Bookmarks;