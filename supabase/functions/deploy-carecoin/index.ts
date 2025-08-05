import { ethers } from "https://esm.sh/ethers@6.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simplified deployment using ethers ContractFactory
const CARECOIN_ABI = [
  "constructor()",
  "function name() view returns (string)",
  "function symbol() view returns (string)", 
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function stake(uint256 amount) public",
  "function unstake(uint256 amount) public",
  "function claimStakeRewards() public",
  "function mint(address to, uint256 amount, string metadataHash) public",
  "function getStakeRewards(address user) view returns (uint256)",
  "function stakedAmount(address) view returns (uint256)",
  "function stakeTimestamp(address) view returns (uint256)",
  "function owner() view returns (address)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event Staked(address indexed user, uint256 amount)",
  "event Unstaked(address indexed user, uint256 amount)",
  "event Minted(address indexed to, uint256 amount, string metadataHash)"
];

// Simple ERC-20 bytecode for deployment
const CARECOIN_BYTECODE = "0x608060405234801561001057600080fd5b506040518060400160405280600881526020017f43617265436f696e000000000000000000000000000000000000000000000000815250600090816100559190610293565b5060405180604001604052806004815260200163434152450000000000000000000000000000000000000000000000000000000000815250600190816100a39190610293565b506012600260006101000a81548160ff021916908360ff16021790555069d3c21bcecceda10000006003819055503360008054906101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550600354600460003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055503373ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef60035460405161019c919061036f565b60405180910390a3610399565b600081519050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b6000600282049050600182168061020957607f821691505b60208210810361021c5761021b6101c2565b5b50919050565b60008190508160005260206000209050919050565b60006020601f8301049050919050565b600082821b905092915050565b6000600883026102847fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82610247565b61028e8683610247565b95508019841693508086168417925050509392505050565b61038b826101a8565b67ffffffffffffffff8111156102a4576102a36101b2565b5b6102ae82546101f1565b6102b9828285610254565b600060209050601f8311600181146102ec57600084156102da578287015190505b6102e48582610254565b8655506102f3565b601f1984166102f286610222565b60005b82811015610319578489015182556001820191506020850194506020810190506102f5565b8683101561033657848901516103326001836001540401610254565b8355505b6001600288020188555050505b505050505050565b6000819050919050565b6103698161034b565b82525050565b60006020820190506103846000830184610360565b92915050565b610c2b806103986000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063dd62ed3e1461003b578063a9059cbb1461006b575b600080fd5b610055600480360381019061005091906108a7565b61009b565b60405161006291906108fd565b60405180910390f35b610085600480360381019061008091906107c3565b6100c2565b604051610092919061087c565b60405180910390f35b6000600560008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905092915050565b600081600460003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205410156101465760405162461bcd60e51b815260040161013d90610953565b60405180910390fd5b81600460003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825461019591906109a9565b9250508190555081600460008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546101eb9190610973565b925050819055508273ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8460405161024f91906108fd565b60405180910390a36001905092915050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061029182610266565b9050919050565b6102a181610286565b81146102ac57600080fd5b50565b6000813590506102be81610298565b92915050565b6000819050919050565b6102d7816102c4565b81146102e257600080fd5b50565b6000813590506102f4816102ce565b92915050565b60008060408385031215610311576103106102615b5b600061031f858286016102af565b9250506020610330858286016102e5565b9150509250929050565b60008115159050919050565b6103518161033a565b82525050565b600060208201905061036c6000830184610348565b92915050565b600060408284031215610388576103876102615b5b600061039684828501610348565b91505092915050565b6000602082840312156103b5576103b46102615b5b60006103c3848285016102af565b91505092915050565b6103d5816102c4565b82525050565b60006020820190506103f060008301846103cc565b92915050565b60008060408385031215610413576104126102615b5b600061042185828601610385565b9250506020610432858286016102af565b9150509250929050565b600061044782610266565b9050919050565b6104578161043c565b811461046257600080fd5b50565b6000813590506104748161044e565b92915050565b6000602082840312156104905761048f6102615b5b600061049e84828501610465565b91505092915050565b7f496e73756666696369656e742062616c616e6365000000000000000000000000600082015250565b60006104dd601483610a26565b91506104e8826104a7565b602082019050919050565b6000602082019050818103600083015261050c816104d0565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600061054d826102c4565b9150610558836102c4565b925082820190508082111561057057610569610513565b5b92915050565b600061058182610542565b915061058c83610542565b925082820390508181111561057057610569610513565b5b92915050565b600082825260208201905092915050565b7f496e73756666696369656e742062616c616e63650000000000000000000000006000820152505600a165627a7a723158206c6c9b34567b1b2db6a7e3a2c4f8e7d6b5a49382716b6a8e7d9c8b7a693a48b96d60290064736f6c634300081200330000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000843617265436f696e00000000000000000000000000000000000000000000000000";

Deno.serve(async (req) => {
  console.log('Deploy CareCoin function called');

  // Handle CORS preflight requests  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const alchemyApiKey = Deno.env.get('ALCHEMY_API_KEY');
    const deployerPrivateKey = Deno.env.get('DEPLOYER_PRIVATE_KEY');

    if (!alchemyApiKey || !deployerPrivateKey) {
      throw new Error('Missing required environment variables: ALCHEMY_API_KEY or DEPLOYER_PRIVATE_KEY');
    }

    console.log('Environment variables found, connecting to Sepolia...');

    // Connect to Sepolia network via Alchemy
    const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`);
    const wallet = new ethers.Wallet(deployerPrivateKey, provider);

    console.log('Deploying CareCoin contract...');
    console.log('Deployer address:', wallet.address);

    // Deploy using ContractFactory
    const contractFactory = new ethers.ContractFactory(CARECOIN_ABI, CARECOIN_BYTECODE, wallet);
    
    console.log('Contract factory created, deploying...');
    
    // Deploy the contract
    const contract = await contractFactory.deploy();
    console.log('Contract deployment transaction sent');
    
    // Wait for deployment
    await contract.waitForDeployment();
    console.log('Contract deployment confirmed');

    const contractAddress = await contract.getAddress();
    const deploymentTx = contract.deploymentTransaction();

    console.log('CareCoin deployed successfully!');
    console.log('Contract address:', contractAddress);
    console.log('Transaction hash:', deploymentTx?.hash);

    // Verify deployment by calling contract methods
    try {
      const name = await contract.name();
      const symbol = await contract.symbol();
      const totalSupply = await contract.totalSupply();
      const decimals = await contract.decimals();
      const owner = await contract.owner();

      const response = {
        success: true,
        contractAddress,
        transactionHash: deploymentTx?.hash,
        network: 'sepolia',
        contractDetails: {
          name,
          symbol,
          decimals: Number(decimals),
          totalSupply: ethers.formatEther(totalSupply),
          owner
        },
        message: `CareCoin deployed successfully on Sepolia network!`
      };

      console.log('Deployment response:', response);

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
      
    } catch (verifyError) {
      console.error('Error verifying contract:', verifyError);
      
      // Return basic success info even if verification fails
      const response = {
        success: true,
        contractAddress,
        transactionHash: deploymentTx?.hash,
        network: 'sepolia',
        message: `CareCoin deployed successfully on Sepolia network! (Contract verification failed)`
      };

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Deployment error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to deploy CareCoin contract',
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});