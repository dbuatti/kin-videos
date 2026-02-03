"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCreateCrawlerJob } from '@/hooks/use-crawler-jobs';
import { Zap, FileJson } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { showError } from '@/utils/toast';

// Sample JSON provided by the user for easy testing
const SAMPLE_WISTIA_JSON = JSON.stringify({
  "media": {
    "accountId": 98633,
    "assets": [
      {
        "type": "original",
        "display_name": "Original File",
        "width": 1152,
        "height": 720,
        "url": "https://embed-ssl.wistia.com/deliveries/140c1d17f4eb8afbc7ea1e29fedcb7e7.bin",
      },
      {
        "type": "hd_mp4_video",
        "display_name": "540p",
        "width": 960,
        "height": 600,
        "url": "https://embed-ssl.wistia.com/deliveries/0b631b4fbb073c88b18c1c98a928aea853df1abf.bin",
      }
    ],
    "mediaType": "Video",
    "name": "Phrenic_Nerve_Lecture.mp4",
  },
  "options": {}
}, null, 2);


const formSchema = z.object({
  targetUrl: z.string().url({ message: "Please enter a valid URL." }),
  wistiaJson: z.string().min(1, { message: "Wistia JSON is required." }),
});

const NewJobForm: React.FC = () => {
  const { mutate: createJob, isPending } = useCreateCrawlerJob();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      targetUrl: "https://fnh.kajabi.com/products/foundations/lesson-example",
      wistiaJson: SAMPLE_WISTIA_JSON,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    let parsedJson: any;
    try {
      parsedJson = JSON.parse(values.wistiaJson);
    } catch (e) {
      showError("Invalid JSON format. Please check your Wistia JSON input.");
      return;
    }

    createJob({
      targetUrl: values.targetUrl,
      wistiaJson: parsedJson,
    });
    // Note: We don't reset the form immediately so the user can easily submit another job with similar data.
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6 bg-white rounded-2xl shadow-lg border border-indigo-100">
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

        <FormField
          control={form.control}
          name="wistiaJson"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-600 flex items-center">
                <FileJson className="w-4 h-4 mr-1" />
                Wistia Video JSON Payload
              </FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Paste Wistia JSON here..." 
                  rows={10}
                  {...field} 
                  className="rounded-xl border-indigo-300 focus:border-indigo-500 font-mono text-xs"
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