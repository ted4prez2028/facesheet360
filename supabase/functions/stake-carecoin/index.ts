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
    const { contractAddress, amount } = await req.json();

    if (!contractAddress || !amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Calculate staking rewards (7% APY)
    const stakingPeriodDays = 30;
    const apy = 0.07;
    const dailyRate = apy / 365;
    const expectedRewards = Number(amount) * dailyRate * stakingPeriodDays;

    const unlockDate = new Date();
    unlockDate.setDate(unlockDate.getDate() + stakingPeriodDays);

    // Record staking transaction
    const { error: stakingError } = await supabase
      .from('care_coins_transactions')
      .insert({
        from_user_id: user.id,
        amount: Number(amount),
        transaction_type: 'stake',
        description: `Staked ${amount} CARE tokens for ${stakingPeriodDays} days at 7% APY`,
        reward_category: 'staking',
        metadata: {
          staking_period_days: stakingPeriodDays,
          apy: apy,
          expected_rewards: expectedRewards,
          unlock_date: unlockDate.toISOString(),
          contract_address: contractAddress
        }
      });

    if (stakingError) throw stakingError;

    return new Response(
      JSON.stringify({
        success: true,
        stakedAmount: amount,
        stakingPeriodDays: stakingPeriodDays,
        apy: apy * 100,
        expectedRewards: expectedRewards.toFixed(2),
        unlockDate: unlockDate.toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Staking error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to stake tokens' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
