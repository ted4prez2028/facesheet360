import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { ethers } from 'npm:ethers@6.7.0';

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

    // Get admin user by email tdicusmurray@gmail.com
    const { data: adminData, error: adminError } = await supabase
      .from('profiles')
      .select('id, wallet_address')
      .eq('email', 'tdicusmurray@gmail.com')
      .single();

    if (adminError || !adminData) {
      console.error('Admin user not found:', adminError);
      throw new Error('Admin user tdicusmurray@gmail.com not found');
    }

    const adminId = adminData.id;
    const adminWallet = adminData.wallet_address;

    // Get provider wallet address
    const { data: providerData } = await supabase
      .from('profiles')
      .select('wallet_address')
      .eq('id', providerId)
      .single();

    // Get patient's user_id and wallet address
    const { data: patientRecord } = await supabase
      .from('patients')
      .select('user_id')
      .eq('id', patientId)
      .single();

    let patientUserId = patientRecord?.user_id;
    let patientWallet = null;

    if (patientUserId) {
      const { data: patientProfileData } = await supabase
        .from('profiles')
        .select('wallet_address')
        .eq('id', patientUserId)
        .single();
      
      patientWallet = patientProfileData?.wallet_address;
    }

    // Get CareCoin contract address
    const { data: contractData } = await supabase
      .from('carecoin_contract')
      .select('contract_address')
      .single();

    const contractAddress = contractData?.contract_address;

    // Mint and transfer tokens to MetaMask wallets on Polygon if contract exists
    if (contractAddress) {
      const mintPromises = [];

      // Mint to patient wallet
      if (patientWallet) {
        console.log(`Minting ${patientShare} CARE to patient wallet on Polygon: ${patientWallet}`);
        mintPromises.push(
          supabase.functions.invoke('mint-carecoin', {
            body: {
              contractAddress,
              toAddress: patientWallet,
              amount: patientShare
            }
          })
        );
      }

      // Mint to provider wallet
      if (providerData?.wallet_address) {
        console.log(`Minting ${providerShare} CARE to provider wallet on Polygon: ${providerData.wallet_address}`);
        mintPromises.push(
          supabase.functions.invoke('mint-carecoin', {
            body: {
              contractAddress,
              toAddress: providerData.wallet_address,
              amount: providerShare
            }
          })
        );
      }

      // Mint to admin wallet (founder fee)
      if (adminWallet) {
        console.log(`Minting ${adminShare} CARE to admin wallet on Polygon: ${adminWallet}`);
        mintPromises.push(
          supabase.functions.invoke('mint-carecoin', {
            body: {
              contractAddress,
              toAddress: adminWallet,
              amount: adminShare
            }
          })
        );
      }

      // Execute all mints in parallel
      const mintResults = await Promise.allSettled(mintPromises);
      
      // Log any mint failures but don't block the transaction
      mintResults.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Mint failed for recipient ${index}:`, result.reason);
        } else {
          console.log(`Mint succeeded for recipient ${index} on Polygon network`);
        }
      });
    } else {
      console.warn('CareCoin contract not deployed yet, skipping blockchain minting');
    }

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
    const transactions = [];
    
    if (patientUserId) {
      transactions.push({
        user_id: patientUserId,
        to_user_id: patientUserId,
        amount: patientShare,
        transaction_type: 'earned',
        description: `Charting profit share for ${chartType} (Polygon)`
      });
    }

    transactions.push({
      user_id: providerId,
      to_user_id: providerId,
      amount: providerShare,
      transaction_type: 'earned',
      description: `Charting provider share for ${chartType} (Polygon)`
    });

    transactions.push({
      user_id: adminId,
      to_user_id: adminId,
      amount: adminShare,
      transaction_type: 'platform_fee',
      description: `Platform founder fee for ${chartType} charting (Polygon)`
    });

    const { error: txError } = await supabase
      .from('care_coins_transactions')
      .insert(transactions);

    if (txError) throw txError;

    // Update balances in database
    if (patientUserId) {
      await supabase.rpc('increment_balance', {
        user_id: patientUserId,
        amount: patientShare
      });
    }

    await supabase.rpc('increment_balance', {
      user_id: providerId,
      amount: providerShare
    });

    await supabase.rpc('increment_balance', {
      user_id: adminId,
      amount: adminShare
    });

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
        admin_share: adminShare,
        blockchain_minting: !!contractAddress,
        patient_wallet: patientWallet,
        provider_wallet: providerData?.wallet_address,
        admin_wallet: adminWallet,
        network: 'polygon'
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