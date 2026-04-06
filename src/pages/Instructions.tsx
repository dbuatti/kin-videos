"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Zap, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  FileVideo,
  FolderDown,
  Rocket
} from 'lucide-react';
import { MadeWithDyad } from '@/components/made-with-dyad';

const Instructions = () => {
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
          <h1 className="text-2xl font-extrabold text-indigo-900 tracking-tight">
            User Manual
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto space-y-8">
        {/* Overview Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-indigo-800 flex items-center">
            <Rocket className="w-5 h-5 mr-2" />
            Instant Archiving
          </h2>
          <p className="text-gray-600 leading-relaxed">
            FNH Archiver has been upgraded to use <strong>Verified Maps</strong>. Since we have already mapped the Foundations course, you no longer need to wait for discovery or extraction.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-indigo-100 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-indigo-600 flex items-center">
                  <Zap className="w-4 h-4 mr-2" /> One-Click Archive
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-500">
                Simply click the archive button. The system instantly populates your dashboard with the full course structure and video links.
              </CardContent>
            </Card>
            <Card className="border-indigo-100 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-indigo-600 flex items-center">
                  <FileVideo className="w-4 h-4 mr-2" /> Verified Links
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-500">
                Every video link is pre-verified and extracted from the source, ensuring 100% reliability for your downloads.
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Step-by-Step Guide */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-indigo-800">How to Use</h2>
          
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-indigo-200 before:to-transparent">
            
            {/* Step 1 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-indigo-600 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                1
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-indigo-100 bg-white shadow-sm">
                <h3 className="font-bold text-indigo-900 mb-1">Click "Archive Course Now"</h3>
                <p className="text-sm text-gray-600">On the dashboard, find the Foundations Course card and click the archive button.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-indigo-600 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                2
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-indigo-100 bg-white shadow-sm">
                <h3 className="font-bold text-indigo-900 mb-1">Instant Population</h3>
                <p className="text-sm text-gray-600">The course will appear in your "Recent Jobs" table immediately as "Completed".</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-indigo-600 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                3
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-indigo-100 bg-white shadow-sm">
                <h3 className="font-bold text-indigo-900 mb-1">Download Content</h3>
                <p className="text-sm text-gray-600">Click "View" to see the organized modules. Download individual videos or use "Download All" for a whole module.</p>
              </div>
            </div>

          </div>
        </section>

        {/* Pro Tips Section */}
        <section className="bg-indigo-900 rounded-3xl p-8 text-white shadow-xl">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <CheckCircle2 className="w-6 h-6 mr-2 text-indigo-400" />
            Pro Tips for Best Results
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex space-x-4">
              <div className="bg-indigo-800 p-2 rounded-lg h-fit">
                <FileVideo className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <h4 className="font-bold mb-1">Automatic Naming</h4>
                <p className="text-sm text-indigo-200">Files are automatically named with their module and lesson index (e.g., "1.2 - Intro - Welcome.mp4") for perfect sorting.</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <div className="bg-indigo-800 p-2 rounded-lg h-fit">
                <FolderDown className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <h4 className="font-bold mb-1">Bulk Downloads</h4>
                <p className="text-sm text-indigo-200">"Download All" triggers files sequentially. Keep the tab open until all downloads have started to avoid browser blocks.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Troubleshooting */}
        <section className="p-6 border-2 border-dashed border-indigo-200 rounded-2xl bg-white">
          <h2 className="text-lg font-bold text-indigo-800 mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Troubleshooting
          </h2>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="font-bold text-indigo-600 mr-2">•</span>
              <span><strong>Download didn't start:</strong> Check your browser's "Multiple Downloads" permission in the address bar.</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-indigo-600 mr-2">•</span>
              <span><strong>Missing Video:</strong> Some lessons (like quizzes or text-only materials) do not have videos and will be marked as "Failed" or "No Video".</span>
            </li>
          </ul>
        </section>
      </main>

      <div className="mt-12">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Instructions;