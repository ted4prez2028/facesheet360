
import { useMutation } from '@tanstack/react-query';

export const useCareCoins = () => {
  const getBalance = useMutation({
    mutationFn: async (userId: string) => {
      // Mock data for now since we don't have the actual API
      return {
        balance: 100,
        totalEarned: 500,
        usdValue: 50.00
      };
    },
  });

  const getTransactions = useMutation({
    mutationFn: async (userId: string) => {
      // Mock data for now since we don't have the actual API
      return [
        {
          id: '1',
          transaction_type: 'reward',
          description: 'Daily login bonus',
          amount: 10,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          transaction_type: 'transfer',
          description: 'Sent to Dr. Smith',
          amount: -25,
          created_at: new Date().toISOString()
        }
      ];
    },
  });

  return {
    getBalance,
    getTransactions
  };
};
