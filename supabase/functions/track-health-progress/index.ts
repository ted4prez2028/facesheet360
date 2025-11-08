import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { patientId, activityType, metadata } = await req.json();

    console.log(`📊 Tracking health progress for patient ${patientId}: ${activityType}`);

    // Get patient's active health goals
    const { data: goals, error: goalsError } = await supabase
      .from('health_goals')
      .select('*')
      .eq('patient_id', patientId)
      .eq('status', 'active');

    if (goalsError) throw goalsError;

    if (!goals || goals.length === 0) {
      console.log('No active goals found for patient');
      return new Response(
        JSON.stringify({ message: 'No active goals to track' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Track progress based on activity type
    let updatedGoals = 0;

    for (const goal of goals) {
      let shouldIncrement = false;

      switch (activityType) {
        case 'appointment_completed':
          if (goal.goal_type === 'appointment_attendance') {
            shouldIncrement = true;
          }
          break;

        case 'medication_taken':
          if (goal.goal_type === 'medication_adherence') {
            shouldIncrement = true;
          }
          break;

        case 'vitals_recorded':
          if (goal.goal_type === 'vital_signs_tracking') {
            shouldIncrement = true;
          }
          break;

        case 'therapy_attended':
          if (goal.goal_type === 'therapy_attendance') {
            shouldIncrement = true;
          }
          break;
      }

      if (shouldIncrement) {
        const newValue = goal.current_value + 1;
        const isCompleted = newValue >= goal.target_value;

        const { error: updateError } = await supabase
          .from('health_goals')
          .update({
            current_value: newValue,
            status: isCompleted ? 'completed' : 'active',
            completed_at: isCompleted ? new Date().toISOString() : null,
          })
          .eq('id', goal.id);

        if (updateError) {
          console.error('Error updating goal:', updateError);
        } else {
          updatedGoals++;
          console.log(`✅ Updated goal: ${goal.title} (${newValue}/${goal.target_value})`);

          if (isCompleted) {
            console.log(`🎉 Goal completed! ${goal.reward_amount} CareCoins awarded`);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        goalsUpdated: updatedGoals,
        message: `Updated ${updatedGoals} health goal(s)`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error tracking health progress:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to track health progress' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
