
import { useState, useEffect } from 'react';
import { isMetaMaskInstalled, connectMetaMask } from '@/lib/carecoin';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useWalletSetup = () => {
  const { user } = useAuth();
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check if wallet is connected on mount
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (!isMetaMaskInstalled()) return;
      
      try {
        // Check if we're already connected
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsWalletConnected(true);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    };

    checkWalletConnection();
  }, []);

  // Auto-grant new users 1 CareCoin when they connect their wallet for the first time
  const handleFirstTimeWalletConnection = async (address: string) => {
    if (!user?.id) return;
    
    try {
      // Check if user has already received their welcome CareCoin
      const { data, error } = await supabase
        .from('care_coins_transactions')
        .select('*')
        .eq('to_user_id', user.id)
        .eq('transaction_type', 'welcome')
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error checking first time wallet connection:', error);
        return;
      }
      
      if (data) {
        // User has already received their welcome coin
        return;
      }
      
      // User has not received welcome coin yet, let's give them one
      setIsProcessing(true);
      
      // 1. Create a transaction record
      const { error: txError } = await supabase
        .from('care_coins_transactions')
        .insert({
          amount: 1,
          to_user_id: user.id,
          transaction_type: 'welcome',
          description: 'Welcome bonus for connecting your wallet'
        });
      
      if (txError) throw txError;
      
      // 2. Update user's CareCoins balance
      const { error: updateError } = await supabase
        .from('users')
        .update({ care_coins_balance: 1 })
        .eq('id', user.id);
      
      if (updateError) throw updateError;
      
      // Show success message
      toast.success('Welcome! You received 1 CareCoin as a bonus for connecting your wallet');
    } catch (error) {
      console.error('Error granting welcome CareCoin:', error);
      toast.error('Could not process your welcome bonus');
    } finally {
      setIsProcessing(false);
    }
  };

  // Connect wallet and grant CareCoin
  const setupWallet = async () => {
    setIsProcessing(true);
    
    try {
      if (!isMetaMaskInstalled()) {
        toast.error('MetaMask is not installed. Please install MetaMask to use CareCoins.');
        return false;
      }

      const address = await connectMetaMask();
      if (address) {
        setWalletAddress(address);
        setIsWalletConnected(true);
        
        // Grant 1 CareCoin for first-time connection
        await handleFirstTimeWalletConnection(address);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error setting up wallet:', error);
      toast.error('Failed to connect wallet. Please try again.');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isWalletConnected,
    walletAddress,
    isProcessing,
    setupWallet
  };
};
