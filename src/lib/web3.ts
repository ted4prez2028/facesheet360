
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider;
  }
}

// Sepolia testnet configuration
export const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111 in decimal
export const SEPOLIA_NETWORK = {
  chainId: SEPOLIA_CHAIN_ID,
  chainName: 'Sepolia Testnet',
  nativeCurrency: {
    name: 'Sepolia ETH',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: ['https://sepolia.infura.io/v3/', 'https://rpc.sepolia.org'],
  blockExplorerUrls: ['https://sepolia.etherscan.io']
};

export const getProvider = () => {
  if (window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return null;
};

export const getSigner = async () => {
  const provider = getProvider();
  if (provider) {
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    return signer;
  }
  return null;
};

// Contract storage for deployed CareCoin contracts
export const getStoredContractAddress = (): string | null => {
  return localStorage.getItem('carecoin_contract_address');
};

export const storeContractAddress = (address: string, abi: string[]): void => {
  localStorage.setItem('carecoin_contract_address', address);
  localStorage.setItem('carecoin_contract_abi', JSON.stringify(abi));
};

export const clearStoredContract = (): void => {
  localStorage.removeItem('carecoin_contract_address');
  localStorage.removeItem('carecoin_contract_abi');
};

export const getStoredContractABI = (): string[] => {
  const stored = localStorage.getItem('carecoin_contract_abi');
  return stored ? JSON.parse(stored) : [
    // Default ERC-20 ABI
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function transferFrom(address from, address to, uint256 amount) returns (bool)",
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "event Approval(address indexed owner, address indexed spender, uint256 value)"
  ];
};

export const getCareCoinContract = async (signerOrProvider: ethers.Signer | ethers.Provider) => {
  const contractAddress = getStoredContractAddress();
  
  if (!contractAddress) {
    throw new Error('No CareCoin contract deployed yet. Please deploy a contract first.');
  }
  
  const contractABI = getStoredContractABI();
  return new ethers.Contract(contractAddress, contractABI, signerOrProvider);
};

// Switch to Sepolia network
export const switchToSepolia = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SEPOLIA_CHAIN_ID }],
    });
    return true;
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [SEPOLIA_NETWORK],
        });
        return true;
      } catch (addError) {
        console.error('Error adding Sepolia network:', addError);
        throw addError;
      }
    }
    throw switchError;
  }
};

// Get current chain ID
export const getCurrentChainId = async (): Promise<string> => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }
  return await window.ethereum.request({ method: 'eth_chainId' }) as string;
};

// Check if on Sepolia
export const isOnSepolia = async (): Promise<boolean> => {
  const chainId = await getCurrentChainId();
  return chainId === SEPOLIA_CHAIN_ID;
};

// Get MetaMask balance for CareCoin token
export const getTokenBalance = async (tokenAddress: string, walletAddress: string): Promise<string> => {
  const provider = getProvider();
  if (!provider) {
    throw new Error('No provider available');
  }

  const contract = new ethers.Contract(
    tokenAddress,
    ['function balanceOf(address owner) view returns (uint256)'],
    provider
  );

  const balance = await contract.balanceOf(walletAddress);
  return ethers.formatEther(balance);
};

// MetaMask integration helpers
export const addTokenToMetaMask = async (tokenAddress: string, tokenSymbol: string, tokenDecimals: number) => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    const wasAdded = await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: tokenAddress,
          symbol: tokenSymbol,
          decimals: tokenDecimals,
        },
      },
    });

    return wasAdded;
  } catch (error) {
    console.error('Error adding token to MetaMask:', error);
    throw error;
  }
};
