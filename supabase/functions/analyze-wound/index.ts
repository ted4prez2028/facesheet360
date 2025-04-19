
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Parse the request body to get the wound ID
    const { wound_id } = await req.json();
    
    if (!wound_id) {
      return new Response(JSON.stringify({ error: "Missing wound ID" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    // Get the wound data
    const { data: woundData, error: woundError } = await supabase
      .from('wounds')
      .select('*')
      .eq('id', wound_id)
      .single();
      
    if (woundError) {
      return new Response(JSON.stringify({ error: `Failed to get wound data: ${woundError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    // Placeholder for AI analysis - in a real implementation this would call an AI service
    // This simulates what an AI model might return as analysis
    const aiAnalysisResults = {
      stage: ["I", "II", "III", "IV", "Unstageable"][Math.floor(Math.random() * 5)],
      infection_status: Math.random() > 0.7 ? "Infected" : "Not infected",
      healing_status: ["Not healing", "Early healing", "Progressing", "Almost healed"][Math.floor(Math.random() * 4)],
      assessment: `This appears to be a ${Math.random() > 0.5 ? 'pressure' : 'diabetic'} wound with ${
        Math.random() > 0.6 ? 'good' : 'concerning'
      } tissue condition. ${
        Math.random() > 0.7 ? 'The surrounding skin shows signs of inflammation. ' : ''
      }Recommended to ${
        Math.random() > 0.5 ? 'continue current treatment' : 'consider wound care consultation'
      }.`
    };
    
    // Update the wound record with the AI analysis
    const { error: updateError } = await supabase
      .from('wounds')
      .update({
        stage: aiAnalysisResults.stage,
        infection_status: aiAnalysisResults.infection_status,
        healing_status: aiAnalysisResults.healing_status,
        assessment: aiAnalysisResults.assessment,
        updated_at: new Date().toISOString()
      })
      .eq('id', wound_id);
      
    if (updateError) {
      return new Response(JSON.stringify({ error: `Failed to update wound with analysis: ${updateError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    // Return the analysis results
    return new Response(JSON.stringify({ 
      success: true,
      wound_id,
      analysis: aiAnalysisResults
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
