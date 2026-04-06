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
    lessons: [
      "Learning Materials", 
      "About Your Instructor", 
      "Overview of the Approach", 
      "Performance Iceberg",
      "Neurophysiology 101",
      "3 Stages of Stress",
      "Threat Neurophysiology",
      "Autonomic Nervous System Overview"
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
      "Lecture: Intention Based Muscle Testing"
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
      "Biceps and Triceps"
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
      "Phrenic Nerve Demonstration"
    ]
  },
  {
    category: "Lymphatic System Assessment and Correction",
    lessons: [
      "Lecture: Lymphatic System",
      "Lymphatic Cranial Reflex Zone",
      "Lymphatic Release Positions",
      "Lymphatic System Full Procedure"
    ]
  },
  {
    category: "Vagus Nerve",
    lessons: [
      "Vagus Nerve Masterclass",
      "Lecture: Vagus Nerve Procedure",
      "Demonstration: Vagus Nerve Screen"
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
      "Demo: Mechanoreceptor (Conscious)"
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
      "ATNR"
    ]
  },
  {
    category: "Postural Reflexes",
    lessons: ["Occular & Labrythine Righting Reflexes Assessment"]
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
      "Cranial Nerve IX (Glossopharyngeal)"
    ]
  },
  {
    category: "Emotional Corrections",
    lessons: [
      "Lecture: Emotional Corrections",
      "In class Lecture and Demo: Emotions",
      "Demo: Emotional Correction"
    ]
  },
  {
    category: "Finishing Procedures and Home Reinforcement",
    lessons: [
      "Lecture: Gaits Integration",
      "Gaits Integration Procedure",
      "In class Lecture: Gaits",
      "Things to Check during the session and for Home Reinforcement"
    ]
  },
  {
    category: "Background Information",
    lessons: [
      "Lecture: How the Brain Maps Movement",
      "Chronic Pain and the Brain"
    ]
  },
  {
    category: "Masterclasses",
    lessons: [
      "Vertigo Masterclass - 21/Nov/2023",
      "Personal Mindset Mastery Masterclass (Jan 3rd, 2024)",
      "Neuro Mastery Masterclass: Muscle Testing Nuance and Back Pain Demo",
      "Tendon Guard Reflex Masterclass"
    ]
  },
  {
    category: "Functional Anatomy and Biomechanics",
    lessons: [
      "Functional Anatomy Basics of the Saggital Plane",
      "Functional Anatomy Basics of the Frontal Plane",
      "Functional Anatomy basics of the Transverse Plane"
    ]
  },
  {
    category: "Putting it all Together",
    lessons: [
      "Lower Back Pain (In Class Demo)",
      "Q and A - 5/8/2025 (STNR test, Navigating Challenging Muscle Tests)"
    ]
  },
  {
    category: "FNH Foundations Exam",
    lessons: ["FNH Foundations Theory Exam"]
  }
];

function simulateLessonDiscovery(baseUrl: string, userId: string, jobId: string) {
  // Normalize the URL: Remove query parameters (like ?page=1) and trailing slashes
  const normalizedBase = baseUrl.split('?')[0].replace(/\/$/, '');
  
  // If the URL contains /categories, we want the product root
  const courseBaseUrl = normalizedBase.includes('/categories') 
    ? normalizedBase.split('/categories')[0] 
    : normalizedBase;

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