import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Processing pending CareCoin distributions...');

    // Fetch all pending charting profits
    const { data: pendingProfits, error: fetchError } = await supabase
      .from('charting_profits')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(100); // Process in batches of 100

    if (fetchError) {
      console.error('Error fetching pending profits:', fetchError);
      throw fetchError;
    }

    if (!pendingProfits || pendingProfits.length === 0) {
      console.log('No pending CareCoin distributions to process');
      return new Response(
        JSON.stringify({
          success: true,
          processed: 0,
          message: 'No pending distributions'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${pendingProfits.length} pending distributions to process`);

    let successCount = 0;
    let failureCount = 0;
    const errors: string[] = [];

    // Process each pending profit
    for (const profit of pendingProfits) {
      try {
        console.log(`Processing profit ID ${profit.id} for ${profit.chart_type}`);

        // Call the distribute-charting-profit function
        const { data: distributionResult, error: distributionError } = await supabase.functions.invoke(
          'distribute-charting-profit',
          {
            body: {
              patientId: profit.patient_id,
              providerId: profit.provider_id,
              chartType: profit.chart_type,
              noteId: profit.chart_record_id
            }
          }
        );

        if (distributionError) {
          console.error(`Distribution error for profit ${profit.id}:`, distributionError);
          failureCount++;
          errors.push(`Profit ${profit.id}: ${distributionError.message}`);
          
          // Mark as failed
          await supabase
            .from('charting_profits')
            .update({ status: 'failed' })
            .eq('id', profit.id);
          
          continue;
        }

        if (distributionResult?.success) {
          console.log(`Successfully processed profit ${profit.id}`);
          successCount++;
          
          // Mark as completed
          await supabase
            .from('charting_profits')
            .update({ status: 'completed' })
            .eq('id', profit.id);
        } else {
          console.error(`Distribution failed for profit ${profit.id}:`, distributionResult);
          failureCount++;
          errors.push(`Profit ${profit.id}: Distribution returned success=false`);
          
          // Mark as failed
          await supabase
            .from('charting_profits')
            .update({ status: 'failed' })
            .eq('id', profit.id);
        }

      } catch (error) {
        console.error(`Error processing profit ${profit.id}:`, error);
        failureCount++;
        errors.push(`Profit ${profit.id}: ${error.message}`);
        
        // Mark as failed
        await supabase
          .from('charting_profits')
          .update({ status: 'failed' })
          .eq('id', profit.id);
      }
    }

    const response = {
      success: true,
      processed: successCount + failureCount,
      successCount,
      failureCount,
      errors: errors.length > 0 ? errors : undefined,
      message: `Processed ${successCount} successful, ${failureCount} failed`
    };

    console.log('Processing complete:', response);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Process pending CareCoins error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Failed to process pending CareCoins' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});