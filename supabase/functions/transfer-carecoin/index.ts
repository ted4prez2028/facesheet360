import { ethers } from "https://esm.sh/ethers@6.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// CareCoin contract ABI for transfer
const CARECOIN_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)"
];

async function transferTokens(contractAddress: string, recipientAddress: string, amount: string) {
  try {
    const alchemyApiKey = Deno.env.get('ALCHEMY_API_KEY');
    const deployerPrivateKey = Deno.env.get('DEPLOYER_PRIVATE_KEY');

    if (!alchemyApiKey || !deployerPrivateKey) {
      throw new Error('Missing environment variables');
    }

    console.log(`Starting token transfer of ${amount} CARE tokens`);
    console.log(`From contract: ${contractAddress}`);
    console.log(`To address: ${recipientAddress}`);

    const provider = new ethers.JsonRpcProvider(`https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`);
    const wallet = new ethers.Wallet(deployerPrivateKey, provider);

    // Connect to the CareCoin contract
    const contract = new ethers.Contract(contractAddress, CARECOIN_ABI, wallet);

    // Convert amount to wei (assuming 18 decimals)
    const amountWei = ethers.parseEther(amount);

    console.log(`Sending ${amount} tokens (${amountWei.toString()} wei)`);

    // Check balance before transfer
    const balance = await contract.balanceOf(wallet.address);
    console.log(`Sender balance: ${ethers.formatEther(balance)} CARE`);

    if (balance < amountWei) {
      throw new Error(`Insufficient balance. Have: ${ethers.formatEther(balance)}, Need: ${amount}`);
    }

    // Perform the transfer
    const tx = await contract.transfer(recipientAddress, amountWei);
    console.log(`Transfer transaction sent: ${tx.hash}`);

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log(`Transfer confirmed in block: ${receipt.blockNumber}`);

    return {
      success: true,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      amount,
      recipient: recipientAddress
    };

  } catch (error) {
    console.error('Transfer error:', error);
    return {
      success: false,
      error: error.message,
      details: error.toString()
    };
  }
}

Deno.serve(async (req) => {
  console.log('CareCoin transfer function called');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contractAddress, recipientAddress, amount } = await req.json();

    if (!contractAddress || !recipientAddress || !amount) {
      throw new Error('Missing required parameters: contractAddress, recipientAddress, amount');
    }

    // Start the transfer as a background task
    EdgeRuntime.waitUntil(
      transferTokens(contractAddress, recipientAddress, amount).then(result => {
        console.log('Background transfer result:', result);
      })
    );

    // Return immediate response
    return new Response(JSON.stringify({
      success: true,
      message: `Transfer of ${amount} CARE tokens to ${recipientAddress} initiated in background`,
      status: 'processing'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Function error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});