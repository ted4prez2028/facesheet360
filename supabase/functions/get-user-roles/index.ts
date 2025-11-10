
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceRoleKey || !supabaseAnonKey) {
      console.error("Missing Supabase environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get JWT token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("Missing Authorization header");
      return new Response(
        JSON.stringify({ error: "Authorization header is required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with the authorization header to verify the user
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });
    
    // Verify authentication
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error("User verification failed:", userError);
      return new Response(
        JSON.stringify({ error: "Authentication required", details: userError?.message || "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get target user ID from request body or use authenticated user's ID
    let requestBody;
    let targetUserId;
    try {
      requestBody = await req.json();
      targetUserId = requestBody.userId || user.id;
    } catch (e) {
      // If request body can't be parsed, use the authenticated user's ID
      targetUserId = user.id;
    }
    
    console.log(`Fetching roles for user ID: ${targetUserId}`);
    
    // Now use admin client with service role key to bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
    
    // First try to fetch from user_roles table if it exists
    try {
      const { data: userRoles, error: userRolesError } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', targetUserId);
      
      if (!userRolesError && userRoles && userRoles.length > 0) {
        // Extract the roles from the results
        const roles = userRoles.map(row => row.role);
        
        return new Response(
          JSON.stringify({ roles }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (e) {
      console.log("user_roles table may not exist, falling back to users table", e);
    }
    
    // Fall back to getting role from users table
    const { data: userData, error: userDataError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', targetUserId)
      .single();
    
    if (userDataError) {
      console.error("Error fetching user:", userDataError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch user role", details: userDataError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Return single role from users table
    const roles = userData?.role ? [userData.role] : [];
    
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
