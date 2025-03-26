
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
    
    // Create a second client that passes along the user's token for authentication
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header is required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );
    
    // Get the session to verify the user is authenticated
    const { data: { session }, error: authError } = await supabaseClient.auth.getSession();
    
    if (authError) {
      console.error("Authentication error:", authError);
      return new Response(
        JSON.stringify({ error: "Authentication error", details: authError.message }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!session) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get request body
    let patientId;
    try {
      const body = await req.json();
      patientId = body.patientId;
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!patientId) {
      return new Response(
        JSON.stringify({ error: "Patient ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Fetching patient with ID: ${patientId}`);
    
    // Check if the user has a doctor role first (using RPC to bypass potential recursion)
    const { data: userRoles, error: rolesError } = await supabaseAdmin.rpc(
      'get_user_roles',
      { user_id_param: session.user.id }
    );
      
    if (rolesError) {
      console.error("Error fetching user roles:", rolesError);
      return new Response(
        JSON.stringify({ error: `Failed to check permissions: ${rolesError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const roles = userRoles || [];
    const isDoctor = roles.includes('doctor');
    const isAdmin = roles.includes('admin');
    
    // If not a doctor, check if the user is assigned to this patient
    let hasAccess = isDoctor || isAdmin;
    
    if (!hasAccess) {
      const { data: isAssigned, error: assignmentError } = await supabaseAdmin.rpc(
        'is_staff_assigned_to_patient',
        { 
          staff_id_param: session.user.id,
          patient_id_param: patientId
        }
      );
        
      if (assignmentError) {
        console.error("Error checking patient assignment:", assignmentError);
        return new Response(
          JSON.stringify({ error: `Failed to check permissions: ${assignmentError.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      hasAccess = !!isAssigned;
    }
    
    // If the user doesn't have access, return an error
    if (!hasAccess) {
      return new Response(
        JSON.stringify({ error: "You do not have permission to view this patient" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Direct query with admin rights to bypass RLS
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
