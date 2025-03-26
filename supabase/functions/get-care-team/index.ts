
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
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );
    
    // Get the session to verify the user is authenticated
    const { data: { session }, error: authError } = await supabaseAdmin.auth.getSession();
    
    if (authError || !session) {
      console.error("Authentication error:", authError);
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Parse request body
    const { patientId } = await req.json();
    
    if (!patientId) {
      return new Response(
        JSON.stringify({ error: "Patient ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Check if the current user has permission to view this patient's care team
    const { data: userRoles, error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id);
      
    if (rolesError) {
      return new Response(
        JSON.stringify({ error: "Failed to check permissions" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const isAuthorized = userRoles.some(r => r.role === 'admin' || r.role === 'doctor');
    
    // If not doctor/admin, check if assigned to this patient
    if (!isAuthorized) {
      const { data: assignment, error: assignmentError } = await supabaseAdmin
        .from('care_team_assignments')
        .select('id')
        .eq('staff_id', session.user.id)
        .eq('patient_id', patientId)
        .eq('active', true)
        .maybeSingle();
        
      if (assignmentError) {
        return new Response(
          JSON.stringify({ error: "Failed to check patient assignment" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (!assignment) {
        return new Response(
          JSON.stringify({ error: "You don't have permission to view this patient's care team" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    
    // Fetch care team members with user details
    const { data: careTeamRaw, error: careTeamError } = await supabaseAdmin
      .from('care_team_assignments')
      .select(`
        id,
        staff_id,
        role,
        assigned_at,
        assigned_by
      `)
      .eq('patient_id', patientId)
      .eq('active', true);
      
    if (careTeamError) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch care team" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get user details for each team member
    const careTeam = await Promise.all(careTeamRaw.map(async (member) => {
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('name, email')
        .eq('id', member.staff_id)
        .single();
        
      if (userError) {
        console.error(`Failed to fetch user data for ${member.staff_id}:`, userError);
        return {
          ...member,
          name: 'Unknown User',
          email: '',
        };
      }
      
      return {
        ...member,
        name: userData.name,
        email: userData.email,
      };
    }));
    
    return new Response(
      JSON.stringify(careTeam),
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
