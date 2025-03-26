
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key for admin access
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      console.log("Missing Authorization header");
      return new Response(
        JSON.stringify({ error: "Authorization header is required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Create client with user's auth token to verify authentication
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );
    
    // Verify user is authenticated
    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
    
    if (sessionError || !session) {
      console.error("Session verification failed:", sessionError);
      return new Response(
        JSON.stringify({ error: "Authentication required", details: sessionError?.message }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get userId from request body or use authenticated user's ID
    let targetUserId;
    try {
      const body = await req.json();
      targetUserId = body.userId || session.user.id;
    } catch (e) {
      // If no body, use the authenticated user's ID
      targetUserId = session.user.id;
    }
    
    console.log(`Fetching roles for user ID: ${targetUserId}`);
    
    // Query the roles table directly using the admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', targetUserId);
    
    if (error) {
      console.error("Error fetching roles:", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch user roles", details: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Extract the roles from the data
    const roles = data.map(row => row.role);
    
    return new Response(
      JSON.stringify({ roles }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: `Unexpected error: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
