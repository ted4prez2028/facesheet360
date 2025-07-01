
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface RewardDistributionParams {
  amount: number;
  providerId: string;
  patientId?: string;
  rewardCategory: string;
  description?: string;
}

export function useCareCoinsRewards() {
  const queryClient = useQueryClient();

  const distributeReward = useMutation({
    mutationFn: async ({
      amount,
      providerId,
      patientId,
      rewardCategory,
      description
    }: RewardDistributionParams) => {
      // Mock implementation since care_coins_transactions table doesn't exist
      console.log('Mock reward distribution:', { amount, providerId, patientId, rewardCategory, description });
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['careCoinsBalance'] });
      queryClient.invalidateQueries({ queryKey: ['careCoinsTransactions'] });
      toast.success('CareCoins reward distributed successfully');
    },
    onError: (error) => {
      console.error('Error distributing CareCoins:', error);
      toast.error('Failed to distribute CareCoins reward');
    }
  });

  const { data: rewardAnalytics, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ['careCoinsRewardAnalytics'],
    queryFn: async () => {
      // Mock data since care_coins_reward_analytics table doesn't exist
      return [
        {
          id: '1',
          reward_date: new Date().toISOString(),
          amount: 100,
          category: 'patient_care',
          provider_id: 'mock-provider-1'
        }
      ];
    }
  });

  const { data: rewardCategories } = useQuery({
    queryKey: ['careCoinsRewardCategories'],
    queryFn: async () => {
      // Mock data since care_coins_transactions table doesn't exist
      return ['patient_care', 'documentation', 'quality_metrics', 'training'];
    }
  });

  return {
    distributeReward,
    rewardAnalytics,
    rewardCategories,
    isLoadingAnalytics
  };
}
