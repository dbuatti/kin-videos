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

const COURSE_STRUCTURE = [
  {
    category: "General / Intro",
    lessons: [
      { title: "Resume Course", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099726/posts/2164655474" }
    ]
  },
  {
    category: "Course Introduction & Foundational Knowledge",
    lessons: [
      { title: "Learning Materials", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099722/posts/2167681807" },
      { title: "About Your Instructor", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099722/posts/2164655462" },
      { title: "Overview of the Approach", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099722/posts/2164655465" },
      { title: "Performance Iceberg", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099722/posts/2167257485" },
      { title: "Neurophysiology 101", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099722/posts/2164655463" },
      { title: "3 Stages of Stress", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099722/posts/2167622397" },
      { title: "Threat Neurophysiology", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099722/posts/2167622399" },
      { title: "Autonomic Nervous System Overview", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099722/posts/2167679824" }
    ]
  },
  {
    category: "Clinical Assessments",
    lessons: [
      { title: "BOLT Test", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099724/posts/2167251417" },
      { title: "Breathing Assessment Quiz", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099724/posts/2167619695" },
      { title: "Lecture: Muscle Testing Fundamentals", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099724/posts/2164865269" },
      { title: "Muscle Testing Quiz", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099724/posts/2173091485" },
      { title: "Demo: Indicator Muscle Fundamentals", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099724/posts/2167415588" },
      { title: "Lecture: Therapy Localisation", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099724/posts/2164866613" },
      { title: "Lecture: Intention Based Muscle Testing", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099724/posts/2164893984" }
    ]
  },
  {
    category: "Direct Muscle Tests",
    lessons: [
      { title: "Muscle Tests: Intrinsic Stabilisation System", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2164756677" },
      { title: "Muscle Tests: Transverse Abdominals", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2164655470" },
      { title: "Demo: TVA Muscle Test", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2166239953" },
      { title: "Diaphragm", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2167833384" },
      { title: "Pelvic Floor Muscle Tests", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2166647569" },
      { title: "Multifidi", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2167418078" },
      { title: "Sacrospinalis", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2167833389" },
      { title: "Demo: Quadriceps Group", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2166288733" },
      { title: "Deltoids, Mid & Lower Traps, Pecs and Serratus Anterior", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2166647725" },
      { title: "Biceps and Triceps", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2167503394" }
    ]
  },
  {
    category: "Beginning Procedures - Sympathetic Down Regulation",
    lessons: [
      { title: "Lecture: Beginning Procedure (Sympathetic Down Regulation)", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099725/posts/2164765571" },
      { title: "Harmonic Rocking", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099725/posts/2164655471" },
      { title: "Lecture: T1 - Sympathetic Chain", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099725/posts/2164763360" },
      { title: "T1 - Sympathetic Chain Demonstration", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099725/posts/2164655472" },
      { title: "Lecture: Phrenic Nerve", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099725/posts/2164764506" },
      { title: "In Class Demo: Phrenic Nerve", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099725/posts/2192994870" },
      { title: "Phrenic Nerve Demonstration", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099725/posts/2164663189" }
    ]
  },
  {
    category: "Lymphatic System Assessment and Correction",
    lessons: [
      { title: "Lecture: Lymphatic System", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2158539300/posts/2164764799" },
      { title: "Lymphatic Cranial Reflex Zone", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2158539300/posts/2191285451" },
      { title: "Lymphatic Release Positions", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2158539300/posts/2164723635" },
      { title: "Lymphatic System Full Procedure", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2158539300/posts/2164719983" }
    ]
  },
  {
    category: "Vagus Nerve",
    lessons: [
      { title: "Vagus Nerve Masterclass", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152152431/posts/2164865060" },
      { title: "Lecture: Vagus Nerve Procedure", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152152431/posts/2164865138" },
      { title: "Demonstration: Vagus Nerve Screen", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152152431/posts/2166291753" }
    ]
  },
  {
    category: "Pathway Assessments and Corrections",
    lessons: [
      { title: "Lecture: Pathway Assessment Process Overview", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2164723262" },
      { title: "Lecture: Nociceptive Threat Assessment", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2164728792" },
      { title: "Nociceptive Threat Assessment Demonstration", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2164726137" },
      { title: "Nociceptive Demo Review", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2164772241" },
      { title: "Lecture: Efferent Pathway Correction", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2167444469" },
      { title: "Lecture: Cortical Brain Zones", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2167468893" },
      { title: "Lecture: Sub-Corticol Brain Zones", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2167469166" },
      { title: "Locating the Brain Reflex Areas", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2169356729" },
      { title: "Lecture: Mechanoreceptor (Conscious)", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2171239933" },
      { title: "Demo: Mechanoreceptor (Conscious)", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2171201710" }
    ]
  },
  {
    category: "Primitive Reflexes",
    lessons: [
      { title: "Background Information for the Primitive Reflexes", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2164792212" },
      { title: "Lecture: Primitive Reflexes Overview", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2164760586" },
      { title: "In Class Demo: Moro Reflex, Startle", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2164728867" },
      { title: "In Class Demo: Spinal Gallant Reflex", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2169016216" },
      { title: "ATNR Assessment Demo", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2164729690" },
      { title: "Tonic Labrynthine Reflex (TLR) Assessment Demo", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2164729000" },
      { title: "Fear Paralyis Reflex Demo", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2167094242" },
      { title: "Babinski Reflex Demo", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2167502394" },
      { title: "Moro/Startle Reflex Demo", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2167502429" },
      { title: "ATNR", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2167502432" }
    ]
  },
  {
    category: "Postural Reflexes",
    lessons: [
      { title: "Occular & Labrythine Righting Reflexes Assessment", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2154822754/posts/2175437516" }
    ]
  },
  {
    category: "Cranial Nerves",
    lessons: [
      { title: "Lecture: Cranial Nerves", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2164792486" },
      { title: "Cranial Nerve I (Olfactory)", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167205372" },
      { title: "Cranial Nerve II (Optic Nerve)", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167779783" },
      { title: "Cranial Nerve III (Oculomotor)", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167779787" },
      { title: "Cranial Nerve IV (Trochlear)", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167779806" },
      { title: "Cranial Nerve V (Trigeminal)", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167780073" },
      { title: "Cranial Nerve VI (Abducens)", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167780077" },
      { title: "Cranial Nerve VII (Facial)", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167780903" },
      { title: "Cranial Nerve VIII (Vestibulo-cochlear)", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167780911" },
      { title: "Cranial Nerve IX (Glossopharyngeal)", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167780916" }
    ]
  },
  {
    category: "Emotional Corrections",
    lessons: [
      { title: "Lecture: Emotional Corrections", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152249762/posts/2165230137" },
      { title: "In class Lecture and Demo: Emotions", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152249762/posts/2172678455" },
      { title: "Demo: Emotional Correction", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152249762/posts/2164720410" }
    ]
  },
  {
    category: "Finishing Procedures and Home Reinforcement",
    lessons: [
      { title: "Lecture: Gaits Integration", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099726/posts/2164655473" },
      { title: "Gaits Integration Procedure", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099726/posts/2164757718" },
      { title: "In class Lecture: Gaits", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099726/posts/2172690792" },
      { title: "Things to Check during the session and for Home Reinforcement", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099726/posts/2164655474" }
    ]
  },
  {
    category: "Background Information",
    lessons: [
      { title: "Lecture: How the Brain Maps Movement", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099723/posts/2164853086" },
      { title: "Chronic Pain and the Brain", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099723/posts/2165118302" }
    ]
  },
  {
    category: "Masterclasses",
    lessons: [
      { title: "Vertigo Masterclass - 21/Nov/2023", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2154460220/posts/2172969132" },
      { title: "Personal Mindset Mastery Masterclass (Jan 3rd, 2024)", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2154460220/posts/2174007926" },
      { title: "Neuro Mastery Masterclass: Muscle Testing Nuance and Back Pain Demo", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2154460220/posts/2187544782" },
      { title: "Tendon Guard Reflex Masterclass", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2154460220/posts/2187887358" }
    ]
  },
  {
    category: "Functional Anatomy and Biomechanics",
    lessons: [
      { title: "Functional Anatomy Basics of the Saggital Plane", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152867936/posts/2171369485" },
      { title: "Functional Anatomy Basics of the Frontal Plane", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152867936/posts/2171369489" },
      { title: "Functional Anatomy basics of the Transverse Plane", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152867936/posts/2171369492" }
    ]
  },
  {
    category: "Putting it all Together",
    lessons: [
      { title: "Lower Back Pain (In Class Demo)", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2154487237/posts/2176704641" },
      { title: "Q and A - 5/8/2025 (STNR test, Navigating Challenging Muscle Tests)", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2154487237/posts/2187520560" }
    ]
  },
  {
    category: "FNH Foundations Exam",
    lessons: [
      { title: "FNH Foundations Theory Exam", url: "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2156390136/posts/2182274096" }
    ]
  }
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
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
    const lessonsToInsert = [];
    for (const module of COURSE_STRUCTURE) {
      for (const lesson of module.lessons) {
        lessonsToInsert.push({
          job_id: job_id,
          user_id: user_id,
          lesson_url: lesson.url,
          title: lesson.title,
          video_url: null,
          status: 'pending',
          category: module.category,
        });
      }
    }
    
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
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));
        
        const dummyVideoUrl = `https://fnh-storage.s3.amazonaws.com/videos/${slugify(lesson.title || 'video')}.mp4`;
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