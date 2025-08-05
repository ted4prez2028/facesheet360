
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider;
  }
}

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
