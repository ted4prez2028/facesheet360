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
    const { patientId, providerId, chartType, noteId } = await req.json();

    if (!patientId || !providerId || !chartType) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Define profit amounts (40% patient, 50% provider, 10% admin)
    const totalAmount = 100;
    const patientShare = 40;
    const providerShare = 50;
    const adminShare = 10;

    // Get admin user ID (first admin user)
    const { data: adminData } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin')
      .limit(1)
      .single();

    const adminId = adminData?.user_id;

    // Create profit record
    const { error: profitError } = await supabase
      .from('charting_profits')
      .insert({
        chart_record_id: noteId,
        patient_id: patientId,
        provider_id: providerId,
        chart_type: chartType,
        total_amount: totalAmount,
        patient_share: patientShare,
        provider_share: providerShare,
        admin_share: adminShare,
        status: 'completed'
      });

    if (profitError) throw profitError;

    // Create CareCoins transactions for each party
    const transactions = [
      {
        user_id: patientId,
        to_user_id: patientId,
        amount: patientShare,
        transaction_type: 'earned',
        description: `Charting profit share for ${chartType}`
      },
      {
        user_id: providerId,
        to_user_id: providerId,
        amount: providerShare,
        transaction_type: 'earned',
        description: `Charting provider share for ${chartType}`
      }
    ];

    if (adminId) {
      transactions.push({
        user_id: adminId,
        to_user_id: adminId,
        amount: adminShare,
        transaction_type: 'platform_fee',
        description: `Platform fee for ${chartType} charting`
      });
    }

    const { error: txError } = await supabase
      .from('care_coins_transactions')
      .insert(transactions);

    if (txError) throw txError;

    // Update balances
    const { error: patientBalanceError } = await supabase.rpc('increment_balance', {
      user_id: patientId,
      amount: patientShare
    });

    const { error: providerBalanceError } = await supabase.rpc('increment_balance', {
      user_id: providerId,
      amount: providerShare
    });

    if (adminId) {
      await supabase.rpc('increment_balance', {
        user_id: adminId,
        amount: adminShare
      });
    }

    // Mark note as having CareCoins distributed
    if (noteId) {
      await supabase
        .from('patient_notes')
        .update({ carecoins_distributed: true })
        .eq('id', noteId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        total: totalAmount,
        patient_share: patientShare,
        provider_share: providerShare,
        admin_share: adminShare
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Charting profit error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to distribute charting profits' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});