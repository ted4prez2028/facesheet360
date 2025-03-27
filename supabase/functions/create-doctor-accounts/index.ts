
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Admin key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    
    // Get the list of doctors from the request body
    const { doctors } = await req.json();
    
    if (!Array.isArray(doctors) || doctors.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid or empty doctors array" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = [];
    const generatedPasswords = {};

    // Process each doctor
    for (const doctor of doctors) {
      try {
        // Generate a random password
        const password = Math.random().toString(36).slice(-10) + Math.random().toString(36).toUpperCase().slice(-2) + Math.random().toString(10).slice(-2);
        generatedPasswords[doctor.email] = password;
        
        // Create user account in Supabase
        const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: doctor.email,
          password: password,
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            name: doctor.name,
            role: "doctor",
            specialty: doctor.specialty,
            organization: doctor.organization
          }
        });

        if (createError) {
          results.push({
            email: doctor.email,
            success: false,
            error: createError.message
          });
          continue;
        }

        // Add user to users table
        const { error: profileError } = await supabaseAdmin
          .from('users')
          .insert({
            id: user.user.id,
            name: doctor.name,
            email: doctor.email,
            role: "doctor",
            specialty: doctor.specialty,
            organization: doctor.organization,
            online_status: false,
            care_coins_balance: 100 // Give them some initial care coins
          });

        if (profileError) {
          results.push({
            email: doctor.email,
            success: false,
            error: profileError.message
          });
          continue;
        }

        // Send welcome email with credentials and call script
        const { data: emailData, error: emailError } = await resend.emails.send({
          from: "Facesheet360 <onboarding@resend.dev>",
          to: [doctor.email],
          subject: "Welcome to Facesheet360 - Your Account Details",
          html: `
            <h1>Welcome to Facesheet360, Dr. ${doctor.name.split(" ")[1] || ""}!</h1>
            <p>Your account has been created successfully. Here are your login details:</p>
            <ul>
              <li><strong>Email:</strong> ${doctor.email}</li>
              <li><strong>Password:</strong> ${password}</li>
            </ul>
            <p>Please login at <a href="https://facesheet360.app/login">https://facesheet360.app/login</a></p>
            
            <h2>Telemedicine Call Script</h2>
            <p>When conducting telemedicine calls on our platform, please follow this script:</p>
            <ol>
              <li><strong>Introduction:</strong> "Hello, I'm Dr. [Your Name] from [Organization]. Thank you for connecting with me today via Facesheet360."</li>
              <li><strong>Verification:</strong> "Before we begin, I'd like to confirm your name and date of birth to ensure I have the correct records."</li>
              <li><strong>Reason for Visit:</strong> "What brings you in today? Please tell me about your symptoms or concerns."</li>
              <li><strong>History Taking:</strong> Ask relevant questions about the patient's medical history, current medications, allergies, etc.</li>
              <li><strong>Discussion:</strong> Discuss your assessment, potential diagnoses, and treatment options.</li>
              <li><strong>Plan:</strong> "Here's what I recommend for your care plan..." (Outline medications, tests, referrals, etc.)</li>
              <li><strong>Closing:</strong> "Do you have any questions? If something changes or worsens, please don't hesitate to reach back out."</li>
            </ol>
            <p>Thank you for being part of our healthcare network. If you have any questions or need assistance with the platform, please contact support@facesheet360.app.</p>
          `,
        });

        if (emailError) {
          results.push({
            email: doctor.email,
            success: true,
            accountCreated: true,
            emailSent: false,
            error: emailError.message
          });
        } else {
          results.push({
            email: doctor.email,
            success: true,
            accountCreated: true,
            emailSent: true
          });
        }
      } catch (error) {
        results.push({
          email: doctor.email,
          success: false,
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({ results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in create-doctor-accounts function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
