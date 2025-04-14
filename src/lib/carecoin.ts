
import { toast } from 'sonner';
import { ethers } from 'ethers';

// Define contract ABI for CareCoins ERC-20 token
// This would be the actual ABI for your deployed token
const CareCoinsABI = [
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  
  // Read functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  
  // Write functions
  "function transfer(address to, uint256 value) returns (bool)",
  "function approve(address spender, uint256 value) returns (bool)",
  "function transferFrom(address from, address to, uint256 value) returns (bool)",
  "function mintReward(address provider, address patient, address platform) returns (bool)"
];

// CareCoin reward configuration
export const CARECOIN_REWARDS = {
  PROVIDER_PERCENTAGE: 60, // 60% goes to healthcare provider
  PATIENT_PERCENTAGE: 30,  // 30% goes to patient
  PLATFORM_PERCENTAGE: 10  // 10% goes to platform owner
};

// Check if MetaMask is installed
export const isMetaMaskInstalled = () => {
  return typeof window !== 'undefined' && window.ethereum !== undefined;
};

// Get Ethereum provider
export const getProvider = () => {
  if (!isMetaMaskInstalled()) {
    return null;
  }
  
  try {
    return new ethers.providers.Web3Provider(window.ethereum);
  } catch (error) {
    console.error('Error getting provider:', error);
    return null;
  }
};

// Connect to MetaMask
export const connectMetaMask = async () => {
  if (!isMetaMaskInstalled()) {
    toast.error('MetaMask is not installed. Please install MetaMask to use CareCoins.');
    return null;
  }
  
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (accounts.length > 0) {
      toast.success('Wallet connected successfully');
      return accounts[0];
    }
    return null;
  } catch (error: any) {
    console.error('Error connecting to MetaMask:', error);
    
    // Handle different MetaMask errors
    if (error.code === 4001) {
      // User rejected the request
      toast.error('Connection request was rejected. Please try again.');
    } else if (error.code === -32002) {
      // Request already pending
      toast.error('A connection request is already pending. Please check MetaMask.');
    } else {
      toast.error('Failed to connect to MetaMask. Please try again.');
    }
    
    return null;
  }
};

// Get connected account
export const getConnectedAccount = async () => {
  if (!isMetaMaskInstalled()) return null;
  
  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    return accounts.length > 0 ? accounts[0] : null;
  } catch (error) {
    console.error('Error getting MetaMask account:', error);
    return null;
  }
};

// Get current balance of native token (ETH, Matic, etc.)
export const getBalance = async (address: string) => {
  if (!isMetaMaskInstalled() || !address) return '0';
  
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(address);
    return ethers.utils.formatEther(balance);
  } catch (error) {
    console.error('Error getting balance:', error);
    return '0';
  }
};

// Get CareCoins token balance (This would require a deployed ERC-20 contract)
export const getCareCoinsTokenBalance = async (address: string, contractAddress: string) => {
  if (!isMetaMaskInstalled() || !address || !contractAddress) return '0';
  
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, CareCoinsABI, provider);
    const balance = await contract.balanceOf(address);
    return ethers.utils.formatUnits(balance, 18); // Assuming 18 decimals for the token
  } catch (error) {
    console.error('Error getting CareCoins token balance:', error);
    return '0';
  }
};

// Issue CareCoin rewards when data is entered into the EHR
export const issueDataEntryReward = async (
  contractAddress: string, 
  providerAddress: string, 
  patientAddress: string, 
  platformAddress: string, 
  amount: string = "1.0" // Default is 1 CareCoin per data entry
) => {
  if (!isMetaMaskInstalled()) {
    toast.error('MetaMask is not installed.');
    return false;
  }
  
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    
    // Create contract instance
    const contract = new ethers.Contract(contractAddress, CareCoinsABI, signer);
    
    // Convert amount to token units (with decimals)
    const tokenDecimals = await contract.decimals();
    const amountInTokenUnits = ethers.utils.parseUnits(amount, tokenDecimals);
    
    // Show pending toast
    const pendingToastId = toast.loading('Issuing CareCoins rewards...');
    
    // Mint rewards to each party based on percentages
    const txResponse = await contract.mintReward(providerAddress, patientAddress, platformAddress);
    
    // Wait for transaction to be mined
    const receipt = await txResponse.wait();
    
    // Update toast based on transaction status
    if (receipt.status === 1) {
      toast.success(`Successfully issued CareCoins rewards`, {
        id: pendingToastId,
        description: `Provider: ${CARECOIN_REWARDS.PROVIDER_PERCENTAGE}%, Patient: ${CARECOIN_REWARDS.PATIENT_PERCENTAGE}%, Platform: ${CARECOIN_REWARDS.PLATFORM_PERCENTAGE}%`
      });
      return true;
    } else {
      toast.error('Transaction failed', {
        id: pendingToastId,
      });
      return false;
    }
  } catch (error: any) {
    console.error('Error issuing CareCoins:', error);
    toast.error(error.message || 'Failed to issue CareCoins. Please try again.');
    return false;
  }
};

// Transfer native tokens (ETH, Matic, etc.)
export const sendTransaction = async (toAddress: string, amount: string) => {
  if (!isMetaMaskInstalled()) {
    toast.error('MetaMask is not installed.');
    return false;
  }
  
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const fromAddress = await signer.getAddress();
    
    // Convert amount to wei
    const amountWei = ethers.utils.parseEther(amount);
    
    // Create transaction
    const tx = {
      to: toAddress,
      value: amountWei,
      from: fromAddress,
      // We'll let MetaMask handle gas estimation
    };
    
    // Send transaction
    const txResponse = await signer.sendTransaction(tx);
    
    // Show pending toast
    const pendingToastId = toast.loading('Transaction pending...');
    
    // Wait for transaction to be mined
    const receipt = await txResponse.wait();
    
    // Update toast based on transaction status
    if (receipt.status === 1) {
      toast.success(`Successfully sent ${amount} tokens to ${toAddress.slice(0, 6)}...${toAddress.slice(-4)}`, {
        id: pendingToastId,
      });
      return true;
    } else {
      toast.error('Transaction failed', {
        id: pendingToastId,
      });
      return false;
    }
  } catch (error: any) {
    console.error('Error sending transaction:', error);
    
    // Handle specific errors
    if (error.code === 4001) {
      toast.error('Transaction was rejected by the user');
    } else if (error.code === -32603) {
      toast.error('Transaction underpriced. Consider increasing gas limit or price');
    } else {
      toast.error(error.message || 'Failed to send transaction. Please try again.');
    }
    
    return false;
  }
};

// Transfer CareCoins tokens (This would require a deployed ERC-20 contract)
export const transferCareCoinsToken = async (
  contractAddress: string,
  toAddress: string,
  amount: string
) => {
  if (!isMetaMaskInstalled()) {
    toast.error('MetaMask is not installed.');
    return false;
  }
  
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    
    // Create contract instance
    const contract = new ethers.Contract(contractAddress, CareCoinsABI, signer);
    
    // Convert amount to token units (with decimals)
    const tokenDecimals = await contract.decimals();
    const amountInTokenUnits = ethers.utils.parseUnits(amount, tokenDecimals);
    
    // Show pending toast for approval
    const pendingToastId = toast.loading('Sending CareCoins...');
    
    // Send transfer transaction
    const txResponse = await contract.transfer(toAddress, amountInTokenUnits);
    
    // Wait for transaction to be mined
    const receipt = await txResponse.wait();
    
    // Update toast based on transaction status
    if (receipt.status === 1) {
      toast.success(`Successfully sent ${amount} CareCoins to ${toAddress.slice(0, 6)}...${toAddress.slice(-4)}`, {
        id: pendingToastId,
      });
      return true;
    } else {
      toast.error('Transaction failed', {
        id: pendingToastId,
      });
      return false;
    }
  } catch (error: any) {
    console.error('Error sending CareCoins:', error);
    
    if (error.code === 4001) {
      toast.error('Transaction was rejected by the user');
    } else {
      toast.error(error.message || 'Failed to send CareCoins. Please try again.');
    }
    
    return false;
  }
};

// Switch to a different network
export const switchNetwork = async (chainId: string) => {
  if (!isMetaMaskInstalled()) {
    toast.error('MetaMask is not installed.');
    return false;
  }
  
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
    });
    
    return true;
  } catch (error: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (error.code === 4902) {
      toast.error('This network is not available in your MetaMask, please add it manually');
    } else {
      console.error('Error switching network:', error);
      toast.error('Failed to switch network');
    }
    
    return false;
  }
};

// Add a network to MetaMask
export const addNetwork = async (
  chainId: string,
  chainName: string,
  rpcUrl: string,
  blockExplorerUrl: string,
  nativeCurrency: { name: string; symbol: string; decimals: number }
) => {
  if (!isMetaMaskInstalled()) {
    toast.error('MetaMask is not installed.');
    return false;
  }
  
  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId,
          chainName,
          rpcUrls: [rpcUrl],
          blockExplorerUrls: [blockExplorerUrl],
          nativeCurrency,
        },
      ],
    });
    
    return true;
  } catch (error) {
    console.error('Error adding network:', error);
    toast.error('Failed to add network to MetaMask');
    return false;
  }
};

// Add a listener for account changes
export const addAccountChangeListener = (callback: (accounts: string[]) => void) => {
  if (isMetaMaskInstalled()) {
    window.ethereum.on('accountsChanged', callback);
    return true;
  }
  return false;
};

// Add a listener for chain changes
export const addChainChangeListener = (callback: (chainId: string) => void) => {
  if (isMetaMaskInstalled()) {
    window.ethereum.on('chainChanged', callback);
    return true;
  }
  return false;
};

// Remove MetaMask event listeners
export const removeMetaMaskListeners = () => {
  if (isMetaMaskInstalled()) {
    window.ethereum.removeAllListeners('accountsChanged');
    window.ethereum.removeAllListeners('chainChanged');
  }
};

// Add environment declarations for TypeScript
declare global {
  interface Window {
    ethereum: any;
  }
}
