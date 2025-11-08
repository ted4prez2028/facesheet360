import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabaseClient.auth.getUser(token);
    
    if (!user) throw new Error("User not authenticated");

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) throw new Error("OpenAI API key not configured");

    // Fetch pharmacy data for analysis
    const { data: inventory } = await supabaseClient
      .from('pharmacy_inventory')
      .select('*')
      .order('quantity', { ascending: true })
      .limit(20);

    const { data: marRecords } = await supabaseClient
      .from('medication_administration_records')
      .select('*')
      .gte('administered_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('administered_at', { ascending: false })
      .limit(100);

    const { data: prescriptionFills } = await supabaseClient
      .from('prescription_fills')
      .select('*')
      .gte('filled_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('filled_at', { ascending: false })
      .limit(50);

    // Calculate adherence metrics
    const adherenceByMed: any = {};
    marRecords?.forEach(record => {
      if (!adherenceByMed[record.medication_name]) {
        adherenceByMed[record.medication_name] = { given: 0, total: 0 };
      }
      adherenceByMed[record.medication_name].total++;
      if (record.status === 'given') {
        adherenceByMed[record.medication_name].given++;
      }
    });

    // Prepare data summary for AI
    const dataSummary = {
      inventory: inventory?.map(item => ({
        medication: item.medication_name,
        quantity: item.quantity,
        location: item.pixis_location,
        expiresAt: item.expires_at
      })),
      adherenceRates: Object.entries(adherenceByMed).map(([med, data]: [string, any]) => ({
        medication: med,
        adherenceRate: ((data.given / data.total) * 100).toFixed(1),
        totalDoses: data.total,
        givenDoses: data.given
      })),
      recentFills: prescriptionFills?.length || 0,
      timeframe: '30 days'
    };

    console.log('Analyzing pharmacy data with AI:', dataSummary);

    // Call OpenAI for intelligent analysis
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a healthcare pharmacy AI analyst helping to make healthcare accessible by optimizing medication management. Analyze pharmacy data and provide actionable insights about:
1. Medication refill predictions (which medications need reordering and when)
2. Adherence patterns (identify concerning trends)
3. Inventory optimization (reduce waste, prevent stockouts)
4. Cost-saving opportunities
5. Patient safety concerns

Return a JSON object with this structure:
{
  "refillPredictions": [{ "medication": "name", "daysUntilReorder": number, "urgency": "high|medium|low", "reasoning": "why" }],
  "adherenceInsights": [{ "medication": "name", "concern": "description", "recommendation": "action" }],
  "inventoryOptimization": [{ "issue": "description", "action": "recommendation", "impact": "benefit" }],
  "costSavings": [{ "opportunity": "description", "estimatedSavings": "amount" }],
  "safetyAlerts": [{ "alert": "description", "priority": "high|medium|low", "action": "required action" }]
}`
          },
          {
            role: 'user',
            content: `Analyze this pharmacy data and provide comprehensive insights:\n\n${JSON.stringify(dataSummary, null, 2)}`
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResult = await response.json();
    const insights = JSON.parse(aiResult.choices[0].message.content);

    console.log('AI insights generated:', insights);

    // Store analytics in database for each refill prediction
    const analyticsToInsert: any[] = [];
    
    insights.refillPredictions?.forEach((pred: any) => {
      analyticsToInsert.push({
        medication_name: pred.medication,
        metric_type: 'refill_prediction',
        metric_value: pred.daysUntilReorder,
        confidence_score: pred.urgency === 'high' ? 0.9 : pred.urgency === 'medium' ? 0.75 : 0.6,
        metadata: {
          urgency: pred.urgency,
          reasoning: pred.reasoning,
          ai_generated: true
        }
      });
    });

    insights.adherenceInsights?.forEach((insight: any) => {
      const medData = adherenceByMed[insight.medication];
      if (medData) {
        analyticsToInsert.push({
          medication_name: insight.medication,
          metric_type: 'adherence_rate',
          metric_value: (medData.given / medData.total) * 100,
          confidence_score: 0.85,
          metadata: {
            concern: insight.concern,
            recommendation: insight.recommendation,
            ai_generated: true
          }
        });
      }
    });

    if (analyticsToInsert.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('pharmacy_analytics')
        .insert(analyticsToInsert);

      if (insertError) {
        console.error('Error storing analytics:', insertError);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      insights,
      analyticsStored: analyticsToInsert.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-pharmacy-insights:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
