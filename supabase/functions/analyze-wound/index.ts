
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
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

    console.log("Calling OpenAI API to analyze wound image...");

    // Call OpenAI API to analyze the wound
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAIApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a wound care expert. Analyze the wound image and provide:
            1. Most likely wound stage (if applicable): 1, 2, 3, 4, unstageable, or deep tissue injury
            2. Assessment of whether the wound appears to be infected or not
            3. Overall assessment of healing status
            4. Detailed analysis of wound characteristics
            
            Format your response as a JSON object with the following keys:
            {
              "stage": "The wound stage (e.g., '2', 'Unstageable')",
              "infection_status": "Clear statement about infection (e.g., 'No signs of infection', 'Likely infected')",
              "healing_status": "Status of healing (e.g., 'Good progression', 'Poor healing')",
              "assessment": "Detailed analysis of wound characteristics"
            }
            `
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

    const data = await response.json();
    console.log("OpenAI API response received");
    
    // Extract and parse the JSON response from the AI
    const analysisText = data.choices[0]?.message?.content;
    if (!analysisText) {
      throw new Error("No analysis received from OpenAI");
    }
    
    console.log("Analysis text:", analysisText.substring(0, 100) + "...");
    
    // Extract JSON from the response
    let analysisJson;
    try {
      // Look for JSON in the string (handling cases where the AI might include additional text)
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisJson = JSON.parse(jsonMatch[0]);
        console.log("Successfully parsed AI response as JSON");
      } else {
        throw new Error("Could not find JSON in AI response");
      }
    } catch (e) {
      console.error("Error parsing AI response:", e);
      console.log("Raw AI response:", analysisText);
      
      // Create a fallback response
      analysisJson = {
        stage: "Unknown",
        infection_status: "Assessment incomplete",
        healing_status: "Assessment incomplete",
        assessment: `Unable to parse structured response. Raw analysis: ${analysisText.substring(0, 500)}`
      };
    }

    return new Response(
      JSON.stringify(analysisJson),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error analyzing wound image:", error);
    
    return new Response(
      JSON.stringify({ error: "Failed to analyze wound image", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
