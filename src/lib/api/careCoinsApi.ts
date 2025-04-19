
import { supabase } from "@/integrations/supabase/client";
import { CareCoinsTransaction, CareCoinsCard, CareCoinsBillPayment, CareCoinsAchievement } from "@/types";
import { CoinsSummary, ExchangeRate, CashOutResult, BillPaymentResult } from "@/types/health-predictions";

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

// Get user's CareCoin summary
export const getUserCoinsSummary = async (userId: string): Promise<CoinsSummary> => {
  try {
    // For now, return dummy data until the RPC is available
    return {
      total_earned: 1250,
      total_spent: 750,
      total_rewards: 500,
      rewards_by_category: {
        'appointment': 200,
        'medication': 150,
        'checkup': 150
      }
    };
  } catch (error) {
    console.error("Error fetching CareCoins summary:", error);
    throw error;
  }
};

// Get CareCoin to USD exchange rate
export const getExchangeRate = async (): Promise<ExchangeRate> => {
  try {
    // This is a placeholder since we don't have the actual table yet
    return {
      id: '1',
      currency_code: 'CARECOIN',
      rate_to_usd: 0.01,
      last_updated: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    throw error;
  }
};

// Convert CareCoins to USD
export const convertCareCoinsToUSD = async (amount: number): Promise<number> => {
  try {
    const exchangeRate = await getExchangeRate();
    return amount * exchangeRate.rate_to_usd;
  } catch (error) {
    console.error("Error converting CareCoins to USD:", error);
    throw error;
  }
};

// Cash out CareCoins to USD
export const cashOutCareCoins = async (
  userId: string, 
  amount: number, 
  paymentMethod: string, 
  accountInfo: any
): Promise<CashOutResult> => {
  try {
    // This is a placeholder implementation
    const usdAmount = await convertCareCoinsToUSD(amount);
    
    // Mock API response until the actual RPC is implemented
    return {
      success: true,
      usd_amount: usdAmount,
      transaction_id: `tx-${Date.now()}`
    };
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
): Promise<BillPaymentResult> => {
  try {
    // This is a placeholder implementation
    // Mock API response until the actual RPC is implemented
    return {
      success: true,
      message: 'Payment processed successfully',
      payment_id: `bill-${Date.now()}`
    };
  } catch (error) {
    console.error("Error paying bill with CareCoins:", error);
    throw error;
  }
};

// Get user's virtual cards
export const getUserCards = async (userId: string): Promise<CareCoinsCard[]> => {
  try {
    // Mock data since the table doesn't exist yet
    return [{
      id: '1',
      user_id: userId,
      card_number: '4111111111111111',
      expiration_date: '12/25',
      status: 'active',
      card_type: 'virtual',
      limit_amount: 1000,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }] as CareCoinsCard[];
  } catch (error) {
    console.error("Error fetching user cards:", error);
    return [];
  }
};

// Request a new virtual card
export const requestVirtualCard = async (
  userId: string, 
  cardType: 'virtual' | 'physical' = 'virtual', 
  limitAmount: number = 1000
): Promise<CareCoinsCard> => {
  try {
    // Mock data since the table doesn't exist yet
    return {
      id: `card-${Date.now()}`,
      user_id: userId,
      card_number: '4111111111111111',
      expiration_date: '12/25',
      status: 'active',
      card_type: cardType,
      limit_amount: limitAmount,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as CareCoinsCard;
  } catch (error) {
    console.error("Error requesting virtual card:", error);
    throw error;
  }
};

// Get user's bill payments
export const getUserBillPayments = async (userId: string): Promise<CareCoinsBillPayment[]> => {
  try {
    // Mock data since the table doesn't exist yet
    return [{
      id: '1',
      user_id: userId,
      bill_type: 'medical',
      amount: 100,
      recipient_name: 'City Hospital',
      recipient_account: 'CH123456789',
      status: 'completed',
      created_at: new Date().toISOString(),
      metadata: {}
    }] as CareCoinsBillPayment[];
  } catch (error) {
    console.error("Error fetching bill payments:", error);
    return [];
  }
};

// Get user's achievements
export const getUserAchievements = async (userId: string): Promise<CareCoinsAchievement[]> => {
  try {
    // Mock data since the table doesn't exist yet
    return [{
      id: '1',
      user_id: userId,
      achievement_type: 'bronze_achiever',
      achieved_at: new Date().toISOString(),
      description: 'Earned your first 100 CareCoins',
      points_awarded: 10
    }] as CareCoinsAchievement[];
  } catch (error) {
    console.error("Error fetching achievements:", error);
    return [];
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
