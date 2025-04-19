
import { useState, useEffect } from 'react';
import { isMetaMaskInstalled, connectMetaMask, getBalance, getCareCoinsTokenBalance } from '@/lib/carecoin';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

// This is a placeholder for the CareCoin token contract address
// In a real application, this would come from your deployment
const CARE_COIN_CONTRACT_ADDRESS = '0x123456789abcdef123456789abcdef123456789a';

export const useWallet = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [ethBalance, setEthBalance] = useState<string>('0');
  const [tokenBalance, setTokenBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);
  const { user, updateCurrentUser } = useAuth();

  // Check if MetaMask is installed and connected on mount
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (!isMetaMaskInstalled()) {
        return;
      }

      try {
        // Check if we're already connected
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsWalletConnected(true);
          
          // Get balances
          updateBalances(accounts[0]);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    };

    checkWalletConnection();

    // Listen for account changes
    if (isMetaMaskInstalled()) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }

    return () => {
      if (isMetaMaskInstalled()) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      setIsWalletConnected(false);
      setWalletAddress(null);
      setEthBalance('0');
      setTokenBalance('0');
    } else {
      // User switched accounts
      setWalletAddress(accounts[0]);
      setIsWalletConnected(true);
      updateBalances(accounts[0]);
    }
  };

  const connectWallet = async () => {
    setIsLoading(true);

    try {
      if (!isMetaMaskInstalled()) {
        toast.error('MetaMask is not installed. Please install MetaMask to use CareCoins.');
        return false;
      }

      const address = await connectMetaMask();
      if (address) {
        setWalletAddress(address);
        setIsWalletConnected(true);
        
        // Get balances
        await updateBalances(address);
        
        // If user exists in our system, update their internal CareCoin balance
        if (user && updateCurrentUser) {
          const newBalance = (user.care_coins_balance || 0) + 10; // Bonus for connecting
          updateCurrentUser({ care_coins_balance: newBalance });
          toast.success('Wallet connected! You received 10 CareCoins as a bonus.');
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateBalances = async (address: string) => {
    try {
      // Get ETH balance
      const ethBalanceValue = await getBalance(address);
      setEthBalance(ethBalanceValue);
      
      // Get token balance if contract is deployed
      const tokenBalanceValue = await getCareCoinsTokenBalance(address, CARE_COIN_CONTRACT_ADDRESS);
      setTokenBalance(tokenBalanceValue);
    } catch (error) {
      console.error('Error updating balances:', error);
    }
  };

  const refreshBalances = async () => {
    if (!walletAddress) return;
    await updateBalances(walletAddress);
  };

  return {
    isWalletConnected,
    walletAddress,
    ethBalance,
    tokenBalance,
    isLoading,
    connectWallet,
    refreshBalances
  };
};
