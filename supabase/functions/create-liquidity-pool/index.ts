import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { ethers } from 'npm:ethers@6.7.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Uniswap V3 addresses on Polygon
const UNISWAP_V3_FACTORY = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
const UNISWAP_V3_POSITION_MANAGER = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";
const USDC_ADDRESS = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"; // USDC on Polygon

// ABIs
const FACTORY_ABI = [
  "function createPool(address tokenA, address tokenB, uint24 fee) external returns (address pool)",
  "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)"
];

const POOL_ABI = [
  "function initialize(uint160 sqrtPriceX96) external",
  "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)"
];

const POSITION_MANAGER_ABI = [
  "function mint((address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint256 amount0Desired, uint256 amount1Desired, uint256 amount0Min, uint256 amount1Min, address recipient, uint256 deadline)) external payable returns (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)",
  "function positions(uint256 tokenId) external view returns (uint96 nonce, address operator, address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)"
];

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { careAmount, usdcAmount } = await req.json();

    if (!careAmount || !usdcAmount) {
      return new Response(
        JSON.stringify({ error: 'Missing careAmount or usdcAmount' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const polygonRpcUrl = Deno.env.get('POLYGON_RPC_URL');
    const deployerPrivateKey = Deno.env.get('POLYGON_DEPLOYER_PRIVATE_KEY');

    if (!polygonRpcUrl || !deployerPrivateKey) {
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

    const factory = new ethers.Contract(UNISWAP_V3_FACTORY, FACTORY_ABI, wallet);
    const positionManager = new ethers.Contract(UNISWAP_V3_POSITION_MANAGER, POSITION_MANAGER_ABI, wallet);

    // Check if pool already exists
    const fee = 3000; // 0.3% fee tier
    let poolAddress = await factory.getPool(careTokenAddress, USDC_ADDRESS, fee);

    if (poolAddress === ethers.ZeroAddress) {
      console.log('Creating new Uniswap V3 pool...');
      const createTx = await factory.createPool(careTokenAddress, USDC_ADDRESS, fee);
      const receipt = await createTx.wait();
      console.log('Pool created:', receipt.hash);

      poolAddress = await factory.getPool(careTokenAddress, USDC_ADDRESS, fee);
      console.log('Pool address:', poolAddress);

      // Initialize pool with initial price (1 CARE = 0.50 USDC)
      const pool = new ethers.Contract(poolAddress, POOL_ABI, wallet);
      
      // Calculate sqrtPriceX96 for 1 CARE = 0.50 USDC
      // sqrtPriceX96 = sqrt(price) * 2^96
      // price = USDC / CARE = 0.5
      // sqrt(0.5) ≈ 0.7071
      const sqrtPriceX96 = ethers.parseUnits('0.7071', 96).toString();
      
      console.log('Initializing pool with price...');
      const initTx = await pool.initialize(sqrtPriceX96);
      await initTx.wait();
      console.log('Pool initialized');
    } else {
      console.log('Pool already exists at:', poolAddress);
    }

    // Approve tokens
    const careContract = new ethers.Contract(careTokenAddress, ERC20_ABI, wallet);
    const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, wallet);

    const careAmountWei = ethers.parseUnits(careAmount.toString(), 18);
    const usdcAmountWei = ethers.parseUnits(usdcAmount.toString(), 6); // USDC has 6 decimals

    console.log('Approving CARE tokens...');
    const careApproveTx = await careContract.approve(UNISWAP_V3_POSITION_MANAGER, careAmountWei);
    await careApproveTx.wait();

    console.log('Approving USDC tokens...');
    const usdcApproveTx = await usdcContract.approve(UNISWAP_V3_POSITION_MANAGER, usdcAmountWei);
    await usdcApproveTx.wait();

    // Determine token order (Uniswap requires token0 < token1)
    const token0 = careTokenAddress.toLowerCase() < USDC_ADDRESS.toLowerCase() ? careTokenAddress : USDC_ADDRESS;
    const token1 = careTokenAddress.toLowerCase() < USDC_ADDRESS.toLowerCase() ? USDC_ADDRESS : careTokenAddress;
    const amount0 = token0 === careTokenAddress ? careAmountWei : usdcAmountWei;
    const amount1 = token1 === careTokenAddress ? careAmountWei : usdcAmountWei;

    // Add liquidity
    console.log('Adding liquidity to pool...');
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes
    
    const mintTx = await positionManager.mint({
      token0: token0,
      token1: token1,
      fee: fee,
      tickLower: -887220, // Full range liquidity
      tickUpper: 887220,
      amount0Desired: amount0,
      amount1Desired: amount1,
      amount0Min: 0,
      amount1Min: 0,
      recipient: wallet.address,
      deadline: deadline
    });

    const receipt = await mintTx.wait();
    console.log('Liquidity added:', receipt.hash);

    // Store pool info in database
    const { error: dbError } = await supabase
      .from('carecoin_contract')
      .update({
        contract_details: {
          ...contractData.contract_details,
          uniswap_pool: poolAddress,
          liquidity_added: true,
          initial_care_liquidity: careAmount,
          initial_usdc_liquidity: usdcAmount
        }
      })
      .eq('contract_address', careTokenAddress);

    if (dbError) {
      console.error('Database update error:', dbError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        poolAddress: poolAddress,
        transactionHash: receipt.hash,
        careAmount: careAmount,
        usdcAmount: usdcAmount,
        initialPrice: 0.50,
        network: 'polygon',
        explorerUrl: `https://polygonscan.com/tx/${receipt.hash}`,
        message: `Liquidity pool created with ${careAmount} CARE and ${usdcAmount} USDC!`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Liquidity pool creation error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create liquidity pool' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});