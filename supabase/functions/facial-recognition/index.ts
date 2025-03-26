
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, facialData, patientId } = await req.json();

    // For registering facial data
    if (action === 'register' && patientId && facialData) {
      const { data, error } = await supabaseClient
        .from('patients')
        .update({ facial_data: facialData })
        .eq('id', patientId)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Facial data registered successfully',
          patient: data
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // For identifying patients by facial data
    if (action === 'identify' && facialData) {
      // Get all patients with facial data
      const { data: patients, error } = await supabaseClient
        .from('patients')
        .select('*')
        .not('facial_data', 'is', null);
      
      if (error) throw error;
      
      // In a real implementation, you would use a facial recognition algorithm here
      // For this demo, we're just returning the first patient with facial data
      // as a placeholder for actual facial matching logic
      
      if (patients && patients.length > 0) {
        // Simulate a match with the first patient
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Patient identified',
            patient: patients[0]
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'No matching patient found'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Invalid request'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  } catch (error) {
    console.error('Error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message || 'An error occurred'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
})
