import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { email, name, password } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Creating admin account for: ${email}`);

    // Create the user account
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: password || 'TempPassword123!',
      email_confirm: true,
      user_metadata: {
        name: name || 'Admin',
        role: 'admin'
      }
    });

    if (authError) {
      console.error('Error creating user:', authError);
      return new Response(
        JSON.stringify({ error: `Failed to create user: ${authError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = authData.user.id;
    console.log(`User created with ID: ${userId}`);

    // Add admin role to user_roles table
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'admin'
      });

    if (roleError) {
      console.error('Error assigning admin role:', roleError);
      // Continue anyway, the user was created
    }

    // Update profile with admin role
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', userId);

    if (profileError) {
      console.error('Error updating profile:', profileError);
    }

    // Send welcome email
    try {
      const emailResult = await resend.emails.send({
        from: 'FaceSheet360 <onboarding@resend.dev>',
        to: [email],
        subject: 'Welcome to FaceSheet360 - Admin Account Created',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Welcome to FaceSheet360!</h1>
            <p>Hello ${name || 'Admin'},</p>
            <p>Your administrator account has been successfully created.</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin-top: 0;">Account Details</h2>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Role:</strong> Administrator</p>
              ${password ? `<p><strong>Temporary Password:</strong> ${password}</p>` : ''}
            </div>
            <p>You now have full administrative access to the FaceSheet360 platform.</p>
            <p>If you didn't expect this account creation, please contact support immediately.</p>
            <p>Best regards,<br>The FaceSheet360 Team</p>
          </div>
        `,
      });

      console.log('Welcome email sent:', emailResult);
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // Continue anyway, the account was created
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Admin account created and welcome email sent',
        userId: userId,
        email: email
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: `Unexpected error: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
