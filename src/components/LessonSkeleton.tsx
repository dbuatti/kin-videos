"use client";

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader } from '@/components/ui/card';

const LessonSkeleton = () => {
  return (
    <div className="space-y-10 sm:space-y-12 w-full">
      {[1, 2].map((section) => (
        <div key={section} className="space-y-6">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-1 rounded-full" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden border-white/5 bg-slate-900/40 rounded-2xl">
                <Skeleton className="aspect-video w-full" />
                <CardHeader className="p-4 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LessonSkeleton;