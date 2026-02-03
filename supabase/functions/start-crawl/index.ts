import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WistiaAsset {
  type: string;
  width: number;
  height: number;
  size: number;
  url: string;
  display_name: string;
}

interface WistiaMedia {
  assets: WistiaAsset[];
}

interface WistiaJson {
  media: WistiaMedia;
}

/**
 * Finds the highest quality video URL from the Wistia JSON assets.
 * Prioritizes 'original' or the highest resolution MP4 asset.
 */
function findBestVideoUrl(wistiaJson: WistiaJson): string | null {
  const assets = wistiaJson.media?.assets;
  if (!assets || assets.length === 0) {
    return null;
  }

  let bestAsset: WistiaAsset | null = null;
  let maxResolution = 0;

  for (const asset of assets) {
    // Skip non-video assets like images and storyboards
    if (asset.type === 'still_image' || asset.type === 'storyboard') {
      continue;
    }

    // Prioritize 'original' if available, as it's often the highest quality source file
    if (asset.type === 'original') {
      return asset.url;
    }

    // Calculate resolution (width * height)
    const resolution = asset.width * asset.height;

    // Check if this asset is better than the current best
    if (resolution > maxResolution) {
      maxResolution = resolution;
      bestAsset = asset;
    } else if (resolution === maxResolution && bestAsset && asset.size > bestAsset.size) {
      // If resolutions are equal, prefer the larger file size (higher bitrate)
      bestAsset = asset;
    }
  }

  return bestAsset?.url || null;
}


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Initialize Supabase client with Service Role Key to bypass RLS
  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
    },
  })

  let job_id: string | undefined;
  let wistiaJson: WistiaJson | undefined;

  try {
    const body = await req.json();
    job_id = body.job_id;
    wistiaJson = body.wistia_json;
    
    console.log("[start-crawl] Received job ID:", job_id)

    if (!job_id) {
      return new Response(JSON.stringify({ error: 'Missing job_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    let videoUrl: string | null = null;
    if (wistiaJson) {
      videoUrl = findBestVideoUrl(wistiaJson);
      console.log(`[start-crawl] Extracted best video URL: ${videoUrl}`)
    } else {
      console.warn("[start-crawl] No Wistia JSON provided in request body.")
    }

    // 1. Update status to 'running', set initial lessons count, and store video URL
    const totalLessons = 18; // Placeholder for actual discovery
    
    const updateData: Record<string, any> = { 
      status: 'running', 
      total_lessons: totalLessons 
    };

    if (videoUrl) {
      updateData.video_url = videoUrl;
    }

    const { error: updateError1 } = await supabaseAdmin
      .from('crawler_jobs')
      .update(updateData)
      .eq('id', job_id)
      .select()

    if (updateError1) {
      console.error("[start-crawl] Error updating status to running:", updateError1)
      throw new Error(updateError1.message)
    }
    console.log(`[start-crawl] Job ${job_id} status set to running with ${totalLessons} total lessons.`)

    // --- SIMULATE CRAWLING PROGRESS ---
    console.log(`[start-crawl] Starting simulated archiving process for job ${job_id}.`)
    
    for (let i = 1; i <= totalLessons; i++) {
      // Simulate work delay
      await new Promise(resolve => setTimeout(resolve, 500)); 

      const { error: updateError2 } = await supabaseAdmin
        .from('crawler_jobs')
        .update({ lessons_processed: i })
        .eq('id', job_id)
        .select()

      if (updateError2) {
        console.error(`[start-crawl] Error updating progress for lesson ${i}:`, updateError2)
      }
      console.log(`[start-crawl] Job ${job_id}: Processed lesson ${i}/${totalLessons} (Simulated)`)
    }

    // 2. Update status to 'completed' and set end time
    const { error: updateError3 } = await supabaseAdmin
      .from('crawler_jobs')
      .update({ status: 'completed', end_time: new Date().toISOString() })
      .eq('id', job_id)
      .select()

    if (updateError3) {
      console.error("[start-crawl] Error updating status to completed:", updateError3)
      throw new Error(updateError3.message)
    }
    console.log(`[start-crawl] Job ${job_id} completed successfully.`)


    return new Response(JSON.stringify({ message: 'Crawl job processed successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error("[start-crawl] General error:", error.message)
    
    // Attempt to mark job as failed if job_id is known
    if (job_id) {
      const { error: failError } = await supabaseAdmin
        .from('crawler_jobs')
        .update({ status: 'failed', error_log: error.message, end_time: new Date().toISOString() })
        .eq('id', job_id)
        .select()
      
      if (failError) {
        console.error("[start-crawl] Failed to mark job as failed:", failError.message)
      }
    }

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
// Dyad forced redeployment: 2024-08-01