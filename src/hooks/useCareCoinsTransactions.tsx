
import { useState, useEffect, useCallback } from "react";
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
      // Mock data since care_coins_transactions table doesn't exist
      const mockTransactions: CareCoinsTransaction[] = [
        {
          id: '1',
          user_id: user.id,
          transaction_type: 'reward',
          amount: 100,
          description: 'Patient care reward',
          created_at: new Date().toISOString(),
          status: 'completed',
          otherUserName: 'System'
        },
        {
          id: '2',
          user_id: user.id,
          transaction_type: 'transfer',
          amount: -50,
          description: 'Transfer to colleague',
          created_at: new Date().toISOString(),
          status: 'completed',
          otherUserName: 'Dr. Smith'
        }
      ];
      
      setTransactions(mockTransactions);
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
