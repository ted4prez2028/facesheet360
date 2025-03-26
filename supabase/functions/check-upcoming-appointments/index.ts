
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.3';

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
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Get current date/time
    const now = new Date();
    
    // Calculate time 20 minutes from now
    const twentyMinutesFromNow = new Date(now.getTime() + 20 * 60 * 1000);
    
    console.log('Checking appointments between', now.toISOString(), 'and', twentyMinutesFromNow.toISOString());
    
    // Query for appointments that start within the next 20 minutes
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select(`
        *,
        patients:patient_id (first_name, last_name),
        providers:provider_id (id, name)
      `)
      .gte('appointment_date', now.toISOString())
      .lte('appointment_date', twentyMinutesFromNow.toISOString());
    
    if (appointmentsError) {
      throw appointmentsError;
    }
    
    console.log(`Found ${appointments?.length || 0} upcoming appointments`);
    
    // Process each appointment and send notification
    if (appointments && appointments.length > 0) {
      for (const appointment of appointments) {
        const appointmentTime = new Date(appointment.appointment_date);
        const minutesUntil = Math.floor((appointmentTime.getTime() - now.getTime()) / 60000);
        
        const patientName = appointment.patients 
          ? `${appointment.patients.first_name} ${appointment.patients.last_name}`
          : "a patient";
        
        const providerId = appointment.providers?.id;
        
        if (providerId) {
          // Check if we've already sent a notification for this appointment
          const { data: existingNotifications } = await supabase
            .from('notifications')
            .select('*')
            .eq('event_id', appointment.id)
            .eq('user_id', providerId);
          
          // Only send notification if we haven't already sent one
          if (!existingNotifications || existingNotifications.length === 0) {
            // Create notification for the provider
            await supabase
              .from('notifications')
              .insert({
                user_id: providerId,
                title: `Upcoming Appointment`,
                message: `Appointment with ${patientName} in ${minutesUntil} minutes`,
                type: 'appointment',
                read: false,
                event_id: appointment.id,
                event_time: appointment.appointment_date
              });
            
            console.log(`Sent notification to provider ${providerId} for appointment with ${patientName}`);
          }
        }
      }
    }
    
    return new Response(
      JSON.stringify({ success: true, message: `Processed ${appointments?.length || 0} appointments` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error checking appointments:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
