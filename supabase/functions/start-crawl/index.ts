// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

declare const Deno: any;

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const COURSE_STRUCTURE = [
  {
    category: "Weekly Q & A",
    lessons: ["Weekly Q & A"]
  },
  {
    category: "Course Introduction & Foundational Knowledge",
    lessons: ["Learning Materials", "About Your Instructor", "Overview of the Approach", "Performance Iceberg"]
  },
  {
    category: "Clinical Assessments",
    lessons: ["BOLT Test", "Breathing Assessment Quiz", "Lecture: Muscle Testing Fundamentals"]
  },
  {
    category: "Direct Muscle Tests",
    lessons: ["Muscle Tests: Intrinsic Stabilisation System", "Muscle Tests: Transverse Abdominals", "Demo: TVA Muscle Test"]
  }
];

function simulateLessonDiscovery(baseUrl: string, userId: string, jobId: string) {
  const courseBaseUrl = baseUrl.split('/categories')[0]; 
  const lessonsToInsert = [];

  for (const module of COURSE_STRUCTURE) {
    for (const title of module.lessons) {
      const slug = slugify(title);
      const lessonUrl = `${courseBaseUrl}/lesson-${slug}`;
      
      lessonsToInsert.push({
        job_id: jobId,
        user_id: userId,
        lesson_url: lessonUrl,
        video_url: null,
        status: 'pending',
        category: module.category,
      });
    }
  }
  return lessonsToInsert;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })

  let job_id: string | undefined;
  let target_url: string | undefined;

  try {
    const body = await req.json();
    job_id = body.job_id;
    target_url = body.target_url;

    if (!job_id || !target_url) {
      return new Response(JSON.stringify({ error: 'Missing job_id or target_url' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    const { data: jobResult } = await supabaseAdmin
      .from('crawler_jobs')
      .select('user_id')
      .eq('id', job_id)
      .single()

    if (!jobResult) throw new Error("Job not found.")
    const { user_id } = jobResult;

    // --- PASS 1: DISCOVERY ---
    const lessonsToInsert = simulateLessonDiscovery(target_url, user_id, job_id);
    const totalLessons = lessonsToInsert.length;

    const { data: insertedLessons, error: insertError } = await supabaseAdmin
      .from('lessons')
      .insert(lessonsToInsert)
      .select()

    if (insertError) throw new Error(insertError.message)

    await supabaseAdmin
      .from('crawler_jobs')
      .update({ status: 'running', total_lessons: totalLessons, lessons_processed: 0 })
      .eq('id', job_id)

    // --- PASS 2: EXTRACTION (Simulated Background Process) ---
    (async () => {
      console.log(`[Pass 2] Starting extraction for ${totalLessons} lessons...`);
      
      for (let i = 0; i < insertedLessons.length; i++) {
        const lesson = insertedLessons[i];
        
        await supabaseAdmin.from('lessons').update({ status: 'processing' }).eq('id', lesson.id);
        await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
        
        const dummyVideoUrl = `https://fnh-storage.s3.amazonaws.com/videos/${slugify(lesson.lesson_url.split('/').pop() || 'video')}.mp4`;
        await supabaseAdmin.from('lessons').update({ 
          status: 'completed', 
          video_url: dummyVideoUrl 
        }).eq('id', lesson.id);
        
        await supabaseAdmin.from('crawler_jobs').update({ 
          lessons_processed: i + 1 
        }).eq('id', job_id);
      }

      await supabaseAdmin.from('crawler_jobs').update({ 
        status: 'completed', 
        end_time: new Date().toISOString() 
      }).eq('id', job_id);
      
      console.log(`[Pass 2] Job ${job_id} fully completed.`);
    })();

    return new Response(JSON.stringify({ message: 'Discovery complete. Extraction started in background.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    if (job_id) {
      await supabaseAdmin.from('crawler_jobs').update({ status: 'failed', error_log: error.message }).eq('id', job_id)
    }
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})