
import { supabase } from '@/integrations/supabase/client';
import { CareCoinsTransaction, CareCoinsBillPayment, CareCoinsAchievement } from '@/types';

export const careCoinsApi = {
  async getTransactions(userId: string): Promise<CareCoinsTransaction[]> {
    const { data, error } = await supabase
      .from('care_coins_transactions')
      .select('*')
      .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }

    return (data || []).map(item => ({
      ...item,
      transaction_type: item.transaction_type as CareCoinsTransaction['transaction_type']
    }));
  },

  async createTransaction(transaction: Omit<CareCoinsTransaction, 'id' | 'created_at'>): Promise<CareCoinsTransaction> {
    // Ensure user_id is set (fallback to from_user_id if not provided)
    const txData = {
      ...transaction,
      user_id: transaction.user_id || transaction.from_user_id || transaction.to_user_id,
    };

    const { data, error } = await supabase
      .from('care_coins_transactions')
      .insert([txData])
      .select()
      .single();

    if (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }

    return {
      ...data,
      transaction_type: data.transaction_type as CareCoinsTransaction['transaction_type']
    };
  },

  async getBillPayments(userId: string): Promise<CareCoinsBillPayment[]> {
    const { data, error } = await supabase
      .from('bill_payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bill payments:', error);
      throw error;
    }

    return (data || []) as any[];
  },

  async createBillPayment(payment: Omit<CareCoinsBillPayment, 'id' | 'created_at' | 'updated_at'>): Promise<CareCoinsBillPayment> {
    const { data, error } = await supabase
      .from('bill_payments')
      .insert([payment as any])
      .select()
      .single();

    if (error) {
      console.error('Error creating bill payment:', error);
      throw error;
    }

    return data as any;
  },

  async getAchievements(userId: string): Promise<CareCoinsAchievement[]> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) {
      console.error('Error fetching achievements:', error);
      throw error;
    }

    return (data || []) as any[];
  }
};

// Additional API functions that were missing
export const getUserCoinsSummary = async (userId: string) => {
  // Mock implementation - replace with actual API call
  return {
    total_rewards: 500,
    current_balance: 100,
    total_spent: 400
  };
};

export const getUserBillPayments = async (userId: string): Promise<CareCoinsBillPayment[]> => {
  return careCoinsApi.getBillPayments(userId);
};

export const getUserAchievements = async (userId: string): Promise<CareCoinsAchievement[]> => {
  return careCoinsApi.getAchievements(userId);
};

export const payBillWithCareCoins = async (
  userId: string,
  billType: string,
  amount: number,
  recipientName: string,
  recipientAccount: string,
  billInfo: Record<string, unknown>
) => {
  const payment = await careCoinsApi.createBillPayment({
    user_id: userId,
    bill_type: billType,
    amount,
    recipient_name: recipientName,
    recipient_account: recipientAccount,
    bill_info: billInfo,
    status: 'pending'
  });

  return {
    success: true,
    payment_id: payment.id,
    message: 'Bill payment initiated successfully'
  };
};

export const cashOutCareCoins = async (
  userId: string,
  amount: number,
  paymentMethod: string,
  accountInfo: Record<string, unknown>
) => {
  // Mock implementation
  return {
    success: true,
    transaction_id: `txn_${Date.now()}`,
    usd_amount: amount * 0.5,
    message: 'Cash out initiated successfully'
  };
};

export const convertCareCoinsToUSD = async (amount: number) => {
  // Mock conversion rate
  return amount * 0.5;
};

export const getExchangeRate = async () => {
  return {
    rate_to_usd: 0.5,
    last_updated: new Date().toISOString()
  };
};
