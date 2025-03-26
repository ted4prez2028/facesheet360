
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
    // Create a Supabase client with admin privileges
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
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
    const { patientId } = await req.json();
    
    if (!patientId) {
      return new Response(
        JSON.stringify({ error: "Patient ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Fetching patient with ID: ${patientId}`);
    
    // Check if the user is a doctor (has full access)
    const { data: userRoles, error: rolesError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id);
      
    if (rolesError) {
      console.error("Error fetching user roles:", rolesError);
      return new Response(
        JSON.stringify({ error: `Failed to check permissions: ${rolesError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const roles = userRoles?.map(r => r.role) || [];
    const isDoctor = roles.includes('doctor');
    const isAdmin = roles.includes('admin');
    
    // If not a doctor, check if the user is assigned to this patient
    let hasAccess = isDoctor || isAdmin;
    
    if (!hasAccess) {
      const { data: assignment, error: assignmentError } = await supabaseClient
        .from('care_team_assignments')
        .select('id')
        .eq('staff_id', session.user.id)
        .eq('patient_id', patientId)
        .eq('active', true)
        .maybeSingle();
        
      if (assignmentError) {
        console.error("Error checking patient assignment:", assignmentError);
        return new Response(
          JSON.stringify({ error: `Failed to check permissions: ${assignmentError.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      hasAccess = !!assignment;
    }
    
    // If the user doesn't have access, return an error
    if (!hasAccess) {
      return new Response(
        JSON.stringify({ error: "You do not have permission to view this patient" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Direct query with admin rights to bypass RLS
    const { data, error } = await supabaseClient
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching patient:", error);
      return new Response(
        JSON.stringify({ error: `Failed to fetch patient: ${error.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!data) {
      return new Response(
        JSON.stringify({ error: "Patient not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Return the patient data
    return new Response(
      JSON.stringify(data),
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
