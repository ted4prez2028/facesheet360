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

    const { patientId, symptoms, medicalHistory, currentMedications } = await req.json();

    // Generate AI care plan using OpenAI
    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a healthcare AI assistant. Generate a comprehensive care plan based on patient information. Return a JSON object with title, description, goals (array), and interventions (array)."
          },
          {
            role: "user",
            content: `Create a care plan for a patient with the following information:
            Symptoms: ${symptoms}
            Medical History: ${medicalHistory}
            Current Medications: ${currentMedications}
            
            Please provide a structured care plan with clear goals and interventions.`
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    const aiResult = await openAIResponse.json();
    const careplanContent = JSON.parse(aiResult.choices[0].message.content);

    // Save care plan to database
    const { data: carePlan, error } = await supabaseClient
      .from('care_plans')
      .insert({
        patient_id: patientId,
        created_by: user.id,
        title: careplanContent.title,
        description: careplanContent.description,
        goals: careplanContent.goals,
        interventions: careplanContent.interventions,
        ai_generated: true,
        start_date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(carePlan), {
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