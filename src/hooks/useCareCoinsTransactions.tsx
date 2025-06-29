
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CareCoinsTransaction } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export function useCareCoinsTransactions() {
  const [transactions, setTransactions] = useState<CareCoinsTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const fetchTransactions = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // Get transactions where user is either sender or recipient
      const { data, error } = await supabase
        .from('care_coins_transactions')
        .select('*')
        .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      // Get user details for each transaction
      const enhancedTransactions = await Promise.all(
        (data || []).map(async (transaction) => {
          let userDetails = null;
          
          // If the user is the sender, get recipient details
          // If the user is the recipient, get sender details
          const userId = transaction.from_user_id === user.id 
            ? transaction.to_user_id 
            : transaction.from_user_id;
          
          if (userId) {
            const { data: userData } = await supabase
              .from('users')
              .select('name')
              .eq('id', userId)
              .single();
            
            userDetails = userData;
          }
          
          return {
            ...transaction,
            otherUserName: userDetails?.name || 'System',
            transaction_type: transaction.transaction_type as "transfer" | "reward" | "purchase"
          } as CareCoinsTransaction;
        })
      );
      
      setTransactions(enhancedTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load CareCoins transactions");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchTransactions();
  }, [user?.id, fetchTransactions]);

  return {
    transactions,
    isLoading,
    refreshTransactions: fetchTransactions
  };
}
