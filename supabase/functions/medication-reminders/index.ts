import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Prescription {
  id: string;
  patient_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date: string | null;
  status: string;
  provider_id: string;
}

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  user_id: string | null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔍 Checking for upcoming medication doses...');

    // Get current time and 5-10 minutes from now window
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
    const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);

    console.log(`Current time: ${now.toISOString()}`);
    console.log(`Notification window: ${fiveMinutesFromNow.toISOString()} to ${tenMinutesFromNow.toISOString()}`);

    // Get active prescriptions
    const { data: prescriptions, error: prescriptionsError } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('status', 'prescribed')
      .lte('start_date', now.toISOString().split('T')[0])
      .or(`end_date.is.null,end_date.gte.${now.toISOString().split('T')[0]}`);

    if (prescriptionsError) {
      throw prescriptionsError;
    }

    console.log(`Found ${prescriptions?.length || 0} active prescriptions`);

    let notificationsCreated = 0;

    for (const prescription of prescriptions || []) {
      console.log(`Processing prescription: ${prescription.medication_name} for patient ${prescription.patient_id}`);
      
      // Get patient details
      const { data: patient } = await supabase
        .from('patients')
        .select('id, first_name, last_name, user_id')
        .eq('id', prescription.patient_id)
        .single();

      if (!patient) continue;

      // Calculate next dose times based on frequency
      const doseTimes = calculateDoseTimes(prescription.frequency, now);
      
      for (const doseTime of doseTimes) {
        const notificationTime = new Date(doseTime.getTime() - 5 * 60 * 1000); // 5 minutes before
        
        // Check if notification should be sent in the next 5 minutes
        if (notificationTime >= fiveMinutesFromNow && notificationTime <= tenMinutesFromNow) {
          console.log(`Creating notification for dose at ${doseTime.toISOString()}`);
          
          // Check if notification already exists for this dose
          const { data: existingNotification } = await supabase
            .from('notifications')
            .select('id')
            .eq('type', 'pharmacy')
            .eq('event_id', `${prescription.id}_${doseTime.getTime()}`)
            .single();

          if (existingNotification) {
            console.log('Notification already exists, skipping...');
            continue;
          }

          // Create notification for provider
          const { error: notificationError } = await supabase
            .from('notifications')
            .insert({
              user_id: prescription.provider_id,
              type: 'pharmacy',
              title: 'Medication Due Soon',
              message: `${patient.first_name} ${patient.last_name} needs ${prescription.medication_name} (${prescription.dosage}) in 5 minutes`,
              event_id: `${prescription.id}_${doseTime.getTime()}`,
              event_time: doseTime.toISOString(),
              read: false
            });

          if (notificationError) {
            console.error('Error creating notification:', notificationError);
          } else {
            notificationsCreated++;
            console.log(`✅ Notification created for ${prescription.medication_name}`);
          }

          // If patient has a user account, notify them too
          if (patient.user_id) {
            await supabase
              .from('notifications')
              .insert({
                user_id: patient.user_id,
                type: 'pharmacy',
                title: 'Your Medication is Due Soon',
                message: `Time for your ${prescription.medication_name} (${prescription.dosage}) in 5 minutes`,
                event_id: `${prescription.id}_${doseTime.getTime()}_patient`,
                event_time: doseTime.toISOString(),
                read: false
              });
          }
        }
      }
    }

    console.log(`✅ Medication reminder check completed. Created ${notificationsCreated} notifications.`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        notificationsCreated,
        message: `Created ${notificationsCreated} medication reminder notifications`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in medication-reminders function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

function calculateDoseTimes(frequency: string, baseTime: Date): Date[] {
  const doseTimes: Date[] = [];
  const currentHour = baseTime.getHours();
  const currentMinute = baseTime.getMinutes();
  
  // Parse common frequency formats
  const lowerFreq = frequency.toLowerCase();
  
  if (lowerFreq.includes('every 4 hours') || lowerFreq.includes('q4h')) {
    // Every 4 hours: 6 AM, 10 AM, 2 PM, 6 PM, 10 PM, 2 AM
    const times = [6, 10, 14, 18, 22, 2];
    times.forEach(hour => {
      const doseTime = new Date(baseTime);
      doseTime.setHours(hour, 0, 0, 0);
      if (doseTime < baseTime) doseTime.setDate(doseTime.getDate() + 1);
      doseTimes.push(doseTime);
    });
  } else if (lowerFreq.includes('every 6 hours') || lowerFreq.includes('q6h')) {
    // Every 6 hours: 6 AM, 12 PM, 6 PM, 12 AM
    const times = [6, 12, 18, 0];
    times.forEach(hour => {
      const doseTime = new Date(baseTime);
      doseTime.setHours(hour, 0, 0, 0);
      if (doseTime < baseTime) doseTime.setDate(doseTime.getDate() + 1);
      doseTimes.push(doseTime);
    });
  } else if (lowerFreq.includes('every 8 hours') || lowerFreq.includes('q8h')) {
    // Every 8 hours: 6 AM, 2 PM, 10 PM
    const times = [6, 14, 22];
    times.forEach(hour => {
      const doseTime = new Date(baseTime);
      doseTime.setHours(hour, 0, 0, 0);
      if (doseTime < baseTime) doseTime.setDate(doseTime.getDate() + 1);
      doseTimes.push(doseTime);
    });
  } else if (lowerFreq.includes('every 12 hours') || lowerFreq.includes('q12h') || lowerFreq.includes('twice daily') || lowerFreq.includes('bid')) {
    // Every 12 hours: 8 AM, 8 PM
    const times = [8, 20];
    times.forEach(hour => {
      const doseTime = new Date(baseTime);
      doseTime.setHours(hour, 0, 0, 0);
      if (doseTime < baseTime) doseTime.setDate(doseTime.getDate() + 1);
      doseTimes.push(doseTime);
    });
  } else if (lowerFreq.includes('once daily') || lowerFreq.includes('daily') || lowerFreq.includes('qd')) {
    // Once daily: 8 AM
    const doseTime = new Date(baseTime);
    doseTime.setHours(8, 0, 0, 0);
    if (doseTime < baseTime) doseTime.setDate(doseTime.getDate() + 1);
    doseTimes.push(doseTime);
  } else if (lowerFreq.includes('three times daily') || lowerFreq.includes('tid')) {
    // Three times daily: 8 AM, 1 PM, 6 PM
    const times = [8, 13, 18];
    times.forEach(hour => {
      const doseTime = new Date(baseTime);
      doseTime.setHours(hour, 0, 0, 0);
      if (doseTime < baseTime) doseTime.setDate(doseTime.getDate() + 1);
      doseTimes.push(doseTime);
    });
  }
  
  // Filter to only return times within the next 24 hours
  const tomorrow = new Date(baseTime.getTime() + 24 * 60 * 60 * 1000);
  return doseTimes.filter(time => time > baseTime && time <= tomorrow);
}