
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useWallet = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

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

  return {
    balance,
    isLoading,
    addFunds,
    withdrawFunds,
    updateBalances
  };
};
