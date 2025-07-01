
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useTransactionForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const sendTransaction = async (data: {
    amount: number;
    recipientEmail: string;
    description: string;
  }) => {
    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    setIsLoading(true);
    try {
      // Find recipient by email
      const { data: recipient, error: recipientError } = await supabase
        .from('users')
        .select('id')
        .eq('email', data.recipientEmail)
        .single();

      if (recipientError || !recipient) {
        toast.error('Recipient not found');
        return;
      }

      // Check if user has enough balance
      if (data.amount > (user.care_coins_balance || 0)) {
        toast.error('Insufficient balance');
        return;
      }

      // Create transaction
      const { error: transactionError } = await supabase
        .from('care_coins_transactions')
        .insert({
          amount: -data.amount,
          from_user_id: user.id,
          to_user_id: recipient.id,
          transaction_type: 'transfer',
          description: data.description
        });

      if (transactionError) throw transactionError;

      toast.success('Transaction sent successfully');
    } catch (error) {
      console.error('Transaction error:', error);
      toast.error('Transaction failed');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendTransaction,
    isLoading
  };
};
