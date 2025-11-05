import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { ethers } from 'npm:ethers@6.7.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ERC-20 mint function ABI
const CARECOIN_ABI = [
  "function mint(address to, uint256 amount) external",
  "function balanceOf(address owner) view returns (uint256)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)"
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contractAddress, toAddress, amount } = await req.json();

    if (!contractAddress || !toAddress || !amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ALCHEMY_API_KEY = Deno.env.get('ALCHEMY_API_KEY');
    const DEPLOYER_PRIVATE_KEY = Deno.env.get('DEPLOYER_PRIVATE_KEY');

    if (!ALCHEMY_API_KEY || !DEPLOYER_PRIVATE_KEY) {
      throw new Error('Missing environment variables');
    }

    // Connect to Ethereum mainnet
    const provider = new ethers.JsonRpcProvider(`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`);
    const wallet = new ethers.Wallet(DEPLOYER_PRIVATE_KEY, provider);

    // Get contract instance
    const contract = new ethers.Contract(contractAddress, CARECOIN_ABI, wallet);

    // Convert amount to wei (assuming 18 decimals)
    const amountInWei = ethers.parseUnits(amount.toString(), 18);

    console.log(`Minting ${amount} CARE tokens to ${toAddress}`);

    // Execute mint transaction
    const tx = await contract.mint(toAddress, amountInWei);
    console.log('Transaction hash:', tx.hash);

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log('Transaction confirmed in block:', receipt.blockNumber);

    // Get updated balance
    const balance = await contract.balanceOf(toAddress);
    const balanceFormatted = ethers.formatUnits(balance, 18);

    return new Response(
      JSON.stringify({
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        mintedAmount: amount,
        recipientAddress: toAddress,
        newBalance: balanceFormatted
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Mint error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to mint tokens' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
