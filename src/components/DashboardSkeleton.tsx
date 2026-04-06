"use client";

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

const DashboardSkeleton = () => {
  return (
    <div className="space-y-8 sm:space-y-12 w-full">
      <div className="space-y-4 text-center sm:text-left">
        <Skeleton className="h-4 w-32 mx-auto sm:mx-0" />
        <Skeleton className="h-16 sm:h-24 w-full max-w-xl mx-auto sm:mx-0" />
        <Skeleton className="h-6 w-full max-w-md mx-auto sm:mx-0" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none rounded-[2rem] sm:rounded-[2.5rem] bg-slate-900/40 overflow-hidden">
            <CardContent className="p-6 sm:p-10 space-y-8">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-12 w-24" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-none rounded-2xl sm:rounded-[2rem] bg-slate-900/40">
                <CardContent className="p-6 flex flex-row sm:flex-col items-center space-x-4 sm:space-x-0 sm:space-y-4">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <Skeleton className="h-5 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6 sm:space-y-8">
          <Card className="border-none rounded-[2rem] sm:rounded-[2.5rem] bg-slate-900/40">
            <CardContent className="p-6 sm:p-8 space-y-8">
              <Skeleton className="h-6 w-32" />
              <div className="flex justify-between">
                <Skeleton className="h-10 w-16" />
                <Skeleton className="h-10 w-16" />
              </div>
              <Skeleton className="h-2 w-full" />
            </CardContent>
          </Card>
          <Card className="border-none rounded-[2rem] sm:rounded-[2.5rem] bg-slate-900/40">
            <CardContent className="p-8 space-y-6">
              <Skeleton className="h-4 w-32" />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                  <Skeleton className="h-1 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;