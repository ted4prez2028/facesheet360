import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Get the user from the auth header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error('User not found');
    }

    console.log('Upgrading user to admin:', user.id, user.email);

    // Create or update profile
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        name: user.email?.split('@')[0] || 'Admin',
        role: 'admin',
        specialty: 'Admin of facesheet360'
      });

    if (profileError) {
      console.error('Profile error:', profileError);
      throw profileError;
    }

    // Delete existing roles for this user
    await supabaseClient
      .from('user_roles')
      .delete()
      .eq('user_id', user.id);

    // Insert admin role
    const { error: roleError } = await supabaseClient
      .from('user_roles')
      .insert({
        user_id: user.id,
        role: 'admin'
      });

    if (roleError) {
      console.error('Role error:', roleError);
      throw roleError;
    }

    console.log('Successfully upgraded user to admin');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User upgraded to admin successfully',
        userId: user.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error upgrading user to admin:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
