
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider;
  }
}

// CareCoin rewards distribution configuration
export const CARECOIN_REWARDS = {
  PROVIDER_PERCENTAGE: 70,
  PATIENT_PERCENTAGE: 20,
  PLATFORM_PERCENTAGE: 10
};

// Helper function to check if MetaMask is installed
export const isMetaMaskInstalled = (): boolean => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
};

// Helper function to get connected account
export const getConnectedAccount = async (): Promise<string | null> => {
  if (!isMetaMaskInstalled()) {
    return null;
  }
  
  try {
    const accounts = await window.ethereum!.request({ method: 'eth_accounts' });
    return accounts.length > 0 ? accounts[0] : null;
  } catch (error) {
    console.error('Error getting connected account:', error);
    return null;
  }
};

// Simplified ethers v6 compatible implementation
export const connectToMetaMask = async () => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask not found');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    console.log('Connected to MetaMask:', address);
    return { provider, signer, address };
  } catch (error: any) {
    console.error('MetaMask connection error:', error);
    throw new Error(`Failed to connect to MetaMask: ${error.message}`);
  }
};

// Alias for backward compatibility
export const connectMetaMask = async (): Promise<string> => {
  const result = await connectToMetaMask();
  return result.address;
};

export const getCareCoinBalance = async (address: string) => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask not found');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    // Mock implementation - replace with actual contract call
    return ethers.parseEther('100');
  } catch (error: any) {
    console.error('Balance fetch error:', error);
    throw new Error(`Failed to fetch balance: ${error.message}`);
  }
};

export const transferCareCoins = async (to: string, amount: string) => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask not found');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // Mock implementation - replace with actual contract call
    const tx = await signer.sendTransaction({
      to,
      value: ethers.parseEther(amount)
    });

    return tx;
  } catch (error: any) {
    console.error('Transfer error:', error);
    throw new Error(`Failed to transfer: ${error.message}`);
  }
};

export const stakeCareCoins = async (amount: string) => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask not found');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // Mock implementation
    console.log('Staking', amount, 'CareCoins');
    return { hash: 'mock-tx-hash' };
  } catch (error: any) {
    console.error('Staking error:', error);
    throw new Error(`Failed to stake: ${error.message}`);
  }
};

export const unstakeCareCoins = async (amount: string) => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask not found');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // Mock implementation
    console.log('Unstaking', amount, 'CareCoins');
    return { hash: 'mock-tx-hash' };
  } catch (error: any) {
    console.error('Unstaking error:', error);
    throw new Error(`Failed to unstake: ${error.message}`);
  }
};

export const mintCareCoins = async (to: string, amount: string, metadataHash: string) => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask not found');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // Mock implementation
    console.log('Minting', amount, 'CareCoins to', to, 'with metadata:', metadataHash);
    return { hash: 'mock-mint-tx-hash' };
  } catch (error: any) {
    console.error('Minting error:', error);
    throw new Error(`Failed to mint: ${error.message}`);
  }
};
