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

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) throw new Error("OpenAI API key not configured");

    console.log('Starting daily pharmacy analysis...');

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
      timeframe: '30 days',
      analysisDate: new Date().toISOString()
    };

    console.log('Analyzing pharmacy data with AI...');

    // Helper function for retry with exponential backoff
    const callOpenAIWithRetry = async (maxRetries = 3) => {
      let lastError;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`OpenAI API call attempt ${attempt}/${maxRetries}`);
          
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
                  content: `You are a healthcare pharmacy AI analyst for an automated daily monitoring system. Analyze pharmacy data and identify urgent issues requiring immediate attention. Focus on:
1. CRITICAL medication refill predictions (medications running low)
2. URGENT adherence patterns (concerning drops in adherence)
3. SAFETY alerts (potential risks to patients)
4. HIGH-PRIORITY inventory issues
5. Cost-saving opportunities

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
                  content: `This is an automated daily analysis. Analyze this pharmacy data and identify urgent issues:\n\n${JSON.stringify(dataSummary, null, 2)}`
                }
              ],
              max_tokens: 2000,
              temperature: 0.7
            })
          });

          if (response.ok) {
            return response;
          }

          // Handle rate limiting specifically
          if (response.status === 429) {
            const retryAfter = response.headers.get('retry-after');
            const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, attempt) * 2000;
            
            if (attempt < maxRetries) {
              console.log(`Rate limited. Waiting ${waitTime}ms before retry ${attempt + 1}...`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
              continue;
            }
            
            lastError = new Error(`OpenAI rate limit exceeded after ${maxRetries} attempts. Your API key may need higher limits or wait for quota reset.`);
            break;
          }

          // For other errors
          const errorText = await response.text();
          console.error(`OpenAI API error (attempt ${attempt}):`, response.status, errorText);
          
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            continue;
          }

          lastError = new Error(`OpenAI API error: ${response.status}`);
          break;

        } catch (error) {
          console.error(`API call attempt ${attempt} failed:`, error);
          lastError = error;
          
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            continue;
          }
        }
      }
      
      throw lastError;
    };

    const response = await callOpenAIWithRetry();

    const aiResult = await response.json();
    const insights = JSON.parse(aiResult.choices[0].message.content);

    console.log('AI insights generated:', insights);

    // Store analytics in database
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
          ai_generated: true,
          automated_analysis: true,
          analysis_date: new Date().toISOString()
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
            ai_generated: true,
            automated_analysis: true,
            analysis_date: new Date().toISOString()
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
      } else {
        console.log(`Stored ${analyticsToInsert.length} analytics records`);
      }
    }

    // Store analysis history
    const { error: historyError } = await supabaseClient
      .from('pharmacy_analysis_history')
      .insert({
        total_insights: analyticsToInsert.length,
        safety_alerts: insights.safetyAlerts?.length || 0,
        refill_predictions: insights.refillPredictions?.length || 0,
        adherence_issues: insights.adherenceInsights?.length || 0,
        run_type: 'automated',
        insights_data: insights
      });

    if (historyError) {
      console.error('Error storing history:', historyError);
    }

    // Send email alerts if there are urgent findings
    const hasUrgentFindings = 
      insights.safetyAlerts?.some((a: any) => a.priority === 'high') ||
      insights.refillPredictions?.some((p: any) => p.urgency === 'high') ||
      insights.adherenceInsights?.length > 0;

    let emailResult = null;
    if (hasUrgentFindings) {
      console.log('Urgent findings detected, sending email alerts...');
      
      const emailResponse = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-pharmacy-alerts`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            insights,
            urgentOnly: false 
          })
        }
      );

      emailResult = await emailResponse.json();
      console.log('Email result:', emailResult);
    }

    return new Response(JSON.stringify({
      success: true,
      insights,
      analyticsStored: analyticsToInsert.length,
      emailsSent: emailResult?.emailsSent || 0,
      totalRecipients: emailResult?.totalRecipients || 0,
      hasUrgentFindings,
      analysisDate: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in daily-pharmacy-analysis:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isRateLimit = errorMessage.includes('Rate limit') || errorMessage.includes('429');
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false,
      retryable: isRateLimit,
      suggestion: isRateLimit 
        ? 'OpenAI rate limit reached. The system will retry automatically on the next scheduled run.' 
        : 'Analysis failed. Check function logs for details.'
    }), {
      status: isRateLimit ? 429 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
