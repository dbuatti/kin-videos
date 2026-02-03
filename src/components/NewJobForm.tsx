"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCreateCrawlerJob } from '@/hooks/use-crawler-jobs';
import { Zap } from 'lucide-react';

const formSchema = z.object({
  targetUrl: z.string().url({ message: "Please enter a valid URL." }),
});

const NewJobForm: React.FC = () => {
  const { mutate: createJob, isPending } = useCreateCrawlerJob();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      targetUrl: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createJob(values.targetUrl);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-6 bg-white rounded-2xl shadow-lg border border-indigo-100">
        <h3 className="text-xl font-bold text-indigo-700">Start New Crawl Job</h3>
        <FormField
          control={form.control}
          name="targetUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-600">Kajabi Course URL</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., https://fnh.kajabi.com/products/foundations" 
                  {...field} 
                  className="rounded-xl h-12 border-indigo-300 focus:border-indigo-500"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          disabled={isPending} 
          className="w-full rounded-xl h-12 bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md"
        >
          <Zap className="w-5 h-5 mr-2" />
          {isPending ? "Starting Job..." : "Start Crawl"}
        </Button>
      </form>
    </Form>
  );
};

export default NewJobForm;