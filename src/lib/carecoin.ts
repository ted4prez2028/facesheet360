
import { toast } from 'sonner';

// Check if MetaMask is installed
export const isMetaMaskInstalled = () => {
  return typeof window !== 'undefined' && window.ethereum !== undefined;
};

// Connect to MetaMask
export const connectMetaMask = async () => {
  if (!isMetaMaskInstalled()) {
    toast.error('MetaMask is not installed. Please install MetaMask to use CareCoins.');
    return null;
  }
  
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return accounts[0];
  } catch (error) {
    console.error('Error connecting to MetaMask:', error);
    toast.error('Failed to connect to MetaMask. Please try again.');
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

// Transfer CareCoins (this would be integrated with actual smart contract calls)
export const transferCareCoins = async (toAddress: string, amount: number) => {
  try {
    // In a real implementation, this would call a smart contract method
    // For this demo, we'll just simulate a successful transfer
    
    // Simulate a blockchain delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success(`Successfully transferred ${amount} CareCoins`);
    return true;
  } catch (error) {
    console.error('Error transferring CareCoins:', error);
    toast.error('Failed to transfer CareCoins. Please try again.');
    return false;
  }
};

// Add environment declarations for TypeScript
declare global {
  interface Window {
    ethereum: any;
  }
}
