
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
    
    // Get the patient ID from the request body
    let patientId;
    try {
      const body = await req.json();
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
    
    console.log(`Fetching patient with ID: ${patientId}`);
    
    // Check if user is a doctor or admin role using the admin client
    const { data: userRoles } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id);
    
    const roles = userRoles ? userRoles.map(r => r.role) : [];
    const isDoctor = roles.includes('doctor');
    const isAdmin = roles.includes('admin');
    
    // Check if the user is assigned to this patient
    let hasAccess = isDoctor || isAdmin;
    
    if (!hasAccess) {
      const { data: assignment } = await supabaseAdmin
        .from('care_team_assignments')
        .select('*')
        .eq('staff_id', session.user.id)
        .eq('patient_id', patientId)
        .maybeSingle();
      
      hasAccess = !!assignment;
    }
    
    // If the user doesn't have access, return a permission denied error
    if (!hasAccess) {
      return new Response(
        JSON.stringify({ error: "You do not have permission to view this patient" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Fetch the patient data directly using the admin client to bypass RLS
    const { data: patient, error: patientError } = await supabaseAdmin
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .maybeSingle();
    
    if (patientError) {
      console.error("Error fetching patient:", patientError);
      return new Response(
        JSON.stringify({ error: `Failed to fetch patient: ${patientError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!patient) {
      return new Response(
        JSON.stringify({ error: "Patient not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Return the patient data
    return new Response(
      JSON.stringify(patient),
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
