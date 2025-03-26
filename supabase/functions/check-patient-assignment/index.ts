
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
    
    // Get request parameters
    let staffId, patientId;
    try {
      const body = await req.json();
      staffId = body.staffId || session.user.id;
      patientId = body.patientId;
      
      if (!patientId) {
        return new Response(
          JSON.stringify({ error: "Patient ID is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Checking if staff ${staffId} is assigned to patient ${patientId}`);
    
    // Query the care_team_assignments table directly
    const { data, error } = await supabaseAdmin
      .from('care_team_assignments')
      .select('*')
      .eq('staff_id', staffId)
      .eq('patient_id', patientId)
      .maybeSingle();
    
    if (error) {
      console.error("Error checking assignment:", error);
      return new Response(
        JSON.stringify({ error: "Failed to check patient assignment", details: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Return the assignment status
    return new Response(
      JSON.stringify({ isAssigned: !!data }),
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
