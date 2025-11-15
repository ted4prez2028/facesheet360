// @ts-nocheck

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
    const paymentData: any = {
      user_id: payment.user_id,
      bill_type: payment.bill_type,
      amount: payment.amount,
      recipient_name: payment.recipient_name,
      recipient_account: payment.recipient_account,
      bill_info: payment.bill_info ? JSON.parse(JSON.stringify(payment.bill_info)) : null,
      status: payment.status || 'pending'
    };

    const { data, error } = await supabase
      .from('bill_payments')
      .insert([paymentData])
      .select()
      .single();

    if (error) {
      console.error('Error creating bill payment:', error);
      throw error;
    }

    return data as CareCoinsBillPayment;
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
  const { data, error } = await supabase.functions.invoke('process-cashout', {
    body: { amount, paymentMethod, accountInfo }
  });

  if (error) {
    console.error('Error cashing out CareCoins:', error);
    throw error;
  }

  return data;
};

export const convertCareCoinsToUSD = async (amount: number) => {
  try {
    // Fetch real-time price from oracle
    const { data, error } = await supabase.functions.invoke('get-carecoin-price');
    
    if (error || !data?.price) {
      console.error('Error fetching price, using fallback:', error);
      return amount * 0.5; // Fallback to default rate
    }
    
    return amount * data.price;
  } catch (error) {
    console.error('Error converting to USD:', error);
    return amount * 0.5; // Fallback
  }
};

export const getExchangeRate = async () => {
  try {
    // Fetch real-time price from oracle
    const { data, error } = await supabase.functions.invoke('get-carecoin-price');
    
    if (error || !data?.price) {
      return {
        rate_to_usd: 0.5,
        last_updated: new Date().toISOString(),
        source: 'fallback'
      };
    }
    
    return {
      rate_to_usd: data.price,
      last_updated: data.timestamp || new Date().toISOString(),
      source: data.source
    };
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    return {
      rate_to_usd: 0.5,
      last_updated: new Date().toISOString(),
      source: 'fallback'
    };
  }
};
