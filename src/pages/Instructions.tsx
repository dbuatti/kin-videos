"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  FileVideo,
  FolderDown,
  Rocket
} from 'lucide-react';
import { MadeWithDyad } from '@/components/made-with-dyad';

const Instructions = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-6 sm:p-12 max-w-4xl mx-auto w-full">
      <header className="flex items-center space-x-4 mb-12">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-full hover:bg-white/5 text-slate-400">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">User Manual</h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Getting Started</p>
        </div>
      </header>

      <main className="space-y-12">
        <section className="space-y-6">
          <div className="flex items-center space-x-2 text-primary">
            <Rocket className="w-5 h-5" />
            <h2 className="text-sm font-black uppercase tracking-widest">Instant Archiving</h2>
          </div>
          <p className="text-slate-400 leading-relaxed">
            FNH Archiver uses <strong>Verified Maps</strong>. Since we have already mapped the Foundations course, you no longer need to wait for discovery or extraction.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-[2rem]">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-primary flex items-center">
                  <Zap className="w-4 h-4 mr-2" /> One-Click Archive
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-500">
                Simply click the archive button. The system instantly populates your dashboard with the full course structure.
              </CardContent>
            </Card>
            <Card className="border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-[2rem]">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-primary flex items-center">
                  <FileVideo className="w-4 h-4 mr-2" /> Verified Links
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-500">
                Every video link is pre-verified and extracted from the source, ensuring 100% reliability.
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-8">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">How to Use</h2>
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-white/5">
            {[
              { step: 1, title: 'Click "Archive Course Now"', desc: 'On the dashboard, find the Foundations Course card and click the archive button.' },
              { step: 2, title: 'Instant Population', desc: 'The course will appear in your "Recent Jobs" table immediately as "Completed".' },
              { step: 3, title: 'Download Content', desc: 'Click "View" to see the organized modules. Download individual videos or use "Download All".' }
            ].map((item) => (
              <div key={item.step} className="relative flex items-start space-x-8">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-white font-black shadow-lg shrink-0 z-10">
                  {item.step}
                </div>
                <div className="pt-1">
                  <h3 className="font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Card className="border-none bg-primary/10 rounded-[2.5rem] p-8 sm:p-12 text-white">
          <h2 className="text-xl font-black mb-8 flex items-center">
            <CheckCircle2 className="w-6 h-6 mr-3 text-primary" />
            Pro Tips
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex space-x-4">
              <div className="bg-primary/20 p-3 rounded-2xl h-fit shrink-0 border border-primary/20">
                <FileVideo className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-bold mb-1">Automatic Naming</h4>
                <p className="text-sm text-slate-400">Files are named with module and lesson index (e.g., "1.2 - Intro.mp4") for perfect sorting.</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <div className="bg-primary/20 p-3 rounded-2xl h-fit shrink-0 border border-primary/20">
                <FolderDown className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-bold mb-1">Bulk Downloads</h4>
                <p className="text-sm text-slate-400">"Download All" triggers files sequentially. Keep the tab open until all downloads start.</p>
              </div>
            </div>
          </div>
        </Card>

        <section className="p-8 border-2 border-dashed border-white/5 rounded-[2rem] bg-white/5">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Troubleshooting
          </h2>
          <ul className="space-y-4 text-sm text-slate-500">
            <li className="flex items-start">
              <span className="font-black text-primary mr-3">•</span>
              <span><strong>Download didn't start:</strong> Check your browser's "Multiple Downloads" permission.</span>
            </li>
            <li className="flex items-start">
              <span className="font-black text-primary mr-3">•</span>
              <span><strong>Missing Video:</strong> Some lessons (like quizzes) do not have videos and will be marked as "Failed".</span>
            </li>
          </ul>
        </section>
      </main>

      <footer className="mt-24 opacity-30">
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default Instructions;