import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, name } = await req.json()

    console.log('Creating admin doctor account for:', email)

    // First check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers.users.find(user => user.email === email)

    let userId: string;

    if (existingUser) {
      console.log('User already exists, updating password and admin status')
      userId = existingUser.id
      
      // Update password for existing user
      const { error: passwordError } = await supabase.auth.admin.updateUserById(userId, {
        password: password
      })
      
      if (passwordError) {
        console.error('Password update error:', passwordError)
        return new Response(
          JSON.stringify({ error: 'Failed to update user password', details: passwordError.message }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    } else {
      // Create the auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name: name || 'Admin Doctor',
          role: 'doctor'
        }
      })

      if (authError) {
        console.error('Auth creation error:', authError)
        return new Response(
          JSON.stringify({ error: 'Failed to create user account', details: authError.message }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      userId = authData.user?.id
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'User creation failed - no user ID returned' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    }

    console.log('Created auth user with ID:', userId)

    // Update or create user profile in users table
    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        user_id: userId,
        id: userId,
        email,
        name: name || 'Admin Doctor',
        role: 'doctor',
        is_admin: true,
        specialty: 'General Medicine',
        organization: 'Healthcare System'
      }, {
        onConflict: 'user_id'
      })

    if (profileError) {
      console.error('Profile creation/update error:', profileError)
      return new Response(
        JSON.stringify({ error: 'Failed to update user profile', details: profileError.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Created user profile')

    // Assign admin and doctor roles (upsert to avoid conflicts)
    const { error: adminRoleError } = await supabase
      .from('user_roles')
      .upsert({ user_id: userId, role: 'admin' }, { onConflict: 'user_id,role' })

    if (adminRoleError) {
      console.error('Admin role assignment error:', adminRoleError)
    }

    const { error: doctorRoleError } = await supabase
      .from('user_roles')
      .upsert({ user_id: userId, role: 'doctor' }, { onConflict: 'user_id,role' })

    if (doctorRoleError) {
      console.error('Doctor role assignment error:', doctorRoleError)
    }

    console.log('Successfully created admin doctor account')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Admin doctor account created successfully',
        user_id: userId,
        email: email
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})