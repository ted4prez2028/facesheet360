import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current time minus 15 minutes grace period
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    
    // Find appointments that are past due and still in scheduled status
    const { data: missedAppointments, error: appointmentError } = await supabase
      .from('appointments')
      .select(`
        *,
        patients(id, name),
        provider:provider_id(id, name, email)
      `)
      .eq('status', 'scheduled')
      .lt('scheduled_time', fifteenMinutesAgo);

    if (appointmentError) {
      console.error('Error fetching appointments:', appointmentError);
      throw appointmentError;
    }

    if (!missedAppointments || missedAppointments.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No missed appointments found', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const warnings = [];

    for (const appointment of missedAppointments) {
      // Check if warning already sent for this appointment
      const { data: existingWarning } = await supabase
        .from('notifications')
        .select('id')
        .eq('type', 'warning')
        .eq('event_id', appointment.id)
        .single();

      if (existingWarning) {
        continue; // Skip if warning already sent
      }

      // Mark appointment as no-show
      await supabase
        .from('appointments')
        .update({ status: 'no-show' })
        .eq('id', appointment.id);

      // Send warning notification to provider
      const warningNotification = {
        user_id: appointment.provider_id,
        title: 'Missed Appointment',
        message: `Appointment with ${appointment.patients?.name || 'patient'} at ${new Date(appointment.scheduled_time).toLocaleString()} was marked as no-show.`,
        type: 'warning',
        event_id: appointment.id,
        event_time: appointment.scheduled_time,
        read: false
      };

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(warningNotification);

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
      } else {
        warnings.push(appointment.id);
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Missed appointments processed', 
        count: warnings.length,
        appointmentIds: warnings
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
