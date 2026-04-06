"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Scissors, 
  Music, 
  Video, 
  Terminal, 
  Copy, 
  Info,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { showSuccess } from '@/utils/toast';
import { MadeWithDyad } from '@/components/made-with-dyad';

const VIDEO_PATH = "/Users/danielebuatti/Library/CloudStorage/Dropbox/Wellness, Meditation and Kinesiology/FNH/Videos";

const Stitcher = () => {
  const navigate = useNavigate();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess("Command copied!");
  };

  const commands = {
    install: "brew install ffmpeg",
    cd: `cd "${VIDEO_PATH}"`,
    generateList: `find . -name "*.mp4" | sort -V | sed "s/^\\.\\//file './;s/$/'/" > join_list.txt`,
    stitchVideo: "ffmpeg -f concat -safe 0 -i join_list.txt -c copy FNH_Full_Course_Stitched.mp4",
    extractAudio: "ffmpeg -f concat -safe 0 -i join_list.txt -vn -acodec libmp3lame -q:a 2 FNH_Full_Course_Audio.mp3"
  };

  return (
    <div className="min-h-screen bg-background p-6 sm:p-12 max-w-4xl mx-auto w-full">
      <header className="flex items-center space-x-4 mb-12">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-full hover:bg-white/5 text-slate-400">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center">
            <Scissors className="w-6 h-6 mr-3 text-primary" />
            Stitcher
          </h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">FFmpeg Power Tools</p>
        </div>
      </header>

      <main className="space-y-8">
        <Card className="border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-[2rem] overflow-hidden">
          <CardHeader className="border-b border-white/5">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center">
              <Terminal className="w-5 h-5 mr-2" /> 1. Install FFmpeg
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="flex items-center justify-between bg-black/20 p-6 rounded-2xl border border-white/5">
              <code className="text-emerald-400 font-mono text-sm">{commands.install}</code>
              <Button variant="ghost" size="icon" onClick={() => copyToClipboard(commands.install)} className="text-slate-500 hover:text-white">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-[2rem] overflow-hidden">
          <CardHeader className="border-b border-white/5">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-amber-500 flex items-center">
              <Zap className="w-5 h-5 mr-2" /> 2. Prepare List
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Navigate to folder</p>
              <div className="flex items-center justify-between bg-black/20 p-4 rounded-xl border border-white/5">
                <code className="text-primary font-mono text-xs truncate mr-4">{commands.cd}</code>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(commands.cd)}><Copy className="w-4 h-4" /></Button>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Generate join_list.txt</p>
              <div className="flex items-center justify-between bg-black/20 p-4 rounded-xl border border-white/5">
                <code className="text-primary font-mono text-xs truncate mr-4">{commands.generateList}</code>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(commands.generateList)}><Copy className="w-4 h-4" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-[2rem] overflow-hidden border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle className="text-white flex items-center text-lg font-black">
                <Video className="w-5 h-5 mr-2 text-primary" />
                Stitch Video
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="bg-black/20 p-6 rounded-2xl">
                <code className="text-primary/70 font-mono text-[10px] leading-relaxed block mb-6">{commands.stitchVideo}</code>
                <Button onClick={() => copyToClipboard(commands.stitchVideo)} className="w-full bg-primary hover:bg-primary/90 rounded-xl h-12 font-bold">Copy Command</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-[2rem] overflow-hidden border-t-4 border-t-emerald-500">
            <CardHeader>
              <CardTitle className="text-white flex items-center text-lg font-black">
                <Music className="w-5 h-5 mr-2 text-emerald-500" />
                Extract Audio
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="bg-black/20 p-6 rounded-2xl">
                <code className="text-emerald-400/70 font-mono text-[10px] leading-relaxed block mb-6">{commands.extractAudio}</code>
                <Button onClick={() => copyToClipboard(commands.extractAudio)} className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-xl h-12 font-bold">Copy Command</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none bg-amber-500/10 rounded-[2.5rem] p-8 text-white">
          <div className="flex items-start space-x-6">
            <div className="bg-amber-500/20 p-3 rounded-2xl border border-amber-500/20">
              <Info className="w-6 h-6 text-amber-500" />
            </div>
            <div className="text-sm text-slate-400">
              <h4 className="font-black text-white mb-2 uppercase tracking-widest">Why use these commands?</h4>
              <p className="leading-relaxed">
                The <code className="bg-white/5 px-1.5 rounded text-amber-500">-c copy</code> flag ensures the video is stitched <strong>instantly</strong> without re-encoding. This preserves 100% of the original quality and takes seconds instead of hours.
              </p>
              <div className="mt-6 flex items-center text-[10px] font-black text-amber-500 uppercase tracking-widest">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Note: Ensure your files are numbered correctly for perfect order.
              </div>
            </div>
          </div>
        </Card>
      </main>

      <footer className="mt-24 opacity-30">
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default Stitcher;