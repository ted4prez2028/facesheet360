
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { patientData } = await req.json();
    
    if (!patientData) {
      return new Response(
        JSON.stringify({ error: 'Patient data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare prompt with patient information
    const systemPrompt = `You are an AI healthcare assistant. Based on the provided patient information, 
    generate a comprehensive care plan with the following sections:
    1. Assessment summary
    2. Treatment goals
    3. Recommended interventions
    4. Follow-up schedule
    5. Health metrics to monitor
    6. Lifestyle recommendations
    Format the response in markdown.`;

    const userPrompt = `Generate a care plan for a patient with the following information:
    Name: ${patientData.first_name} ${patientData.last_name}
    Gender: ${patientData.gender}
    Date of Birth: ${patientData.date_of_birth}
    Medical Record Number: ${patientData.medical_record_number || 'Not available'}
    Diagnosis: ${patientData.diagnosis || 'Not available'}
    Vital Signs: ${JSON.stringify(patientData.vitalSigns || {})}
    Condition: ${patientData.condition || 'Not specified'}
    Medications: ${(patientData.medications && patientData.medications.length) ? 
      patientData.medications.join(', ') : 'None recorded'}
    Medical History: ${(patientData.medicalHistory && patientData.medicalHistory.length) ? 
      patientData.medicalHistory.join(', ') : 'None recorded'}
    Allergies: ${(patientData.allergies && patientData.allergies.length) ? 
      patientData.allergies.join(', ') : 'None recorded'}`;

    console.log("Sending request to OpenAI with patient data");
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const carePlan = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ carePlan }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating care plan:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
