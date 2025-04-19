
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WoundAnalysisResponse {
  stage: string;
  infection_status: string;
  healing_status: string;
  assessment: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl } = await req.json();
    
    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: "Missing image URL" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Analyzing wound image using OpenAI vision model...");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAIApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "system",
            content: `You are a wound care expert. Analyze the wound image and provide:
            1. Most likely wound stage if applicable (1, 2, 3, 4, unstageable, or deep tissue injury)
            2. Assessment of infection status based on visible signs
            3. Overall healing status assessment
            4. Detailed analysis of wound characteristics including:
               - Wound bed appearance
               - Periwound condition
               - Exudate characteristics if visible
               - Size estimation if possible
               - Any concerning features
            
            Format your response as a JSON object with these keys:
            {
              "stage": "Stage number or classification",
              "infection_status": "Clear statement about infection",
              "healing_status": "Status of healing progression",
              "assessment": "Detailed wound characteristics analysis"
            }`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please analyze this wound image and provide your assessment in the specified JSON format."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.2
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("OpenAI analysis received");
    
    let analysisJson: WoundAnalysisResponse;
    
    try {
      const jsonMatch = data.choices[0]?.message?.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisJson = JSON.parse(jsonMatch[0]);
        console.log("Successfully parsed wound analysis");
      } else {
        throw new Error("Could not find JSON in AI response");
      }
    } catch (e) {
      console.error("Error parsing AI response:", e);
      console.log("Raw AI response:", data.choices[0]?.message?.content);
      
      analysisJson = {
        stage: "Undetermined",
        infection_status: "Assessment incomplete",
        healing_status: "Assessment incomplete",
        assessment: `Error processing analysis. Raw response: ${data.choices[0]?.message?.content.substring(0, 500)}`
      };
    }

    return new Response(
      JSON.stringify(analysisJson),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "Cache-Control": "no-cache" 
        } 
      }
    );
  } catch (error) {
    console.error("Error in wound analysis:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to analyze wound image", 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});
