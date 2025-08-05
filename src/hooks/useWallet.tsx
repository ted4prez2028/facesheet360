
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useWallet = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [tokenBalance, setTokenBalance] = useState<string>('0');

  const updateBalances = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('care_coins_balance')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setBalance(data?.care_coins_balance || 0);
    } catch (error) {
      console.error('Error updating balances:', error);
    }
  };

  useEffect(() => {
    if (user) {
      setBalance(user.care_coins_balance || 0);
      updateBalances();
    }
    setIsLoading(false);
  }, [user]);

  const addFunds = async (amount: number) => {
    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    try {
      // Create transaction record
      const { error } = await supabase
        .from('care_coins_transactions')
        .insert({
          amount,
          transaction_type: 'deposit',
          description: 'Added funds',
          to_user_id: user.id
        });

      if (error) throw error;

      toast.success('Funds added successfully');
      await updateBalances();
    } catch (error) {
      console.error('Error adding funds:', error);
      toast.error('Failed to add funds');
    }
  };

  const withdrawFunds = async (amount: number) => {
    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    if (amount > balance) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      // Create transaction record
      const { error } = await supabase
        .from('care_coins_transactions')
        .insert({
          amount: -amount,
          transaction_type: 'withdrawal',
          description: 'Withdrew funds',
          from_user_id: user.id
        });

      if (error) throw error;

      toast.success('Withdrawal successful');
      await updateBalances();
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      toast.error('Failed to withdraw funds');
    }
  };

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        setWalletAddress(accounts[0]);
        setIsWalletConnected(true);
        setTokenBalance('100'); // Mock token balance
        toast.success('Wallet connected successfully');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
    }
  };

  const stakeCareCoins = async (amount: string): Promise<boolean> => {
    toast.info('Staking feature coming soon');
    return false;
  };

  const unstakeCareCoins = async (amount: string): Promise<boolean> => {
    toast.info('Unstaking feature coming soon');
    return false;
  };

  const refreshBalances = async () => {
    await updateBalances();
  };

  return {
    balance,
    isLoading,
    addFunds,
    withdrawFunds,
    updateBalances,
    isWalletConnected,
    walletAddress,
    tokenBalance,
    connectWallet,
    stakeCareCoins,
    unstakeCareCoins,
    refreshBalances
  };
};
