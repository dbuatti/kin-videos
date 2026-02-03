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
        "is_enhanced": false,
        "type": "original",
        "slug": "original",
        "display_name": "Original File",
        "width": 1920,
        "height": 1080,
        "size": 219018552,
        "bitrate": 8619,
        "url": "https://embed-ssl.wistia.com/deliveries/aa3ea31f8e14f0fe07d2f83d7b72775e.bin",
        "created_at": 1674018301
      },
      {
        "is_enhanced": false,
        "type": "iphone_video",
        "slug": "mp4_h264_660k",
        "display_name": "360p",
        "width": 640,
        "height": 360,
        "size": 16782580,
        "bitrate": 660,
        "url": "https://embed-ssl.wistia.com/deliveries/68ee76bf8496c518bb8582c98bf4a0003242743f.bin",
        "created_at": 1674018323
      },
      {
        "is_enhanced": false,
        "type": "hd_mp4_video",
        "slug": "mp4_h264_2911k",
        "display_name": "1080p",
        "width": 1920,
        "height": 1080,
        "size": 73968216,
        "bitrate": 2911,
        "url": "https://embed-ssl.wistia.com/deliveries/09992becc69fc18767252d9048037fb58b3e59de.bin",
        "created_at": 1674018323
      },
      {
        "is_enhanced": false,
        "type": "still_image",
        "slug": "still_image_1920x1080",
        "display_name": "Thumbnail Image",
        "width": 1920,
        "height": 1080,
        "url": "https://embed-ssl.wistia.com/deliveries/12d2ebc7d0fd8f6d3caeffeb06b46e1ea8642546.bin",
        "created_at": 1674018323
      }
    ],
    "duration": 198.506,
    "mediaType": "Video",
    "name": "file-uploads/sites/2147587442/video/8efb330-75e-a43d-33aa-ad3b7af5dc4_Moro_Startle.MOV",
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