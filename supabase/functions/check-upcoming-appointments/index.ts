
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface Appointment {
  id: string;
  patient_id: string;
  provider_id: string;
  appointment_date: string;
  status: string;
  notes?: string;
}

interface Prescription {
  id: string;
  patient_id: string;
  provider_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date?: string;
  status: string;
}

interface Notification {
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  event_id?: string;
  event_time?: string;
}

serve(async (req) => {
  try {
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get current time and time 20 minutes from now
    const now = new Date();
    const twentyMinutesFromNow = new Date(now.getTime() + 20 * 60 * 1000);
    
    // Format dates for PostgreSQL comparison
    const formattedNow = now.toISOString();
    const formattedTwentyMinutesFromNow = twentyMinutesFromNow.toISOString();
    
    // Check for upcoming appointments within the next 20 minutes
    const { data: upcomingAppointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('*')
      .gte('appointment_date', formattedNow)
      .lt('appointment_date', formattedTwentyMinutesFromNow)
      .eq('status', 'scheduled');
    
    if (appointmentsError) {
      throw appointmentsError;
    }
    
    // Process each upcoming appointment
    for (const appointment of (upcomingAppointments || [])) {
      // Get patient details
      const { data: patientData } = await supabase
        .from('patients')
        .select('first_name, last_name')
        .eq('id', appointment.patient_id)
        .single();
      
      if (!patientData) continue;
      
      // Create notification for the provider
      const notification: Notification = {
        user_id: appointment.provider_id,
        title: 'Upcoming Appointment',
        message: `You have an appointment with ${patientData.first_name} ${patientData.last_name} in less than 20 minutes`,
        type: 'appointment',
        read: false,
        event_id: appointment.id,
        event_time: appointment.appointment_date
      };
      
      // Insert notification into the database
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(notification);
      
      if (notificationError) {
        console.error('Error creating appointment notification:', notificationError);
      }
    }
    
    // Check for medications that need to be administered
    const { data: activePrescriptions, error: prescriptionsError } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('status', 'prescribed');
    
    if (prescriptionsError) {
      throw prescriptionsError;
    }
    
    // Process active prescriptions
    for (const prescription of (activePrescriptions || [])) {
      // Simple handling for "every X hours" frequency
      if (prescription.frequency && prescription.frequency.includes('hours')) {
        // Get patient details
        const { data: patientData } = await supabase
          .from('patients')
          .select('first_name, last_name')
          .eq('id', prescription.patient_id)
          .single();
        
        if (!patientData) continue;
        
        // Create notification for medication reminder
        const notification: Notification = {
          user_id: prescription.provider_id,
          title: 'Medication Reminder',
          message: `Time to administer ${prescription.medication_name} (${prescription.dosage}) to ${patientData.first_name} ${patientData.last_name}`,
          type: 'medication',
          read: false,
          event_id: prescription.id
        };
        
        // Insert notification into the database
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert(notification);
        
        if (notificationError) {
          console.error('Error creating medication notification:', notificationError);
        }
      }
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      processed: {
        appointments: upcomingAppointments?.length || 0,
        prescriptions: activePrescriptions?.length || 0
      }
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
    
  } catch (error) {
    console.error('Error in check-upcoming-appointments function:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
