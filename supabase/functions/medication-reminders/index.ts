import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    console.log('Starting medication reminder check...');
    
    // Get current time
    const now = new Date();
    const currentHour = now.getHours();
    
    // Get all active medications that need reminders
    const { data: medications, error: medError } = await supabase
      .from('medication_orders')
      .select(`
        *,
        patients:patient_id (
          id,
          first_name,
          last_name,
          room_number
        ),
        patient_assignments!patient_assignments_patient_id_fkey (
          assigned_to,
          role,
          users:assigned_to (
            id,
            name,
            email
          )
        )
      `)
      .eq('status', 'active');
    
    if (medError) throw medError;
    
    console.log(`Found ${medications?.length || 0} active medications`);
    
    // Check each medication and send reminders to assigned nurses
    const notifications = [];
    
    for (const med of medications || []) {
      // Determine if reminder is needed based on frequency
      const needsReminder = checkFrequencyMatch(med.frequency, currentHour);
      
      if (needsReminder && med.patient_assignments) {
        // Find assigned nurses
        const nurses = med.patient_assignments
          .filter((assignment: any) => assignment.role === 'nurse')
          .map((assignment: any) => assignment.users);
        
        for (const nurse of nurses) {
          if (nurse) {
            notifications.push({
              user_id: nurse.id,
              type: 'medication_reminder',
              title: 'Medication Due',
              message: `${med.patients.first_name} ${med.patients.last_name} (Room ${med.patients.room_number || 'N/A'}) - ${med.medication_name} ${med.dosage} is due`,
              event_id: med.id,
              event_time: now.toISOString()
            });
          }
        }
      }
    }
    
    // Insert notifications
    if (notifications.length > 0) {
      const { error: notifError } = await supabase
        .from('notifications')
        .insert(notifications);
      
      if (notifError) throw notifError;
      
      console.log(`Created ${notifications.length} medication reminders`);
    } else {
      console.log('No medication reminders needed at this time');
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        reminders_sent: notifications.length,
        message: `Processed ${medications?.length || 0} medications, sent ${notifications.length} reminders`
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in medication-reminders function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

function checkFrequencyMatch(frequency: string, currentHour: number): boolean {
  const freq = frequency.toLowerCase();
  
  // Every 4 hours: 0, 4, 8, 12, 16, 20
  if (freq.includes('every 4 hours') || freq.includes('q4h')) {
    return currentHour % 4 === 0;
  }
  
  // Every 6 hours: 0, 6, 12, 18
  if (freq.includes('every 6 hours') || freq.includes('q6h')) {
    return currentHour % 6 === 0;
  }
  
  // Every 8 hours: 0, 8, 16
  if (freq.includes('every 8 hours') || freq.includes('q8h')) {
    return currentHour % 8 === 0;
  }
  
  // Every 12 hours: 0, 12
  if (freq.includes('every 12 hours') || freq.includes('q12h')) {
    return currentHour % 12 === 0;
  }
  
  // Once daily: 8 AM
  if (freq.includes('once daily') || freq.includes('qd') || freq.includes('daily')) {
    return currentHour === 8;
  }
  
  // Twice daily: 8 AM, 8 PM
  if (freq.includes('twice daily') || freq.includes('bid')) {
    return currentHour === 8 || currentHour === 20;
  }
  
  // Three times daily: 8 AM, 2 PM, 8 PM
  if (freq.includes('three times') || freq.includes('tid')) {
    return currentHour === 8 || currentHour === 14 || currentHour === 20;
  }
  
  // Four times daily: 6 AM, 12 PM, 6 PM, 12 AM
  if (freq.includes('four times') || freq.includes('qid')) {
    return currentHour === 6 || currentHour === 12 || currentHour === 18 || currentHour === 0;
  }
  
  return false;
}
