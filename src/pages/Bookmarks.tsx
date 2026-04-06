"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  {
    title: "Kinesiology App",
    url: "https://kinesiology-app.vercel.app/",
    description: "Access the Kinesiology application.",
    icon: Activity,
    color: "text-rose-600",
    bg: "bg-rose-50"
  },
  {
    title: "Local Library",
    url: "http://localhost:32110/library",
    description: "Access your local FNH library server.",
    icon: Library,
    color: "text-blue-600",
    bg: "bg-blue-50"
  },
  {
    title: "FNH Foundations Home",
    url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations?page=1",
    description: "Main course dashboard on Kajabi.",
    icon: GraduationCap,
    color: "text-indigo-600",
    bg: "bg-indigo-50"
  },
  {
    title: "Specific Lesson Page",
    url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099722/posts/2164655462",
    description: "Direct link to a specific course lesson.",
    icon: Globe,
    color: "text-emerald-600",
    bg: "bg-emerald-50"
  },
  {
    title: "Wistia Media JSON",
    url: "https://fast.wistia.com/embed/medias/ynribqn4x1.json",
    description: "Raw Wistia metadata for video extraction.",
    icon: FileJson,
    color: "text-amber-600",
    bg: "bg-amber-50"
  },
  {
    title: "Gemini AI Assistant",
    url: "https://gemini.google.com/app/298621e0b01137f0",
    description: "Your custom Gemini workspace for FNH tasks.",
    icon: Sparkles,
    color: "text-purple-600",
    bg: "bg-purple-50"
  }
];

const Bookmarks = () => {
  const navigate = useNavigate();

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
            <Bookmark className="w-6 h-6 mr-2 text-indigo-600" />
            Quick Bookmarks
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookmarks.map((bookmark, index) => (
            <a 
              key={index} 
              href={bookmark.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group"
            >
              <Card className="border-indigo-100 hover:border-indigo-300 hover:shadow-md transition-all rounded-2xl bg-white overflow-hidden">
                <CardContent className="p-6 flex items-start space-x-4">
                  <div className={`${bookmark.bg} p-3 rounded-xl shrink-0`}>
                    <bookmark.icon className={`w-6 h-6 ${bookmark.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-indigo-900 truncate">{bookmark.title}</h3>
                      <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{bookmark.description}</p>
                    <p className="text-[10px] text-indigo-300 font-mono mt-2 truncate">{bookmark.url}</p>
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </main>

      <footer className="mt-12">
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default Bookmarks;