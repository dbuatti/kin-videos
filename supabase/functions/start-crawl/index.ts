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

// Define the structure of the course content with categories and lessons
const COURSE_STRUCTURE = [
  {
    category: "Course Introduction & Foundational Knowledge",
    lessons: [
      "Course Introduction & Foundational Knowledge",
      "About Your Instructor",
      "Overview of the Approach",
      "Performance Iceberg",
      "Neurophysiology 101",
      "3 Stages of Stress",
      "Threat Neurophysiology",
      "Autonomic Nervous System Overview",
      "BOLT Test",
    ]
  },
  {
    category: "Direct Muscle Tests",
    lessons: [
      "Lecture: Muscle Testing Fundamentals",
      "Demo: Indicator Muscle Fundamentals",
      "Lecture: Therapy Localisation",
    ]
  },
  {
    category: "Beginning Procedures - Sympathetic Down Regulation",
    lessons: [
      "Lecture: Beginning Procedure (Sympathetic Down Regulation)",
      "Harmonic Rocking",
    ]
  },
  {
    category: "Vagus Nerve",
    lessons: [
      "Lecture: Vagus Nerve Procedure",
    ]
  },
  {
    category: "Pathway Assessments and Corrections",
    lessons: [
      "Lecture: Pathway Assessment Process Overview",
      "Lecture: Cortical Brain Zones",
      "In Class Demo: Moro Reflex, Startle",
    ]
  },
  {
    category: "Cranial Nerves",
    lessons: [
      "Lecture: Cranial Nerves",
    ]
  },
  {
    category: "Emotional Corrections",
    lessons: [
      "Lecture: Emotional Corrections",
    ]
  },
  // Add placeholders for other categories mentioned by the user, even if they have no lessons in this simulation
  { category: "Weekly Q & A", lessons: [] },
  { category: "Clinical Assessments", lessons: [] },
  { category: "Lymphatic System Assessment and Correction", lessons: [] },
  { category: "Primitive Reflexes", lessons: [] },
  { category: "Postural Reflexes", lessons: [] },
  { category: "Modules18", lessons: [] },
  { category: "Finishing Procedures and Home Reinforcement", lessons: [] },
  { category: "Background Information", lessons: [] },
  { category: "Masterclasses", lessons: [] },
  { category: "Functional Anatomy and Biomechanics", lessons: [] },
  { category: "Putting it all Together", lessons: [] },
  { category: "FNH Foundations Exam", lessons: [] },
];


function simulateLessonDiscovery(baseUrl: string, wistiaJson: WistiaJson, userId: string, jobId: string) {
  const courseBaseUrl = baseUrl.split('/categories')[0]; 
  const mainVideoUrl = findBestVideoUrl(wistiaJson);
  
  const lessonsToInsert = [];
  let lessonIndex = 0;

  for (const module of COURSE_STRUCTURE) {
    for (const title of module.lessons) {
      const slug = slugify(title);
      const lessonUrl = `${courseBaseUrl}/lesson-${slug}`;
      
      // Only the first lesson gets the main video URL provided in the form
      const videoUrl = lessonIndex === 0 
        ? mainVideoUrl 
        : (lessonIndex % 3 === 0 
          ? `https://simulated-video-url.com/${slug}-${lessonIndex}.mp4` 
          : null); // Simulate some lessons not having a video URL immediately

      lessonsToInsert.push({
        job_id: jobId,
        user_id: userId,
        lesson_url: lessonUrl,
        video_url: videoUrl,
        status: 'completed', // Set to completed for immediate download testing
        category: module.category, // NEW: Assign category
      });
      lessonIndex++;
    }
  }
  
  return lessonsToInsert;
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


    // 4. Update main job status to 'completed' and set total lessons count and processed count
    // Since we are simulating completion immediately, we set status to completed and processed count to total.
    const { error: updateError1 } = await supabaseAdmin
      .from('crawler_jobs')
      .update({ 
        status: 'completed', 
        total_lessons: totalLessons,
        lessons_processed: totalLessons, // Set to total for immediate completion
        video_url: null, 
        end_time: new Date().toISOString()
      })
      .eq('id', job_id)
      .select()

    if (updateError1) {
      console.error("[start-crawl] Error updating initial job data:", updateError1)
      throw new Error(updateError1.message)
    }
    console.log(`[start-crawl] Job ${job_id} status set to completed with ${totalLessons} total lessons.`)

    // --- SIMULATE CRAWLING PROGRESS (Skipped, as we set status to completed above) ---
    
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
// Dyad forced redeployment: 2024-08-02-v1