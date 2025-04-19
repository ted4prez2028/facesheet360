
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
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Look up user by email
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', 'tdicusmurray@gmail.com')
      .maybeSingle();
    
    if (userError) {
      console.error("Error fetching user:", userError);
      return new Response(JSON.stringify({ error: "Failed to fetch user" }), {
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    if (!userData) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    // Check if user already has admin role
    const { data: existingRole, error: roleCheckError } = await supabaseAdmin
      .from('user_roles')
      .select('*')
      .eq('user_id', userData.id)
      .eq('role', 'admin')
      .maybeSingle();
      
    if (roleCheckError) {
      console.error("Error checking existing role:", roleCheckError);
      return new Response(JSON.stringify({ error: "Failed to check existing role" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    // If role already exists, we're done
    if (existingRole) {
      return new Response(JSON.stringify({ message: "User already has admin role", userId: userData.id }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    // Assign admin role
    const { error: insertError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: userData.id,
        role: 'admin'
      });
      
    if (insertError) {
      console.error("Error assigning role:", insertError);
      return new Response(JSON.stringify({ error: "Failed to assign admin role" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    return new Response(JSON.stringify({ 
      success: true,
      message: "Admin role assigned successfully",
      userId: userData.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
    
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
