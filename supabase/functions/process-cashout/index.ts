import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const { amount, paymentMethod, accountInfo } = await req.json();

    console.log('Processing cashout request:', { userId: user.id, amount, paymentMethod });

    // Validate input
    if (!amount || amount <= 0) {
      throw new Error('Invalid amount');
    }

    if (!paymentMethod) {
      throw new Error('Payment method is required');
    }

    if (!accountInfo || Object.keys(accountInfo).length === 0) {
      throw new Error('Account information is required');
    }

    // Get exchange rate
    const exchangeRate = 0.5; // 1 CareCoin = $0.50 USD

    // Calculate USD amount
    const usdAmount = amount * exchangeRate;

    // Get user's current balance
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('care_coins_balance')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw new Error('Failed to fetch user balance');
    }

    // Check if user has sufficient balance
    if (!profile || profile.care_coins_balance < amount) {
      throw new Error('Insufficient CareCoins balance');
    }

    // Create cashout request
    const { data: cashoutRequest, error: cashoutError } = await supabaseClient
      .from('cashout_requests')
      .insert([{
        user_id: user.id,
        amount,
        usd_amount: usdAmount,
        exchange_rate: exchangeRate,
        payment_method: paymentMethod,
        account_info: accountInfo,
        status: 'pending',
      }])
      .select()
      .single();

    if (cashoutError) {
      console.error('Error creating cashout request:', cashoutError);
      throw new Error('Failed to create cashout request');
    }

    // Create transaction record
    const { error: transactionError } = await supabaseClient
      .from('care_coins_transactions')
      .insert([{
        user_id: user.id,
        from_user_id: user.id,
        amount: -amount,
        transaction_type: 'withdrawal',
        description: `Cash out request: ${amount} CareCoins to ${paymentMethod}`,
        status: 'pending',
      }]);

    if (transactionError) {
      console.error('Error creating transaction:', transactionError);
      throw new Error('Failed to create transaction record');
    }

    // Deduct from user balance
    const { error: updateError } = await supabaseClient.rpc('increment_balance', {
      user_id: user.id,
      amount: -amount,
    });

    if (updateError) {
      console.error('Error updating balance:', updateError);
      throw new Error('Failed to update balance');
    }

    console.log('Cashout request created successfully:', cashoutRequest.id);

    return new Response(
      JSON.stringify({
        success: true,
        cashout_request_id: cashoutRequest.id,
        usd_amount: usdAmount,
        message: 'Cash out request submitted successfully. Processing time: 3-5 business days.',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in process-cashout function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});