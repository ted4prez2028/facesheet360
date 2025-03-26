
import { toast } from 'sonner';
import { ethers } from 'ethers';

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
    toast.error(error.message || 'Failed to send transaction. Please try again.');
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
