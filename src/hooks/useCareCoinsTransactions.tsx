
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
          *
        `)
        .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      const formattedTransactions = (data || []).map(transaction => ({
        id: transaction.id,
        amount: transaction.amount,
        transaction_type: transaction.transaction_type,
        description: transaction.description || '',
        created_at: transaction.created_at,
        from_user_id: transaction.from_user_id,
        to_user_id: transaction.to_user_id,
        from_user: { name: 'Unknown User' },
        to_user: { name: 'Unknown User' }
      }));
      
      setTransactions(formattedTransactions);
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
