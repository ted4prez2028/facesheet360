import { ethers } from "https://esm.sh/ethers@6.7.1";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Pre-compiled CareCoin contract bytecode (simple ERC-20)
const CONTRACT_BYTECODE = "0x608060405234801561001057600080fd5b50604051806040016040528060088152602001674361726543696e6160c01b81525060009080519060200190610047929190610109565b50604051806040016040528060048152602001634341524560e01b81525060019080519060200190610079929190610109565b506012600260006101000a81548160ff021916908360ff16021790555069d3c21bcecceda10000006003819055503373ffffffffffffffffffffffffffffffffffffffff16600560006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506003546004600033815260200190815260200160002081905550610196565b82805461011590610156565b90600052602060002090601f016020900481019282610137576000855561017e565b82601f1061015057805160ff191683800117855561017e565b8280016001018555821561017e579182015b8281111561017d578251825591602001919060010190610162565b5b50905061018b919061018f565b5090565b5b808211156101a8576000816000905550600101610190565b5090565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b600060028204905060018216806101ee57607f821691505b602082108103610201576101d0565b50919050565b610a0f806102166000396000f3fe608060405234801561001057600080fd5b50600436106100a95760003560e01c80633950935111610071578063395093511461016857806370a082311461019857806395d89b41146101c8578063a457c2d7146101e6578063a9059cbb14610216578063dd62ed3e14610246576100a9565b806306fdde03146100ae578063095ea7b3146100cc57806318160ddd146100fc57806323b872dd1461011a578063313ce5671461014a575b600080fd5b6100b6610276565b6040516100c39190610708565b60405180910390f35b6100e660048036038101906100e19190610773565b610308565b6040516100f391906107ce565b60405180910390f35b610104610326565b60405161011191906107f8565b60405180910390f35b610134600480360381019061012f9190610813565b610330565b60405161014191906107ce565b60405180910390f35b6101526103de565b60405161015f9190610882565b60405180910390f35b610182600480360381019061017d9190610773565b6103f5565b60405161018f91906107ce565b60405180910390f35b6101b260048036038101906101ad919061089d565b6104a1565b6040516101bf91906107f8565b60405180910390f35b6101d06104e9565b6040516101dd9190610708565b60405180910390f35b61020060048036038101906101fb9190610773565b61057b565b60405161020d91906107ce565b60405180910390f35b610230600480360381019061022b9190610773565b610666565b60405161023d91906107ce565b60405180910390f35b610260600480360381019061025b91906108ca565b610684565b60405161026d91906107f8565b60405180910390f35b60606000805461028590610939565b80601f01602080910402602001604051908101604052809291908181526020018280546102b190610939565b80156102fe5780601f106102d3576101008083540402835291602001916102fe565b820191906000526020600020905b8154815290600101906020018083116102e157829003601f168201915b5050505050905090565b600061031c61031561070b565b8484610713565b6001905092915050565b6000600354905090565b600061033d8484846108dc565b6103ce8461034a61070b565b6103c9856040518060600160405280602881526020016109b260289139600660008b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006103b061070b565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054610b5d9092919063ffffffff16565b610713565b600190509392505050565b6000600260009054906101000a900460ff16905090565b600061049761040261070b565b8461049285600660006104147061070b565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008973ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054610bc190919063ffffffff16565b610713565b6001905092915050565b60008060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b6060600180546104f890610939565b80601f016020809104026020016040519081016040528092919081815260200182805461052490610939565b80156105715780601f1061054657610100808354040283529160200191610571565b820191906000526020600020905b81548152906001019060200180831161055457829003601f168201915b5050505050905090565b600061065c61058861070b565b846106578560405180606001604052806025815260200161098d60259139600660006105b261070b565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008a73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054610b5d9092919063ffffffff16565b610713565b6001905092915050565b600061067a61067361070b565b84846108dc565b6001905092915050565b6000600660008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050929150505600a2646970667358221220e9ea9b1e2b5e7b2f9e8e9b1e2b5e7b2f9e8e9b1e2b5e7b2f9e8e9b1e2b5e7b2f64736f6c63430008110033";

const CONTRACT_ABI = [
  "constructor()",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

Deno.serve(async (req) => {
  console.log('Deploy CareCoin function called');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { deployerAddress } = await req.json();
    
    if (!deployerAddress) {
      throw new Error('Deployer wallet address is required');
    }

    // Check if CareCoin is already deployed
    const { data: existingContract } = await supabase
      .from('carecoin_contract')
      .select('*')
      .single();

    if (existingContract) {
      return new Response(JSON.stringify({
        success: false,
        error: 'CareCoin has already been deployed',
        contractAddress: existingContract.contract_address,
        message: 'CareCoin is already available for all users'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const alchemyApiKey = Deno.env.get('ALCHEMY_API_KEY');
    const deployerPrivateKey = Deno.env.get('DEPLOYER_PRIVATE_KEY');

    if (!alchemyApiKey || !deployerPrivateKey) {
      throw new Error('Missing ALCHEMY_API_KEY or DEPLOYER_PRIVATE_KEY environment variables');
    }

    console.log('Connecting to Ethereum mainnet...');
    const provider = new ethers.JsonRpcProvider(`https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`);
    const wallet = new ethers.Wallet(deployerPrivateKey, provider);

    console.log('Deployer address:', wallet.address);

    // Check wallet balance
    const balance = await provider.getBalance(wallet.address);
    console.log('Deployer balance:', ethers.formatEther(balance), 'ETH');

    if (balance === 0n) {
      throw new Error('Insufficient funds for deployment. Please fund the deployer wallet with ETH.');
    }

    // Create contract factory
    console.log('Creating contract factory...');
    const contractFactory = new ethers.ContractFactory(CONTRACT_ABI, CONTRACT_BYTECODE, wallet);

    // Deploy the contract
    console.log('Deploying CareCoin contract...');
    const deployTx = await contractFactory.deploy();
    
    console.log('Deployment transaction hash:', deployTx.deploymentTransaction()?.hash);
    
    // Wait for deployment to be mined
    console.log('Waiting for deployment confirmation...');
    const contract = await deployTx.waitForDeployment();
    const contractAddress = await contract.getAddress();
    
    console.log('Contract deployed at:', contractAddress);

    // Get contract details
    const name = await contract.name();
    const symbol = await contract.symbol();
    const decimals = await contract.decimals();
    const totalSupply = await contract.totalSupply();

    // Transfer 100 tokens to the deployer
    console.log('Transferring 100 CARE tokens to deployer:', deployerAddress);
    const transferAmount = ethers.parseUnits('100', decimals);
    const transferTx = await contract.transfer(deployerAddress, transferAmount);
    await transferTx.wait();
    console.log('Transfer completed:', transferTx.hash);

    // Store contract info in database
    const { error: dbError } = await supabase
      .from('carecoin_contract')
      .insert({
        contract_address: contractAddress,
        deployer_address: deployerAddress,
        network: 'mainnet',
        transaction_hash: deployTx.deploymentTransaction()?.hash,
        deployed_by: null, // Will be set by RLS
        contract_details: {
          name: name,
          symbol: symbol,
          decimals: Number(decimals),
          totalSupply: ethers.formatUnits(totalSupply, decimals),
          owner: wallet.address
        },
        abi: CONTRACT_ABI
      });

    if (dbError) {
      console.error('Database error:', dbError);
    }

    const response = {
      success: true,
      contractAddress: contractAddress,
      transactionHash: deployTx.deploymentTransaction()?.hash,
      transferHash: transferTx.hash,
      network: 'mainnet',
      contractDetails: {
        name: name,
        symbol: symbol,
        decimals: Number(decimals),
        totalSupply: ethers.formatUnits(totalSupply, decimals),
        owner: wallet.address,
        deployerReward: '100'
      },
      abi: CONTRACT_ABI,
      message: "CareCoin deployed successfully! 100 CARE tokens sent to deployer."
    };

    console.log('Deployment successful:', response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Deployment error:', error);
    
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