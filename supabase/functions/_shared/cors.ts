// supabase/functions/_shared/cors.ts
// File ini berisi header CORS standar untuk memungkinkan
// aplikasi web kita berkomunikasi dengan Edge Function.

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
