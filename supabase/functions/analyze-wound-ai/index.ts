import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user) throw new Error("User not authenticated");

    const { imageBase64, patientId, woundLocation, woundSize } = await req.json();

    // Analyze wound using OpenAI Vision API
    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "system",
            content: "You are a wound care specialist AI. Analyze wound images and provide detailed assessments including healing stage, infection risk, treatment recommendations. Return JSON with: stage, severity, healingProgress, infectionRisk, recommendations (array), treatmentPlan."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this wound image. Location: ${woundLocation}, Size: ${woundSize}. Provide detailed analysis and treatment recommendations.`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      })
    });

    const aiResult = await openAIResponse.json();
    const analysis = JSON.parse(aiResult.choices[0].message.content);

    // Save analysis to database
    const { data: woundAssessment, error } = await supabaseClient
      .from('wound_assessments')
      .insert({
        patient_id: patientId,
        assessed_by: user.id,
        location: woundLocation,
        size: woundSize,
        ai_analysis: analysis,
        stage: analysis.stage,
        severity: analysis.severity,
        healing_progress: analysis.healingProgress,
        infection_risk: analysis.infectionRisk,
        recommendations: analysis.recommendations,
        treatment_plan: analysis.treatmentPlan
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(woundAssessment), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});