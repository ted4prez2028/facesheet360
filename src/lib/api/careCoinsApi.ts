
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

    return data || [];
  },

  async createTransaction(transaction: Omit<CareCoinsTransaction, 'id' | 'created_at'>): Promise<CareCoinsTransaction> {
    const { data, error } = await supabase
      .from('care_coins_transactions')
      .insert(transaction)
      .select()
      .single();

    if (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }

    return data;
  },

  async getBillPayments(userId: string): Promise<CareCoinsBillPayment[]> {
    const { data, error } = await supabase
      .from('care_coins_bill_payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bill payments:', error);
      throw error;
    }

    return data || [];
  },

  async createBillPayment(payment: Omit<CareCoinsBillPayment, 'id' | 'created_at' | 'updated_at'>): Promise<CareCoinsBillPayment> {
    const { data, error } = await supabase
      .from('care_coins_bill_payments')
      .insert(payment)
      .select()
      .single();

    if (error) {
      console.error('Error creating bill payment:', error);
      throw error;
    }

    return data;
  },

  async getAchievements(userId: string): Promise<CareCoinsAchievement[]> {
    const { data, error } = await supabase
      .from('care_coins_achievements')
      .select('*')
      .eq('user_id', userId)
      .order('achieved_at', { ascending: false });

    if (error) {
      console.error('Error fetching achievements:', error);
      throw error;
    }

    return data || [];
  }
};
