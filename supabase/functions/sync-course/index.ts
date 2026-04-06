// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
  const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  const supabaseAdmin = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  })

  try {
    const { user_id } = await req.json();
    
    // 1. Fetch the master map from the database
    const { data: masterMap, error: mapError } = await supabaseAdmin
      .from('verified_course_map')
      .select('*')
      .order('sort_order', { ascending: true });

    if (mapError) throw mapError;

    // 2. Clear existing lessons for this user to avoid duplicates
    await supabaseAdmin.from('lessons').delete().eq('user_id', user_id);

    // 3. Map the verified data to the user's lessons table
    const lessonsToInsert = masterMap.map((item: any) => ({
      user_id: user_id,
      lesson_url: item.page_url,
      title: item.title,
      video_url: item.video_url,
      status: item.video_url ? 'completed' : 'failed',
      category: item.category,
    }));
    
    const { error: insertError } = await supabaseAdmin.from('lessons').insert(lessonsToInsert);
    if (insertError) throw insertError;

    return new Response(JSON.stringify({ message: 'Course data synced successfully from master map.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})