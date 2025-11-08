import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CareCoinsTransaction } from '@/types';

interface UseCareCoinsTransactionsOptions {
  userId: string;
  category?: string;
  startDate?: string;
  endDate?: string;
}

export const useCareCoinsTransactions = (options: UseCareCoinsTransactionsOptions) => {
  const { userId, category, startDate, endDate } = options;

  const query = useQuery({
    queryKey: ['care-coins-transactions', userId, category, startDate, endDate],
    queryFn: async () => {
      if (!userId) return [];

      let query = supabase
        .from('care_coins_transactions')
        .select('*')
        .or(`user_id.eq.${userId},from_user_id.eq.${userId},to_user_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      // Filter by category
      if (category) {
        query = query.eq('transaction_type', category);
      }

      // Filter by date range
      if (startDate) {
        query = query.gte('created_at', new Date(startDate).toISOString());
      }
      if (endDate) {
        query = query.lte('created_at', new Date(endDate + 'T23:59:59').toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching transactions:', error);
        throw error;
      }

      return data as CareCoinsTransaction[];
    },
    enabled: !!userId,
  });

  return {
    transactions: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
};
