
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
    // Check if OpenAI API key is configured
    if (!openAIApiKey) {
      console.error('OpenAI API key is not configured in environment variables');
      return new Response(
        JSON.stringify({ 
          error: 'OpenAI API key is not configured. Please add OPENAI_API_KEY to your Supabase project secrets.' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { patientData } = await req.json();
    
    if (!patientData) {
      return new Response(
        JSON.stringify({ error: 'Patient data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare prompt with patient information including notes
    const systemPrompt = `You are an AI healthcare assistant. Based on the provided patient information, 
    generate a comprehensive care plan with the following sections:
    1. Assessment summary
    2. Treatment goals
    3. Recommended interventions
    4. Follow-up schedule
    5. Health metrics to monitor
    6. Lifestyle recommendations
    
    Pay special attention to the recent clinical notes and incorporate insights from these notes into your care plan.
    Format the response in markdown.`;

    // Format recent notes for the prompt
    const recentNotesText = patientData.recentNotes && patientData.recentNotes.length > 0
      ? `Recent clinical notes:\n${patientData.recentNotes.map(note => 
          `- Date: ${note.date}\n  Type: ${note.type}\n  Content: ${note.content}`
        ).join('\n\n')}`
      : 'No recent clinical notes available.';

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
      patientData.allergies.join(', ') : 'None recorded'}
    
    ${recentNotesText}`;

    console.log("Sending request to OpenAI with patient data and notes");
    
    try {
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
    } catch (openAIError) {
      console.error('Error calling OpenAI API:', openAIError);
      
      // Return a more user-friendly fallback plan if OpenAI fails
      const fallbackPlan = generateFallbackCarePlan(patientData);
      
      return new Response(
        JSON.stringify({ 
          carePlan: fallbackPlan,
          warning: "Generated using fallback template due to AI service error."
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error generating care plan:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Fallback function to generate a basic care plan template when OpenAI API fails
function generateFallbackCarePlan(patientData) {
  const patientName = `${patientData.first_name} ${patientData.last_name}`;
  const today = new Date().toISOString().split('T')[0];
  
  // Include notes summary if available
  const notesSection = patientData.recentNotes && patientData.recentNotes.length > 0
    ? `\n\n## Recent Notes Summary\n${patientData.recentNotes.slice(0, 2).map(note => 
        `- ${new Date(note.date).toLocaleDateString()}: ${note.content.substring(0, 100)}...`
      ).join('\n')}`
    : '';
  
  return `# Care Plan for ${patientName}
  
## Assessment Summary
Patient is a ${patientData.gender} born on ${patientData.date_of_birth}. 
${patientData.condition ? `Current condition: ${patientData.condition}` : 'Current condition requires clinical assessment.'}
${notesSection}

## Treatment Goals
1. Assess current health status
2. Establish baseline measurements
3. Develop personalized health maintenance plan

## Recommended Interventions
1. Complete physical examination
2. Basic laboratory workup
3. Review of current medications and supplements
4. Lifestyle assessment

## Follow-up Schedule
- Initial follow-up: 2 weeks from initial visit
- Regular check-ups: Every 3 months
- Annual comprehensive evaluation

## Health Metrics to Monitor
- Blood pressure
- Weight
- Medication adherence
- Symptom changes

## Lifestyle Recommendations
- Maintain balanced nutrition
- Regular physical activity as tolerated
- Adequate sleep hygiene
- Stress management techniques

*Note: This is a basic template care plan. Please consult with healthcare provider for personalized medical advice.*

Generated on: ${today}`;
}
