
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
  } catch (error: unknown) {
    console.error('MetaMask connection error:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to connect to MetaMask: ${error.message}`);
    }
    throw new Error('Failed to connect to MetaMask');
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
    const contractAddress = getStoredContractAddress();
    
    if (!contractAddress) {
      throw new Error('CareCoin contract not deployed. Please deploy a contract first.');
    }

    const contract = await getCareCoinContract(provider);
    const balance = await contract.balanceOf(address);
    return balance;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch balance';
    throw new Error(`Failed to fetch CareCoin balance: ${errorMessage}`);
  }
};

export const transferCareCoins = async (to: string, amount: string) => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask not found');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = await getCareCoinContract(signer);
    
    const amountWei = ethers.parseEther(amount);
    const tx = await contract.transfer(to, amountWei);

    return tx;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to transfer';
    throw new Error(`Failed to transfer CareCoins: ${errorMessage}`);
  }
};

export const stakeCareCoins = async (amount: string) => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask not found');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = await getCareCoinContract(signer);
    
    // Check if contract has stake function
    if (!contract.stake) {
      throw new Error('Staking not available. The deployed contract does not support staking.');
    }

    const amountWei = ethers.parseEther(amount);
    const tx = await contract.stake(amountWei);
    
    return tx;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to stake';
    throw new Error(`Failed to stake CareCoins: ${errorMessage}`);
  }
};

export const unstakeCareCoins = async (amount: string) => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask not found');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = await getCareCoinContract(signer);
    
    // Check if contract has unstake function
    if (!contract.unstake) {
      throw new Error('Unstaking not available. The deployed contract does not support unstaking.');
    }

    const amountWei = ethers.parseEther(amount);
    const tx = await contract.unstake(amountWei);
    
    return tx;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to unstake';
    throw new Error(`Failed to unstake CareCoins: ${errorMessage}`);
  }
};

/**
 * Mint CareCoins - This should typically be called from a backend service
 * with proper authorization checks, not directly from the frontend.
 * Frontend minting is only for testing/development purposes.
 */
export const mintCareCoins = async (to: string, amount: string, metadataHash: string) => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask not found');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = await getCareCoinContract(signer);
    
    // Check if contract has mint function and caller has minter role
    if (!contract.mint) {
      throw new Error('Minting not available. The deployed contract does not support minting, or you do not have minter permissions.');
    }

    const amountWei = ethers.parseEther(amount);
    // If contract supports metadata, pass it; otherwise just mint
    const tx = contract.mintWithMetadata 
      ? await contract.mintWithMetadata(to, amountWei, metadataHash)
      : await contract.mint(to, amountWei);
    
    return tx;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to mint';
    throw new Error(`Failed to mint CareCoins: ${errorMessage}`);
  }
};
