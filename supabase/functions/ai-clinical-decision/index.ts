import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ClinicalDecisionRequest {
  patientId: string;
  symptoms?: string[];
  vitals?: Record<string, any>;
  medications?: string[];
  diagnoses?: string[];
  analysisType: 'diagnosis' | 'treatment' | 'interaction' | 'risk';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { patientId, symptoms, vitals, medications, diagnoses, analysisType } = 
      await req.json() as ClinicalDecisionRequest;

    console.log('AI Clinical Decision Support request:', { patientId, analysisType });

    // Get patient medical history
    const { data: patient } = await supabase
      .from('patients')
      .select('*, patient_vitals(*), medication_orders(*), medical_diagnoses(*), allergies(*)')
      .eq('id', patientId)
      .single();

    // Build context for AI
    const context = {
      patient: {
        age: patient?.date_of_birth ? new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear() : null,
        gender: patient?.gender,
        allergies: patient?.allergies || [],
        current_medications: medications || [],
        diagnoses: diagnoses || [],
        vitals: vitals || {},
        symptoms: symptoms || []
      }
    };

    // Call OpenAI API
    const prompt = buildPrompt(analysisType, context);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an AI clinical decision support assistant. Provide evidence-based recommendations but always remind healthcare providers to use their clinical judgment. You do not replace physician oversight.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    const aiData = await response.json();
    const recommendation = aiData.choices[0].message.content;

    // Create clinical alert if severity is high
    if (analysisType === 'risk' || analysisType === 'interaction') {
      const { data: alert } = await supabase
        .from('clinical_alerts')
        .insert({
          patient_id: patientId,
          alert_type: analysisType === 'risk' ? 'high_risk' : 'drug_interaction',
          severity: determineSeverity(recommendation),
          message: recommendation.substring(0, 500),
          details: { full_analysis: recommendation, context },
          resolved: false
        })
        .select()
        .single();

      console.log('Created clinical alert:', alert?.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        recommendation,
        analysisType,
        timestamp: new Date().toISOString(),
        disclaimer: 'This is AI-generated advice. Always use clinical judgment and consult current guidelines.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in ai-clinical-decision:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

function buildPrompt(analysisType: string, context: any): string {
  const { patient } = context;
  
  const baseInfo = `
Patient Information:
- Age: ${patient.age || 'Unknown'}
- Gender: ${patient.gender || 'Unknown'}
- Allergies: ${patient.allergies.length > 0 ? patient.allergies.map((a: any) => a.allergen).join(', ') : 'None documented'}
- Current Medications: ${patient.current_medications.join(', ') || 'None'}
- Current Diagnoses: ${patient.diagnoses.join(', ') || 'None'}
- Recent Vitals: ${JSON.stringify(patient.vitals)}
- Symptoms: ${patient.symptoms.join(', ') || 'None'}
`;

  switch (analysisType) {
    case 'diagnosis':
      return `${baseInfo}\n\nBased on the symptoms and vitals, what are the most likely differential diagnoses? Provide top 3-5 possibilities with reasoning.`;
    
    case 'treatment':
      return `${baseInfo}\n\nWhat are evidence-based treatment recommendations for the current diagnoses? Consider patient's allergies and current medications.`;
    
    case 'interaction':
      return `${baseInfo}\n\nAnalyze potential drug-drug interactions, drug-allergy interactions, and contraindications in the current medication list. Rate severity as mild, moderate, or severe.`;
    
    case 'risk':
      return `${baseInfo}\n\nAssess the patient's risk for: hospital readmission, falls, adverse events, sepsis, and other complications. Provide risk level (low/medium/high) with rationale.`;
    
    default:
      return baseInfo;
  }
}

function determineSeverity(recommendation: string): 'low' | 'medium' | 'high' | 'critical' {
  const lower = recommendation.toLowerCase();
  if (lower.includes('critical') || lower.includes('severe') || lower.includes('immediate')) {
    return 'critical';
  } else if (lower.includes('high risk') || lower.includes('urgent')) {
    return 'high';
  } else if (lower.includes('moderate') || lower.includes('caution')) {
    return 'medium';
  }
  return 'low';
}
