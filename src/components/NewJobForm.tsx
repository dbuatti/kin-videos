"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useCreateCrawlerJob } from '@/hooks/use-crawler-jobs';
import { Zap, Info } from 'lucide-react';

// Define the schema to only require the target URL
const formSchema = z.object({
  targetUrl: z.string().url({ message: "Please enter a valid URL." }),
});

const NewJobForm: React.FC = () => {
  const { mutate: createJob, isPending } = useCreateCrawlerJob();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      targetUrl: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // The Edge Function will now handle the discovery (Pass 1)
    createJob({
      targetUrl: values.targetUrl,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6 bg-white rounded-2xl shadow-lg border border-indigo-100">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-indigo-700">Start New Crawl Job</h3>
          <Zap className="w-5 h-5 text-indigo-400" />
        </div>
        
        <FormField
          control={form.control}
          name="targetUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-600">Kajabi Product/Course URL</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., https://.../products/foundations" 
                  {...field} 
                  className="rounded-xl h-12 border-indigo-300 focus:border-indigo-500"
                />
              </FormControl>
              <FormDescription className="flex items-center text-xs text-indigo-400 mt-2">
                <Info className="w-3 h-3 mr-1" />
                Paginated links (e.g. ?page=1) are handled automatically.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={isPending} 
          className="w-full rounded-xl h-12 bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md"
        >
          {isPending ? "Starting Discovery..." : "Start Discovery (Pass 1)"}
        </Button>
      </form>
    </Form>
  );
};

export default NewJobForm;