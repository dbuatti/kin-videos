"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Code2, 
  Copy, 
  Terminal, 
  Zap, 
  Info,
  ExternalLink,
  FileCode
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { showSuccess } from '@/utils/toast';
import { MadeWithDyad } from '@/components/made-with-dyad';

const SCRAPER_SCRIPT = `async function getFullSyllabusWithVideos() {
    console.log("🚀 Starting Master Extraction...");

    const fetchAndParse = async (url) => {
        const response = await fetch(url);
        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const results = [];
        const allElements = Array.from(doc.querySelectorAll('h4, h5, .syllabus__category-title, .syllabus__title, a'));
        
        let currentModule = "General / Intro";
        let moduleData = { module: currentModule, lessons: [] };

        allElements.forEach(el => {
            const text = el.innerText.trim();
            if (!text) return;
            if (el.tagName === 'H4' || el.tagName === 'H5' || el.classList.contains('syllabus__category-title')) {
                if (moduleData.lessons.length > 0) results.push(moduleData);
                moduleData = { module: text, lessons: [] };
            } 
            else if (el.tagName === 'A' && (el.href.includes('/posts/') || el.href.includes('/lessons/'))) {
                const title = el.querySelector('.syllabus__title')?.innerText.trim() || text;
                if (!moduleData.lessons.some(l => l.url === el.href)) {
                    moduleData.lessons.push({ title, url: el.href });
                }
            }
        });
        if (moduleData.lessons.length > 0) results.push(moduleData);
        return results;
    };

    // 1. Get the page structure
    const baseUrl = window.location.origin + window.location.pathname;
    const p1 = await fetchAndParse(baseUrl + '?page=1');
    const p2 = await fetchAndParse(baseUrl + '?page=2');

    const syllabus = [...p1, ...p2].reduce((acc, current) => {
        const existing = acc.find(item => item.module === current.module);
        if (existing) {
            current.lessons.forEach(l => {
                if (!existing.lessons.some(el => el.url === l.url)) existing.lessons.push(l);
            });
        } else {
            acc.push(current);
        }
        return acc;
    }, []);

    // 2. Fetch Video IDs and Wistia Metadata
    console.log(\`📂 Found \${syllabus.length} modules. Extracting video links now...\`);

    for (let mod of syllabus) {
        console.log(\`Checking Module: \${mod.module}\`);
        for (let lesson of mod.lessons) {
            try {
                const response = await fetch(lesson.url);
                const html = await response.text();
                
                // Regex to find Wistia Hashed ID
                const wistiaMatch = html.match(/wistia_async_([a-z0-9]{10})/i) || 
                                   html.match(/https:\\/\\/fast\\.wistia\\.net\\/embed\\/iframe\\/([a-z0-9]{10})/i) ||
                                   html.match(/wistia_embed_([a-z0-9]{10})/i);
                
                if (wistiaMatch) {
                    const videoId = wistiaMatch[1];
                    const metaResponse = await fetch(\`https://fast.wistia.net/embed/medias/\${videoId}.json\`);
                    const metaData = await metaResponse.json();
                    
                    const assets = metaData.media.assets;
                    const bestVideo = assets.find(a => a.display_name === "1080p") || 
                                      assets.find(a => a.type === "original") || 
                                      assets.find(a => a.ext === "mp4");

                    lesson.videoUrl = bestVideo ? bestVideo.url.replace('.bin', '.mp4') : "No direct MP4 found";
                } else {
                    lesson.videoUrl = "No Video ID found on page";
                }
            } catch (e) {
                lesson.videoUrl = "Error fetching video data";
            }
        }
    }

    // 3. Output Formatting
    const finalReport = syllabus.map(mod => {
        const lessons = mod.lessons.map(l => \`\${l.title}\\n🔗 Page: \${l.url}\\n🎥 Video: \${l.videoUrl}\`).join('\\n\\n');
        return \`## \${mod.module}\\n\${lessons}\`;
    }).join('\\n\\n---\\n\\n');

    console.log("✅ DONE!");
    console.log(finalReport);
    window.finalVideoOutput = finalReport;
    console.log("Type 'copy(window.finalVideoOutput)' to copy everything.");
}

await getFullSyllabusWithVideos();`;

const Scraper = () => {
  const navigate = useNavigate();

  const handleCopy = () => {
    navigator.clipboard.writeText(SCRAPER_SCRIPT);
    showSuccess("Scraper script copied to clipboard!");
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
            <Terminal className="w-6 h-6 mr-2 text-indigo-600" />
            Master Scraper Tool
          </h1>
        </div>
        <Button 
          onClick={handleCopy}
          className="bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-100"
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy Script
        </Button>
      </header>

      <main className="max-w-4xl mx-auto space-y-6">
        <Card className="border-indigo-100 bg-indigo-900 text-white rounded-3xl overflow-hidden shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-indigo-200">
              <Info className="w-5 h-5 mr-2" />
              How to use this script
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-indigo-100 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-indigo-800/50 p-4 rounded-2xl border border-indigo-700">
                <span className="font-bold text-white block mb-1">Step 1</span>
                Open the FNH Foundations course page in your browser.
              </div>
              <div className="bg-indigo-800/50 p-4 rounded-2xl border border-indigo-700">
                <span className="font-bold text-white block mb-1">Step 2</span>
                Press <kbd className="bg-indigo-950 px-1.5 py-0.5 rounded text-[10px]">F12</kbd> or <kbd className="bg-indigo-950 px-1.5 py-0.5 rounded text-[10px]">Cmd+Opt+I</kbd> to open Console.
              </div>
              <div className="bg-indigo-800/50 p-4 rounded-2xl border border-indigo-700">
                <span className="font-bold text-white block mb-1">Step 3</span>
                Paste the script and press Enter. Wait for the "DONE!" message.
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-indigo-100 shadow-lg rounded-3xl overflow-hidden bg-white">
          <CardHeader className="border-b border-indigo-50 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-indigo-900 flex items-center">
                  <FileCode className="w-5 h-5 mr-2 text-indigo-600" />
                  Extraction Script
                </CardTitle>
                <CardDescription>Master extraction logic for Kajabi & Wistia</CardDescription>
              </div>
              <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50">
                v2.0 - Verified
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px] w-full bg-slate-950">
              <pre className="p-6 text-indigo-300 font-mono text-[11px] leading-relaxed">
                {SCRAPER_SCRIPT}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center p-6 border-2 border-dashed border-indigo-100 rounded-3xl bg-white">
          <div className="text-center">
            <Zap className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 font-medium">
              This script extracts direct MP4 links from Wistia metadata automatically.
            </p>
          </div>
        </div>
      </main>

      <footer className="mt-12">
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default Scraper;