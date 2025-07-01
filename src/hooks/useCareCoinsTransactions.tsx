
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface CareCoinsTransaction {
  id: string;
  amount: number;
  transaction_type: string;
  description: string;
  created_at: string;
  from_user_id?: string;
  to_user_id?: string;
  from_user?: {
    name: string;
  };
  to_user?: {
    name: string;
  };
}

export const useCareCoinsTransactions = () => {
  const [transactions, setTransactions] = useState<CareCoinsTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchTransactions();
    }
  }, [user?.id]);

  const fetchTransactions = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('care_coins_transactions')
        .select(`
          *,
          from_user:from_user_id(name),
          to_user:to_user_id(name)
        `)
        .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createTransaction = async (transactionData: {
    amount: number;
    transaction_type: string;
    description: string;
    to_user_id?: string;
  }) => {
    if (!user?.id) throw new Error('User not authenticated');

    const newTransaction = {
      amount: transactionData.amount,
      transaction_type: transactionData.transaction_type,
      description: transactionData.description,
      from_user_id: user.id,
      to_user_id: transactionData.to_user_id
    };

    const { data, error } = await supabase
      .from('care_coins_transactions')
      .insert([newTransaction])
      .select()
      .single();

    if (error) throw error;

    // Refresh transactions after creating a new one
    await fetchTransactions();
    
    return data;
  };

  return {
    transactions,
    isLoading,
    createTransaction,
    refreshTransactions: fetchTransactions
  };
};
