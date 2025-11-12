import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { ethers } from 'npm:ethers@6.7.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Uniswap V3 Router ABI (Polygon)
const UNISWAP_ROUTER_ABI = [
  "function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)",
  "function exactOutputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountOut, uint256 amountInMaximum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountIn)"
];

// ERC-20 ABI for approve
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)"
];

// USDC address on Polygon
const USDC_ADDRESS = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, careAmount, usdcAmount } = await req.json();

    if (!action || (!careAmount && !usdcAmount)) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const polygonRpcUrl = Deno.env.get('POLYGON_RPC_URL');
    const deployerPrivateKey = Deno.env.get('POLYGON_DEPLOYER_PRIVATE_KEY');
    const uniswapRouterAddress = Deno.env.get('UNISWAP_ROUTER_ADDRESS');

    if (!polygonRpcUrl || !deployerPrivateKey || !uniswapRouterAddress) {
      throw new Error('Missing required environment variables');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get CareCoin contract address
    const { data: contractData } = await supabase
      .from('carecoin_contract')
      .select('contract_address')
      .single();

    if (!contractData) {
      throw new Error('CareCoin contract not deployed');
    }

    const careTokenAddress = contractData.contract_address;

    console.log('Connecting to Polygon network...');
    const provider = new ethers.JsonRpcProvider(polygonRpcUrl);
    const wallet = new ethers.Wallet(deployerPrivateKey, provider);

    const uniswapRouter = new ethers.Contract(uniswapRouterAddress, UNISWAP_ROUTER_ABI, wallet);

    if (action === 'buy') {
      // Buy CARE tokens with USDC
      const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, wallet);
      const usdcAmountWei = ethers.parseUnits(usdcAmount.toString(), 6); // USDC has 6 decimals

      // Approve USDC spend
      console.log('Approving USDC spend...');
      const approveTx = await usdcContract.approve(uniswapRouterAddress, usdcAmountWei);
      await approveTx.wait();

      // Execute swap
      console.log('Swapping USDC for CARE tokens...');
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes
      const swapTx = await uniswapRouter.exactInputSingle({
        tokenIn: USDC_ADDRESS,
        tokenOut: careTokenAddress,
        fee: 3000, // 0.3% fee tier
        recipient: wallet.address,
        deadline: deadline,
        amountIn: usdcAmountWei,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0
      });

      const receipt = await swapTx.wait();
      console.log('Swap completed:', receipt.hash);

      return new Response(
        JSON.stringify({
          success: true,
          action: 'buy',
          transactionHash: receipt.hash,
          usdcSpent: usdcAmount,
          network: 'polygon',
          explorerUrl: `https://polygonscan.com/tx/${receipt.hash}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'sell') {
      // Sell CARE tokens for USDC
      const careContract = new ethers.Contract(careTokenAddress, ERC20_ABI, wallet);
      const careAmountWei = ethers.parseUnits(careAmount.toString(), 18);

      // Approve CARE spend
      console.log('Approving CARE spend...');
      const approveTx = await careContract.approve(uniswapRouterAddress, careAmountWei);
      await approveTx.wait();

      // Execute swap
      console.log('Swapping CARE tokens for USDC...');
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
      const swapTx = await uniswapRouter.exactInputSingle({
        tokenIn: careTokenAddress,
        tokenOut: USDC_ADDRESS,
        fee: 3000,
        recipient: wallet.address,
        deadline: deadline,
        amountIn: careAmountWei,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0
      });

      const receipt = await swapTx.wait();
      console.log('Swap completed:', receipt.hash);

      return new Response(
        JSON.stringify({
          success: true,
          action: 'sell',
          transactionHash: receipt.hash,
          careSold: careAmount,
          network: 'polygon',
          explorerUrl: `https://polygonscan.com/tx/${receipt.hash}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'get_price') {
      // Get current CARE/USDC price from Uniswap pool
      // This would require additional pool query logic
      return new Response(
        JSON.stringify({
          success: true,
          price: 0.50, // Placeholder - implement actual price oracle
          network: 'polygon'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Uniswap operation error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to execute Uniswap operation' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});