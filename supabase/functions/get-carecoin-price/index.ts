import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { ethers } from 'npm:ethers@6.7.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Uniswap V3 Pool ABI
const POOL_ABI = [
  "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
  "function token0() external view returns (address)",
  "function token1() external view returns (address)"
];

// Chainlink Price Feed ABI (for MATIC/USD as backup)
const CHAINLINK_ABI = [
  "function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
  "function decimals() external view returns (uint8)"
];

const USDC_ADDRESS = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"; // USDC on Polygon
const MATIC_USD_FEED = "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0"; // Chainlink MATIC/USD on Polygon

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const polygonRpcUrl = Deno.env.get('POLYGON_RPC_URL');

    if (!polygonRpcUrl) {
      throw new Error('Missing POLYGON_RPC_URL');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get CareCoin contract and pool info
    const { data: contractData } = await supabase
      .from('carecoin_contract')
      .select('contract_address, contract_details')
      .single();

    if (!contractData) {
      throw new Error('CareCoin contract not deployed');
    }

    const poolAddress = contractData.contract_details?.uniswap_pool;

    if (!poolAddress) {
      // No pool exists yet, return default price
      return new Response(
        JSON.stringify({
          success: true,
          price: 0.50,
          source: 'default',
          message: 'Liquidity pool not yet created. Using default price of $0.50 per CARE token.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching price from Uniswap V3 pool...');
    const provider = new ethers.JsonRpcProvider(polygonRpcUrl);
    const pool = new ethers.Contract(poolAddress, POOL_ABI, provider);

    // Get pool slot0 data
    const slot0 = await pool.slot0();
    const sqrtPriceX96 = slot0[0];

    // Get token addresses from pool
    const token0 = await pool.token0();
    const token1 = await pool.token1();

    // Calculate price from sqrtPriceX96
    // price = (sqrtPriceX96 / 2^96)^2
    const sqrtPrice = Number(sqrtPriceX96) / (2 ** 96);
    let price = sqrtPrice * sqrtPrice;

    // Adjust for token decimals (CARE has 18, USDC has 6)
    price = price * (10 ** 12);

    // If CARE is token1, invert the price
    if (token1.toLowerCase() === contractData.contract_address.toLowerCase()) {
      price = 1 / price;
    }

    console.log('Current CARE price from Uniswap:', price);

    // Get Chainlink MATIC/USD price as reference
    const chainlinkFeed = new ethers.Contract(MATIC_USD_FEED, CHAINLINK_ABI, provider);
    const roundData = await chainlinkFeed.latestRoundData();
    const decimals = await chainlinkFeed.decimals();
    const maticUsdPrice = Number(roundData[1]) / (10 ** Number(decimals));

    console.log('Current MATIC/USD price from Chainlink:', maticUsdPrice);

    // Store price history in database
    await supabase
      .from('care_coins_transactions')
      .insert({
        user_id: null,
        amount: 0,
        transaction_type: 'price_update',
        description: `Market price: $${price.toFixed(4)} per CARE (via Uniswap V3)`
      });

    return new Response(
      JSON.stringify({
        success: true,
        price: price,
        priceFormatted: `$${price.toFixed(4)}`,
        source: 'uniswap_v3',
        poolAddress: poolAddress,
        maticUsdPrice: maticUsdPrice,
        timestamp: new Date().toISOString(),
        network: 'polygon'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Price fetch error:', error);
    
    // Return fallback price on error
    return new Response(
      JSON.stringify({
        success: true,
        price: 0.50,
        source: 'fallback',
        error: error.message,
        message: 'Using fallback price due to fetch error'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});