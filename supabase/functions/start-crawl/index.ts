import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

  try {
    const body = await req.json();
    job_id = body.job_id;
    console.log("[start-crawl] Received job ID:", job_id)

    if (!job_id) {
      return new Response(JSON.stringify({ error: 'Missing job_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 1. Update status to 'running' and set initial lessons count (simulated discovery of 18 modules)
    const totalLessons = 18;
    const { error: updateError1 } = await supabaseAdmin
      .from('crawler_jobs')
      .update({ status: 'running', total_lessons: totalLessons })
      .eq('id', job_id)
      .select()

    if (updateError1) {
      console.error("[start-crawl] Error updating status to running:", updateError1)
      throw new Error(updateError1.message)
    }
    console.log(`[start-crawl] Job ${job_id} status set to running with ${totalLessons} total lessons.`)

    // --- SIMULATE CRAWLING PROGRESS ---
    for (let i = 1; i <= totalLessons; i++) {
      // In a real scenario, this loop would perform the actual scraping work.
      
      const { error: updateError2 } = await supabaseAdmin
        .from('crawler_jobs')
        .update({ lessons_processed: i })
        .eq('id', job_id)
        .select()

      if (updateError2) {
        console.error(`[start-crawl] Error updating progress for lesson ${i}:`, updateError2)
      }
      console.log(`[start-crawl] Job ${job_id}: Processed lesson ${i}/${totalLessons}`)
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