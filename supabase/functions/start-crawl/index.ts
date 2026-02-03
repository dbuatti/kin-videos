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

/**
 * Converts a string title into a URL-friendly slug.
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric characters (except spaces and hyphens)
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Collapse multiple hyphens
}

// Simulated lesson discovery based on the course structure described by the user
function simulateLessonDiscovery(baseUrl: string, wistiaJson: WistiaJson, userId: string, jobId: string) {
  // Assuming the base URL is the course page, and lessons are under /lesson-SLUG
  // Example: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories
  // We want: https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/lesson-SLUG
  const courseBaseUrl = baseUrl.split('/categories')[0]; 
  
  // Using a subset of the real lesson titles provided by the user
  const lessonTitles = [
    "Course Introduction & Foundational Knowledge",
    "About Your Instructor",
    "Overview of the Approach",
    "Performance Iceberg",
    "Neurophysiology 101",
    "3 Stages of Stress",
    "Threat Neurophysiology",
    "Autonomic Nervous System Overview",
    "BOLT Test",
    "Lecture: Muscle Testing Fundamentals",
    "Demo: Indicator Muscle Fundamentals",
    "Lecture: Therapy Localisation",
    "Lecture: Beginning Procedure (Sympathetic Down Regulation)",
    "Harmonic Rocking",
    "Lecture: Vagus Nerve Procedure",
    "Lecture: Pathway Assessment Process Overview",
    "Lecture: Cortical Brain Zones",
    "In Class Demo: Moro Reflex, Startle",
    "Lecture: Cranial Nerves",
    "Lecture: Emotional Corrections",
  ];

  const mainVideoUrl = findBestVideoUrl(wistiaJson);

  return lessonTitles.map((title, index) => {
    const slug = slugify(title);
    const lessonUrl = `${courseBaseUrl}/lesson-${slug}`;
    
    // Only the first lesson gets the main video URL provided in the form
    const videoUrl = index === 0 ? mainVideoUrl : null;

    return {
      job_id: jobId,
      user_id: userId,
      lesson_url: lessonUrl,
      // Simulate video URLs for subsequent lessons
      video_url: videoUrl || (index % 3 === 0 ? 'https://simulated-video-url.com/lesson-' + slug : null),
      status: 'pending',
    };
  });
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
  let jobData: { user_id: string, target_url: string } | null = null;

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
    
    // 1. Fetch job details (user_id and target_url) from the database
    const { data: jobResult, error: fetchError } = await supabaseAdmin
      .from('crawler_jobs')
      .select('user_id, target_url')
      .eq('id', job_id)
      .single()

    if (fetchError || !jobResult) {
      console.error("[start-crawl] Error fetching job details:", fetchError?.message || "Job not found")
      throw new Error("Job details could not be retrieved.")
    }
    
    jobData = jobResult;
    const { user_id, target_url } = jobData;

    // 2. Simulate Lesson Discovery
    const lessonsToInsert = simulateLessonDiscovery(target_url, wistiaJson, user_id, job_id);
    const totalLessons = lessonsToInsert.length;
    
    console.log(`[start-crawl] Discovered ${totalLessons} lessons for job ${job_id}.`)

    // 3. Insert lessons into the 'lessons' table and capture the inserted data (with IDs)
    const { data: insertedLessons, error: insertLessonsError } = await supabaseAdmin
      .from('lessons')
      .insert(lessonsToInsert)
      .select()

    if (insertLessonsError) {
      console.error("[start-crawl] Error inserting lessons:", insertLessonsError)
      throw new Error(insertLessonsError.message)
    }
    
    const lessonsForProcessing = insertedLessons || [];
    console.log(`[start-crawl] Successfully inserted ${lessonsForProcessing.length} lessons.`)


    // 4. Update main job status to 'running' and set total lessons count
    const { error: updateError1 } = await supabaseAdmin
      .from('crawler_jobs')
      .update({ 
        status: 'running', 
        total_lessons: totalLessons,
        // We clear video_url from the main job as it's now per lesson, 
        // but we keep it for the first lesson in the lessons table.
        video_url: null, 
      })
      .eq('id', job_id)
      .select()

    if (updateError1) {
      console.error("[start-crawl] Error updating initial job data:", updateError1)
      throw new Error(updateError1.message)
    }
    console.log(`[start-crawl] Job ${job_id} status set to running with ${totalLessons} total lessons.`)

    // --- SIMULATE CRAWLING PROGRESS (Processing Lessons) ---
    console.log(`[start-crawl] Starting simulated archiving process for job ${job_id}.`)
    
    let lessonsProcessed = 0;
    for (const lesson of lessonsForProcessing) { // Use the lessons with generated IDs
      // Simulate work delay
      await new Promise(resolve => setTimeout(resolve, 500)); 
      lessonsProcessed++;

      // Determine the final video URL for the lesson
      let finalVideoUrl = lesson.video_url;
      if (!finalVideoUrl) {
        // Simulate finding a video URL for lessons that didn't get the main Wistia JSON URL
        const lessonSlug = lesson.lesson_url.split('lesson-')[1];
        finalVideoUrl = 'https://simulated-video-url.com/' + lessonSlug + '.mp4';
      }

      // Simulate updating the lesson status
      const { error: updateLessonError } = await supabaseAdmin
        .from('lessons')
        .update({ status: 'completed', video_url: finalVideoUrl })
        .eq('id', lesson.id) // Now lesson.id is correctly populated
        .select()

      if (updateLessonError) {
        console.error(`[start-crawl] Error updating lesson ${lesson.id} status:`, updateLessonError)
      }
      
      // Update main job progress
      const { error: updateJobProgressError } = await supabaseAdmin
        .from('crawler_jobs')
        .update({ lessons_processed: lessonsProcessed })
        .eq('id', job_id)
        .select()

      if (updateJobProgressError) {
        console.error(`[start-crawl] Error updating job progress:`, updateJobProgressError)
      }
      console.log(`[start-crawl] Job ${job_id}: Processed lesson ${lessonsProcessed}/${totalLessons} (Simulated)`)
    }

    // 5. Update status to 'completed' and set end time
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
// Dyad forced redeployment: 2024-08-01-v6