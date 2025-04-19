
import { supabase } from "@/integrations/supabase/client";
import { CareCoinsTransaction, CareCoinsCard, CareCoinsBillPayment, CareCoinsAchievement, ExchangeRate } from "@/types";

export const transferCareCoins = async (fromUserId: string, toUserId: string, amount: number) => {
  try {
    const { data: sender, error: senderError } = await supabase
      .from("users")
      .select("care_coins_balance")
      .eq("id", fromUserId)
      .single();

    if (senderError) throw senderError;
    if (!sender || sender.care_coins_balance < amount) {
      throw new Error("Insufficient balance");
    }

    const { data: recipient, error: recipientError } = await supabase
      .from("users")
      .select("care_coins_balance")
      .eq("id", toUserId)
      .single();

    if (recipientError) throw recipientError;
    if (!recipient) {
      throw new Error("Recipient not found");
    }

    const { error: updateSenderError } = await supabase
      .from("users")
      .update({ care_coins_balance: sender.care_coins_balance - amount })
      .eq("id", fromUserId);

    if (updateSenderError) throw updateSenderError;

    const { error: updateRecipientError } = await supabase
      .from("users")
      .update({ care_coins_balance: recipient.care_coins_balance + amount })
      .eq("id", toUserId);

    if (updateRecipientError) throw updateRecipientError;

    const { error: transactionError } = await supabase
      .from("care_coins_transactions")
      .insert({
        from_user_id: fromUserId,
        to_user_id: toUserId,
        amount,
        transaction_type: "transfer",
        description: "User transfer"
      });

    if (transactionError) throw transactionError;

    return true;
  } catch (error) {
    console.error("Error transferring CareCoins:", error);
    throw error;
  }
};

export const getCareCoinsBalance = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("care_coins_balance")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data.care_coins_balance || 0;
  } catch (error) {
    console.error("Error fetching care coins balance:", error);
    throw error;
  }
};

// New functions for enhanced CareCoins features

// Get user's CareCoin summary
export const getUserCoinsSummary = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .rpc('get_user_coins_summary', { user_id_param: userId });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching CareCoins summary:", error);
    throw error;
  }
};

// Get CareCoin to USD exchange rate
export const getExchangeRate = async () => {
  try {
    const { data, error } = await supabase
      .from('care_coins_exchange_rates')
      .select('*')
      .eq('currency_code', 'CARECOIN')
      .single();

    if (error) throw error;
    return data as ExchangeRate;
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    throw error;
  }
};

// Convert CareCoins to USD
export const convertCareCoinsToUSD = async (amount: number) => {
  try {
    const { data, error } = await supabase
      .rpc('convert_care_coins_to_usd', { amount_in_carecoins: amount });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error converting CareCoins to USD:", error);
    throw error;
  }
};

// Cash out CareCoins to USD
export const cashOutCareCoins = async (userId: string, amount: number, paymentMethod: string, accountInfo: any) => {
  try {
    const { data, error } = await supabase
      .rpc('cash_out_care_coins', { 
        user_id_param: userId, 
        amount_in_carecoins: amount,
        payment_method: paymentMethod,
        account_info: accountInfo
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error cashing out CareCoins:", error);
    throw error;
  }
};

// Pay bills with CareCoins
export const payBillWithCareCoins = async (
  userId: string, 
  billType: string, 
  amount: number,
  recipientName: string,
  recipientAccount: string,
  billInfo: any
) => {
  try {
    const { data, error } = await supabase
      .rpc('pay_bill_with_care_coins', { 
        user_id_param: userId, 
        bill_type: billType,
        amount_in_carecoins: amount,
        recipient_name: recipientName,
        recipient_account: recipientAccount,
        bill_info: billInfo
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error paying bill with CareCoins:", error);
    throw error;
  }
};

// Get user's virtual cards
export const getUserCards = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('care_coins_cards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as CareCoinsCard[];
  } catch (error) {
    console.error("Error fetching user cards:", error);
    throw error;
  }
};

// Request a new virtual card
export const requestVirtualCard = async (userId: string, cardType: 'virtual' | 'physical' = 'virtual', limitAmount: number = 1000) => {
  try {
    const { data, error } = await supabase
      .from('care_coins_cards')
      .insert({
        user_id: userId,
        card_type: cardType,
        limit_amount: limitAmount,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data as CareCoinsCard;
  } catch (error) {
    console.error("Error requesting virtual card:", error);
    throw error;
  }
};

// Get user's bill payments
export const getUserBillPayments = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('care_coins_bill_payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as CareCoinsBillPayment[];
  } catch (error) {
    console.error("Error fetching bill payments:", error);
    throw error;
  }
};

// Get user's achievements
export const getUserAchievements = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('care_coins_achievements')
      .select('*')
      .eq('user_id', userId)
      .order('achieved_at', { ascending: false });

    if (error) throw error;
    return data as CareCoinsAchievement[];
  } catch (error) {
    console.error("Error fetching achievements:", error);
    throw error;
  }
};

// Search for providers for transfer
export const searchProviders = async (query: string, limit: number = 10) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, specialty')
      .or(`name.ilike.%${query}%, email.ilike.%${query}%`)
      .in('role', ['doctor', 'nurse', 'admin'])
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error searching providers:", error);
    throw error;
  }
};
