import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    category: "Weekly Q & A",
    lessons: [
      "Weekly Q & A",
    ]
  },
  {
    category: "Course Introduction & Foundational Knowledge",
    lessons: [
      "Learning Materials",
      "About Your Instructor",
      "Overview of the Approach",
      "Performance Iceberg",
      "Neurophysiology 101",
      "3 Stages of Stress",
      "Threat Neurophysiology",
      "Autonomic Nervous System Overview",
    ]
  },
  {
    category: "Clinical Assessments",
    lessons: [
      "BOLT Test",
      "Breathing Assessment Quiz",
      "Lecture: Muscle Testing Fundamentals",
      "Muscle Testing Quiz",
      "Demo: Indicator Muscle Fundamentals",
      "Lecture: Therapy Localisation",
      "Lecture: Intention Based Muscle Testing",
    ]
  },
  {
    category: "Direct Muscle Tests",
    lessons: [
      "Muscle Tests: Intrinsic Stabilisation System",
      "Muscle Tests: Transverse Abdominals",
      "Demo: TVA Muscle Test",
      "Diaphragm",
      "Pelvic Floor Muscle Tests",
      "Multifidi",
      "Sacrospinalis",
      "Demo: Quadriceps Group",
      "Deltoids, Mid & Lower Traps, Pecs and Serratus Anterior",
      "Biceps and Triceps",
    ]
  },
  {
    category: "Beginning Procedures - Sympathetic Down Regulation",
    lessons: [
      "Lecture: Beginning Procedure (Sympathetic Down Regulation)",
      "Harmonic Rocking",
      "Lecture: T1 - Sympathetic Chain",
      "T1 - Sympathetic Chain Demonstration",
      "Lecture: Phrenic Nerve",
      "In Class Demo: Phrenic Nerve",
      "Phrenic Nerve Demonstration",
    ]
  },
  {
    category: "Lymphatic System Assessment and Correction",
    lessons: [
      "Lecture: Lymphatic System",
      "Lymphatic Cranial Reflex Zone",
      "Lymphatic Release Positions",
      "Lymphatic System Full Procedure",
    ]
  },
  {
    category: "Vagus Nerve",
    lessons: [
      "Vagus Nerve Masterclass",
      "Lecture: Vagus Nerve Procedure",
      "Demonstration: Vagus Nerve Screen",
    ]
  },
  {
    category: "Pathway Assessments and Corrections",
    lessons: [
      "Lecture: Pathway Assessment Process Overview",
      "Lecture: Nociceptive Threat Assessment",
      "Nociceptive Threat Assessment Demonstration",
      "Nociceptive Demo Review",
      "Lecture: Efferent Pathway Correction",
      "Lecture: Cortical Brain Zones",
      "Lecture: Sub-Corticol Brain Zones",
      "Locating the Brain Reflex Areas",
      "Lecture: Mechanoreceptor (Conscious)",
      "Demo: Mechanoreceptor (Conscious)",
      "Lecture: Mechanoreception (Unconscious)",
      "Masterclass: Unconscious Mechanoreception & The Cerebellar Gateway",
      "In Class Lecture: Unconscious Mechanoreception",
      "Demo: Mechanoreceptor (Unconscious)",
      "In class lecture and Demo: Nociception",
    ]
  },
  {
    category: "Primitive Reflexes",
    lessons: [
      "Background Information for the Primitive Reflexes",
      "Lecture: Primitive Reflexes Overview",
      "In Class Demo: Moro Reflex, Startle",
      "In Class Demo: Spinal Gallant Reflex",
      "ATNR Assessment Demo",
      "Tonic Labrynthine Reflex (TLR) Assessment Demo",
      "Fear Paralyis Reflex Demo",
      "Babinski Reflex Demo",
      "Moro/Startle Reflex Demo",
      "ATNR",
      "Spinal Gallant",
      "STNR",
      "TLR",
      "Rooting Reflex + Correction",
      "Palmar Reflex",
      "Palmer Reflex (Track 2) Testing & Clearing Process",
    ]
  },
  {
    category: "Postural Reflexes",
    lessons: [
      "Occular & Labrythine Righting Reflexes Assessment",
    ]
  },
  {
    category: "Cranial Nerves",
    lessons: [
      "Lecture: Cranial Nerves",
      "Cranial Nerve I (Olfactory)",
      "Cranial Nerve II (Optic Nerve)",
      "Cranial Nerve III (Oculomotor)",
      "Cranial Nerve IV (Trochlear)",
      "Cranial Nerve V (Trigeminal)",
      "Cranial Nerve VI (Abducens)",
      "Cranial Nerve VII (Facial)",
      "Cranial Nerve VIII (Vestibulo-cochlear)",
      "Cranial Nerve IX (Glossopharyngeal)",
      "Cranial Nerve X (Vagus)",
      "Cranial Nerve XI (Accessory)",
      "Cranial Nerve XII (Hypoglossal)",
      "Demo: Cranial Nerve Assessment",
      "Demo: Cranial Nerve Correction",
      "Q&A Mentoring Call - 12/14/2023 (Cranial Nerves Homework)",
    ]
  },
  {
    category: "Emotional Corrections",
    lessons: [
      "Lecture: Emotional Corrections",
      "In class Lecture and Demo: Emotions",
      "Demo: Emotional Correction",
    ]
  },
  {
    category: "Finishing Procedures and Home Reinforcement",
    lessons: [
      "Lecture: Gaits Integration",
      "Gaits Integration Procedure",
      "In class Lecture: Gaits",
      "Things to Check during the session and for Home Reinforcement",
    ]
  },
  {
    category: "Background Information",
    lessons: [
      "Lecture: How the Brain Maps Movement",
      "Chronic Pain and the Brain",
    ]
  },
  {
    category: "Masterclasses",
    lessons: [
      "Vertigo Masterclass - 21/Nov/2023",
      "Personal Mindset Mastery Masterclass (Jan 3rd, 2024)",
      "Neuro Mastery Masterclass: Muscle Testing Nuance and Back Pain Demo",
      "Tendon Guard Reflex Masterclass",
    ]
  },
  {
    category: "Functional Anatomy and Biomechanics",
    lessons: [
      "Functional Anatomy Basics of the Saggital Plane",
      "Functional Anatomy Basics of the Frontal Plane",
      "Functional Anatomy basics of the Transverse Plane",
    ]
  },
  {
    category: "Putting it all Together",
    lessons: [
      "Lower Back Pain (In Class Demo)",
      "Q and A - 5/8/2025 (STNR test, Navigating Challenging Muscle Tests)",
    ]
  },
  {
    category: "FNH Foundations Exam",
    lessons: [
      "FNH Foundations Theory Exam",
    ]
  },
];


function simulateLessonDiscovery(baseUrl: string, userId: string, jobId: string) {
  // In a real scenario, this is where the Playwright/headless browser logic would go.
  // For now, we use the hardcoded structure to simulate discovery.
  const courseBaseUrl = baseUrl.split('/categories')[0]; 
  
  const lessonsToInsert = [];

  for (const module of COURSE_STRUCTURE) {
    for (const title of module.lessons) {
      const slug = slugify(title);
      // Kajabi lesson URLs typically follow this pattern: /products/product-slug/lesson-lesson-slug
      const lessonUrl = `${courseBaseUrl}/lesson-${slug}`;
      
      lessonsToInsert.push({
        job_id: jobId,
        user_id: userId,
        lesson_url: lessonUrl,
        video_url: null, // Video URL is NULL in Pass 1
        status: 'pending', // Status is pending for Pass 2 (Extraction)
        category: module.category,
      });
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
  let target_url: string | undefined;
  let jobData: { user_id: string, target_url: string } | null = null;

  try {
    const body = await req.json();
    job_id = body.job_id;
    target_url = body.target_url;
    
    console.log("[start-crawl] Received job ID:", job_id)

    if (!job_id || !target_url) {
      return new Response(JSON.stringify({ error: 'Missing job_id or target_url' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    // 1. Fetch job details (user_id) from the database
    const { data: jobResult, error: fetchError } = await supabaseAdmin
      .from('crawler_jobs')
      .select('user_id')
      .eq('id', job_id)
      .single()

    if (fetchError || !jobResult) {
      console.error("[start-crawl] Error fetching job details:", fetchError?.message || "Job not found")
      throw new Error("Job details could not be retrieved.")
    }
    
    const { user_id } = jobResult;

    // 2. Simulate Lesson Discovery (Pass 1)
    const lessonsToInsert = simulateLessonDiscovery(target_url, user_id, job_id);
    const totalLessons = lessonsToInsert.length;
    
    console.log(`[start-crawl] Discovered ${totalLessons} lessons for job ${job_id}.`)

    // 3. Insert lessons into the 'lessons' table
    const { error: insertLessonsError } = await supabaseAdmin
      .from('lessons')
      .insert(lessonsToInsert)
      .select()

    if (insertLessonsError) {
      console.error("[start-crawl] Error inserting lessons:", insertLessonsError)
      throw new Error(insertLessonsError.message)
    }
    
    console.log(`[start-crawl] Successfully inserted ${totalLessons} lessons with status 'pending'.`)


    // 4. Update main job status to 'running' (or 'discovery_complete') and set total lessons count
    // We use 'running' to keep the polling active until the next pass is implemented.
    const { error: updateError1 } = await supabaseAdmin
      .from('crawler_jobs')
      .update({ 
        status: 'running', // Set to running to indicate Pass 2 is needed/pending
        total_lessons: totalLessons,
        lessons_processed: 0, // Reset processed count for Pass 2
        end_time: null,
        video_url: null, 
      })
      .eq('id', job_id)
      .select()

    if (updateError1) {
      console.error("[start-crawl] Error updating job status after discovery:", updateError1)
      throw new Error(updateError1.message)
    }
    console.log(`[start-crawl] Job ${job_id} status set to running with ${totalLessons} total lessons.`)
    
    return new Response(JSON.stringify({ message: 'Crawl job discovery (Pass 1) processed successfully' }), {
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
// Dyad forced redeployment: 2024-08-02-v6