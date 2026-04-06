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

const SCRAPER_SCRIPT = `// FNH Extraction Script v2.0
async function getFullSyllabusWithVideos() {
    console.log("🚀 Starting Master Extraction...");
    // ... script logic
}`;

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
              <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 text-[10px]">v2.0</Badge>
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