/**
 * Secure CareCoin Minting Service
 * Backend service for secure token minting with proper authorization
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { ethers } from 'https://esm.sh/ethers@6.7.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MintRequest {
  userId: string;
  amount: string;
  reason: string;
  metadataHash?: string;
  recipientAddress?: string;
}

interface MintResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  amount?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Verify user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Parse request
    const mintRequest: MintRequest = await req.json();
    
    // Validate request
    if (!mintRequest.userId || !mintRequest.amount || !mintRequest.reason) {
      throw new Error('Missing required fields');
    }

    // Verify user has permission to mint (check role)
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // Only admins or authorized minters can mint
    const authorizedRoles = ['admin', 'minter'];
    if (!profile || !authorizedRoles.includes(profile.role)) {
      throw new Error('Insufficient permissions');
    }

    // Get recipient address
    let recipientAddress = mintRequest.recipientAddress;
    if (!recipientAddress) {
      // Get from user profile
      const { data: recipientProfile } = await supabaseClient
        .from('profiles')
        .select('wallet_address')
        .eq('id', mintRequest.userId)
        .single();

      if (!recipientProfile?.wallet_address) {
        throw new Error('Recipient wallet address not found');
      }
      recipientAddress = recipientProfile.wallet_address;
    }

    // Validate recipient address
    if (!ethers.isAddress(recipientAddress)) {
      throw new Error('Invalid recipient address');
    }

    // Get contract address and ABI
    const contractAddress = Deno.env.get('CARECOIN_CONTRACT_ADDRESS');
    if (!contractAddress) {
      throw new Error('CareCoin contract address not configured');
    }

    // Get deployer private key (should be in secure storage)
    const deployerPrivateKey = Deno.env.get('CARECOIN_DEPLOYER_PRIVATE_KEY');
    if (!deployerPrivateKey) {
      throw new Error('Deployer private key not configured');
    }

    // Initialize provider and signer
    const rpcUrl = Deno.env.get('POLYGON_RPC_URL') || Deno.env.get('ETHEREUM_RPC_URL');
    if (!rpcUrl) {
      throw new Error('RPC URL not configured');
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const signer = new ethers.Wallet(deployerPrivateKey, provider);

    // Get contract instance
    const contractABI = [
      "function mint(address to, uint256 amount, string reason) returns (bool)",
      "function balanceOf(address owner) view returns (uint256)",
    ];

    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    // Check daily mint limit
    // (This would need to be implemented in the contract or tracked separately)

    // Convert amount to wei
    const amountWei = ethers.parseEther(mintRequest.amount);

    // Mint tokens
    const tx = await contract.mint(recipientAddress, amountWei, mintRequest.reason);
    const receipt = await tx.wait();

    // Record transaction in database
    await supabaseClient.from('care_coins_transactions').insert({
      user_id: mintRequest.userId,
      from_user_id: null, // Minted from contract
      to_user_id: mintRequest.userId,
      amount: parseFloat(mintRequest.amount),
      transaction_type: 'mint',
      transaction_hash: receipt.hash,
      reason: mintRequest.reason,
      metadata_hash: mintRequest.metadataHash,
      status: 'completed',
    });

    // Update user balance
    const newBalance = await contract.balanceOf(recipientAddress);
    await supabaseClient
      .from('profiles')
      .update({
        care_coins_balance: parseFloat(ethers.formatEther(newBalance)),
        updated_at: new Date().toISOString(),
      })
      .eq('id', mintRequest.userId);

    const result: MintResult = {
      success: true,
      transactionHash: receipt.hash,
      amount: mintRequest.amount,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Minting error:', error);
    
    const result: MintResult = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});

