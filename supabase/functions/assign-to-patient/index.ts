
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
    const { staffId, patientId, role, assignedBy } = await req.json();
    
    if (!staffId || !patientId || !role) {
      return new Response(
        JSON.stringify({ error: "Staff ID, Patient ID, and role are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Check if the current user has permission (is admin or doctor)
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
    
    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ error: "Only doctors and administrators can assign care team members" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Check if assignment already exists
    const { data: existingAssignment, error: checkError } = await supabaseAdmin
      .from('care_team_assignments')
      .select('id')
      .eq('staff_id', staffId)
      .eq('patient_id', patientId)
      .eq('role', role)
      .maybeSingle();
      
    if (checkError) {
      return new Response(
        JSON.stringify({ error: "Failed to check existing assignment" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // If assignment exists, simply set active to true
    if (existingAssignment) {
      const { data: updatedData, error: updateError } = await supabaseAdmin
        .from('care_team_assignments')
        .update({ active: true })
        .eq('id', existingAssignment.id)
        .select()
        .single();
        
      if (updateError) {
        return new Response(
          JSON.stringify({ error: "Failed to update assignment" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ message: "Assignment updated", data: updatedData }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Create new assignment
    const { data: newAssignment, error: insertError } = await supabaseAdmin
      .from('care_team_assignments')
      .insert({
        staff_id: staffId,
        patient_id: patientId,
        role: role,
        assigned_by: assignedBy || session.user.id,
        active: true
      })
      .select()
      .single();
      
    if (insertError) {
      return new Response(
        JSON.stringify({ error: "Failed to create assignment" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ message: "Staff assigned to patient", data: newAssignment }),
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
