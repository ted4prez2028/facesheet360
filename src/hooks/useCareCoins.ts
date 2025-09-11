import { supabase } from '@/integrations/supabase/client';

interface BalanceResult {
  balance: number;
  totalEarned: number;
  usdValue: number;
}

interface Transaction {
  id: string;
  transaction_type: string;
  description: string | null;
  amount: number;
  created_at: string;
}

/**
 * Fetches CareCoin related information for the current user.
 *
 * This hook exposes simple async helpers instead of React Query mutations so
 * components can call them directly and handle loading state in whatever way
 * they need. The data now comes from Supabase instead of mocked values,
 * bringing the CareCoin system a step closer to production readiness.
 */
export const useCareCoins = () => {
  const getBalance = async (userId: string): Promise<BalanceResult> => {
    const { data, error } = await supabase
      .from('users')
      .select('care_coins_balance')
      .eq('id', userId)
      .single();

    if (error) {
      throw error;
    }

    const balance = data?.care_coins_balance || 0;
    // TODO: replace static USD conversion rate once real market data is
    // available or an on-chain oracle is integrated.
    const usdValue = balance * 0.5; // Example: 1 CareCoin = $0.50

    // Without a dedicated field for "total earned" we use the running balance
    // as a simple approximation.
    return {
      balance,
      totalEarned: balance,
      usdValue,
    };
  };

  const getTransactions = async (userId: string): Promise<Transaction[]> => {
    const { data, error } = await supabase
      .from('care_coins_transactions')
      .select('*')
      .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    return (data as Transaction[]) || [];
  };

  const transfer = async (
    fromUserId: string,
    toUserId: string,
    amount: number,
    description?: string
  ): Promise<void> => {
    const { error } = await supabase.functions.invoke('transfer-carecoin', {
      body: { fromUserId, toUserId, amount, description },
    });

    if (error) {
      throw error;
    }
  };

  const ensureAdminBalance = async (
    email: string,
    userId: string,
    minimum = 100
  ): Promise<void> => {
    if (email !== 'tdicusmurray@gmail.com') return;

    const { data, error } = await supabase
      .from('users')
      .select('care_coins_balance')
      .eq('id', userId)
      .single();

    if (error) {
      throw error;
    }

    const balance = data?.care_coins_balance || 0;
    if (balance < minimum) {
      const { error: updateError } = await supabase
        .from('users')
        .update({ care_coins_balance: minimum })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }
    }
  };

  return {
    getBalance,
    getTransactions,
    transfer,
    ensureAdminBalance,
  };
};

