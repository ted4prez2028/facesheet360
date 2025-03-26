
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Calculate Euclidean distance between face descriptors
function calculateEuclideanDistance(descriptor1: number[], descriptor2: number[]): number {
  if (descriptor1.length !== descriptor2.length) {
    throw new Error('Descriptors must have the same length');
  }
  
  return Math.sqrt(
    descriptor1.reduce((sum, value, index) => {
      const diff = value - descriptor2[index];
      return sum + diff * diff;
    }, 0)
  );
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
    );

    const requestData = await req.json();
    const { action, faceDescriptor, patientId, facialData } = requestData;

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
    
    // For identifying patients by facial descriptor
    if (action === 'identify' && faceDescriptor) {
      // Get all patients with facial data
      const { data: patients, error } = await supabaseClient
        .from('patients')
        .select('*')
        .not('facial_data', 'is', null);
      
      if (error) throw error;
      
      if (!patients || patients.length === 0) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'No patients with facial data found'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Match the face against stored face descriptors
      let bestMatch = null;
      let lowestDistance = 0.6; // Threshold for face recognition (lower is more strict)
      
      for (const patient of patients) {
        try {
          if (!patient.facial_data) continue;
          
          const storedData = JSON.parse(patient.facial_data);
          if (!storedData.descriptor) continue;
          
          const storedDescriptor = storedData.descriptor;
          const distance = calculateEuclideanDistance(faceDescriptor, storedDescriptor);
          
          console.log(`Distance for patient ${patient.id}: ${distance}`);
          
          if (distance < lowestDistance) {
            lowestDistance = distance;
            bestMatch = patient;
          }
        } catch (err) {
          console.error(`Error processing patient ${patient.id}:`, err);
          continue;
        }
      }
      
      if (bestMatch) {
        console.log('Match found:', bestMatch.id);
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Patient identified',
            patient: bestMatch,
            confidence: 1 - lowestDistance
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
