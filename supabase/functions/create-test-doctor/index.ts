import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Create test doctor account
    const email = `doctor.test${Date.now()}@example.com`;
    const password = "TestDoctor123!";
    const name = `Dr. Test${Date.now()}`;

    console.log("Creating test doctor account:", email);

    // Create the auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role: "doctor",
      },
    });

    if (authError) {
      console.error("Auth error:", authError);
      throw authError;
    }

    console.log("Created auth user:", authData.user.id);

    // Get the admin's organization from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Could not get current user");
    }

    // Get admin's organization
    const { data: adminProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("organization")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Profile error:", profileError);
      throw profileError;
    }

    const organization = adminProfile?.organization || "Main Hospital";

    // Update the new user's profile with organization
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        organization,
        name,
        role: "doctor",
        specialty: "General Practice",
      })
      .eq("id", authData.user.id);

    if (updateError) {
      console.error("Profile update error:", updateError);
      throw updateError;
    }

    // Add doctor role
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: authData.user.id,
        role: "doctor",
      });

    if (roleError) {
      console.error("Role error:", roleError);
      // Don't throw, role might already exist
    }

    console.log("Test doctor created successfully");

    return new Response(
      JSON.stringify({
        success: true,
        email,
        password,
        name,
        organization,
        message: `Test doctor account created. Email: ${email}, Password: ${password}`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating test doctor:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
