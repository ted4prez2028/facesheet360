
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Create a Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://tuembzleutkexrmrzxkg.supabase.co'
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseKey)

// Handle CORS preflight requests
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    console.log('Checking for upcoming appointments...')
    
    // Get current date/time
    const now = new Date()
    
    // Calculate time 20 minutes from now
    const twentyMinutesFromNow = new Date(now.getTime() + 20 * 60 * 1000)
    
    // Query for appointments that start within the next 20 minutes
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select(`
        *,
        patients:patient_id (first_name, last_name),
        provider:provider_id (id, name, email)
      `)
      .gte('appointment_date', now.toISOString())
      .lte('appointment_date', twentyMinutesFromNow.toISOString())
    
    if (appointmentsError) {
      throw appointmentsError
    }
    
    console.log(`Found ${appointments?.length || 0} upcoming appointments`)
    
    // For each appointment, create a notification
    const notificationsToInsert = []
    
    if (appointments && appointments.length > 0) {
      for (const appointment of appointments) {
        const patientName = appointment.patients 
          ? `${appointment.patients.first_name} ${appointment.patients.last_name}`
          : "a patient"
          
        const minutesUntil = Math.floor(
          (new Date(appointment.appointment_date).getTime() - now.getTime()) / 60000
        )
        
        // Create notification for provider
        notificationsToInsert.push({
          user_id: appointment.provider_id,
          title: `Upcoming Appointment`,
          message: `Appointment with ${patientName} in ${minutesUntil} minutes`,
          type: "appointment",
          read: false,
          event_id: appointment.id,
          event_time: appointment.appointment_date
        })
      }
    }
    
    // Also check for medications due in the next hour
    const { data: medications, error: medsError } = await supabase
      .from('prescriptions')
      .select(`
        *,
        patients:patient_id (first_name, last_name),
        provider:provider_id (id, name, email)
      `)
      .eq('status', 'prescribed')
      .lte('start_date', now.toISOString())
      .or(`end_date.is.null,end_date.gt.${now.toISOString()}`)
    
    if (medsError) {
      throw medsError
    }
    
    console.log(`Found ${medications?.length || 0} active medications`)
    
    // Get current hour to check if it's medication time
    const currentHour = now.getHours()
    let timeOfDay = ""
    let shouldNotify = false
    
    // Morning medications (8-10 AM)
    if (currentHour >= 8 && currentHour <= 10) {
      shouldNotify = true
      timeOfDay = "morning"
    }
    // Afternoon medications (12-2 PM)
    else if (currentHour >= 12 && currentHour <= 14) {
      shouldNotify = true
      timeOfDay = "afternoon"
    }
    // Evening medications (6-8 PM)
    else if (currentHour >= 18 && currentHour <= 20) {
      shouldNotify = true
      timeOfDay = "evening"
    }
    
    if (shouldNotify && medications && medications.length > 0) {
      for (const med of medications) {
        const patientName = med.patients 
          ? `${med.patients.first_name} ${med.patients.last_name}`
          : "your patient"
        
        notificationsToInsert.push({
          user_id: med.provider_id,
          title: `${timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)} Medication Reminder`,
          message: `${med.medication_name} (${med.dosage}) is due for ${patientName}`,
          type: "medication",
          read: false,
          event_id: med.id,
          event_time: now.toISOString()
        })
      }
    }
    
    // Insert all notifications
    if (notificationsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('notifications')
        .insert(notificationsToInsert)
      
      if (insertError) {
        throw insertError
      }
      
      console.log(`Successfully inserted ${notificationsToInsert.length} notifications`)
    } else {
      console.log('No notifications to insert')
    }
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        appointments_checked: appointments?.length || 0,
        medications_checked: medications?.length || 0,
        notifications_created: notificationsToInsert.length
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in check-upcoming-appointments:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 500,
      }
    )
  }
})
