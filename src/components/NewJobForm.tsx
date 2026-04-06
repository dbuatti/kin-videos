"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { useCreateCrawlerJob } from '@/hooks/use-crawler-jobs';
import { Zap, BookOpen, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const NewJobForm: React.FC = () => {
  const { mutate: createJob, isPending } = useCreateCrawlerJob();

  const handleArchive = () => {
    createJob({
      targetUrl: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations",
    });
  };

  return (
    <Card className="overflow-hidden border-indigo-100 shadow-xl rounded-2xl bg-white">
      <CardHeader className="bg-indigo-600 text-white p-6">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-xl font-bold flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            Foundations Course
          </CardTitle>
          <Zap className="w-5 h-5 text-indigo-300 animate-pulse" />
        </div>
        <CardDescription className="text-indigo-100">
          Functional Neuro Approach: Foundations
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start space-x-3 text-sm text-gray-600">
          <ShieldCheck className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
          <p>Verified map available. Archiving will be <strong>instant</strong> with all video links pre-extracted.</p>
        </div>
        
        <Button 
          onClick={handleArchive}
          disabled={isPending} 
          className="w-full rounded-xl h-12 bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md font-bold"
        >
          {isPending ? "Archiving..." : "Archive Course Now"}
        </Button>
        
        <p className="text-[10px] text-center text-gray-400 uppercase tracking-widest font-semibold">
          Instant Extraction Enabled
        </p>
      </CardContent>
    </Card>
  );
};

export default NewJobForm;