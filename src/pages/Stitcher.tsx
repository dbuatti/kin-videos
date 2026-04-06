"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Scissors, 
  Music, 
  Video, 
  Terminal, 
  Copy, 
  Info,
  Zap,
  FileVideo,
  AlertTriangle
} from 'lucide-react';
import { showSuccess } from '@/utils/toast';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { Badge } from '@/components/ui/badge';

const VIDEO_PATH = "/Users/danielebuatti/Library/CloudStorage/Dropbox/Wellness, Meditation and Kinesiology/FNH/Videos";

const Stitcher = () => {
  const navigate = useNavigate();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showSuccess(`${label} copied to clipboard!`);
  };

  const commands = {
    install: "brew install ffmpeg",
    cd: `cd "${VIDEO_PATH}"`,
    // This command finds all mp4s, sorts them naturally, and formats them for ffmpeg
    generateList: `find . -name "*.mp4" | sort -V | sed "s/^\\.\\//file './;s/$/'/" > join_list.txt`,
    stitchVideo: "ffmpeg -f concat -safe 0 -i join_list.txt -c copy FNH_Full_Course_Stitched.mp4",
    extractAudio: "ffmpeg -f concat -safe 0 -i join_list.txt -vn -acodec libmp3lame -q:a 2 FNH_Full_Course_Audio.mp3"
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <header className="max-w-4xl mx-auto flex items-center justify-between mb-8 border-b pb-4 border-indigo-100">
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/')}
            className="rounded-full hover:bg-indigo-50 text-indigo-600"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-extrabold text-indigo-900 tracking-tight flex items-center">
            <Scissors className="w-6 h-6 mr-2 text-indigo-600" />
            Stitching Tools
          </h1>
        </div>
        <Badge variant="outline" className="bg-indigo-50 text-indigo-600 border-indigo-200">
          FFmpeg Power Tools
        </Badge>
      </header>

      <main className="max-w-4xl mx-auto space-y-6">
        {/* Prerequisites */}
        <Card className="border-indigo-100 bg-slate-900 text-white rounded-3xl overflow-hidden shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-indigo-300 text-lg">
              <Terminal className="w-5 h-5 mr-2" />
              1. Install FFmpeg
            </CardTitle>
            <CardDescription className="text-slate-400">
              You only need to do this once. Open Terminal and run:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <code className="text-emerald-400 font-mono text-sm">{commands.install}</code>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => copyToClipboard(commands.install, "Install command")}
                className="text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Prepare */}
        <Card className="border-indigo-100 shadow-lg rounded-3xl overflow-hidden bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-indigo-900 flex items-center text-lg">
              <Zap className="w-5 h-5 mr-2 text-amber-500" />
              2. Prepare the Join List
            </CardTitle>
            <CardDescription>Navigate to your folder and generate the file list in order.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-400 uppercase">Navigate to folder</p>
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                <code className="text-indigo-600 font-mono text-xs truncate mr-4">{commands.cd}</code>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(commands.cd, "CD command")}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-400 uppercase">Generate join_list.txt</p>
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                <code className="text-indigo-600 font-mono text-xs truncate mr-4">{commands.generateList}</code>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(commands.generateList, "List command")}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Execute */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-indigo-100 shadow-lg rounded-3xl overflow-hidden bg-white border-t-4 border-t-indigo-600">
            <CardHeader>
              <CardTitle className="text-indigo-900 flex items-center text-md">
                <Video className="w-5 h-5 mr-2 text-indigo-600" />
                Stitch Full Video
              </CardTitle>
              <CardDescription className="text-xs">Creates one giant MP4 file.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-900 p-4 rounded-2xl">
                <code className="text-indigo-300 font-mono text-[10px] leading-relaxed block mb-4">
                  {commands.stitchVideo}
                </code>
                <Button 
                  onClick={() => copyToClipboard(commands.stitchVideo, "Stitch command")}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Command
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-100 shadow-lg rounded-3xl overflow-hidden bg-white border-t-4 border-t-emerald-600">
            <CardHeader>
              <CardTitle className="text-emerald-900 flex items-center text-md">
                <Music className="w-5 h-5 mr-2 text-emerald-600" />
                Extract Full Audio
              </CardTitle>
              <CardDescription className="text-xs">Creates one giant MP3 file.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-900 p-4 rounded-2xl">
                <code className="text-emerald-300 font-mono text-[10px] leading-relaxed block mb-4">
                  {commands.extractAudio}
                </code>
                <Button 
                  onClick={() => copyToClipboard(commands.extractAudio, "Audio command")}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Command
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pro Tips */}
        <Card className="border-amber-100 bg-amber-50 rounded-3xl overflow-hidden">
          <CardContent className="p-6 flex items-start space-x-4">
            <div className="bg-amber-100 p-2 rounded-xl">
              <Info className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-sm text-amber-900">
              <h4 className="font-bold mb-1">Why use these commands?</h4>
              <p className="opacity-80 leading-relaxed">
                The <code className="bg-amber-200 px-1 rounded">-c copy</code> flag ensures the video is stitched <strong>instantly</strong> without re-encoding. This preserves 100% of the original quality and takes seconds instead of hours.
              </p>
              <div className="mt-4 flex items-center text-xs font-bold text-amber-700">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Note: Ensure your files are numbered correctly (e.g., 01, 02) for perfect chronological order.
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="mt-12">
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default Stitcher;