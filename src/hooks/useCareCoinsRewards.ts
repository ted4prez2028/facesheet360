
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
      const { data, error } = await supabase.rpc('distribute_care_coins_reward', {
        p_amount: amount,
        p_provider_id: providerId,
        p_patient_id: patientId,
        p_reward_category: rewardCategory,
        p_description: description
      });

      if (error) throw error;
      return data;
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
      const { data, error } = await supabase
        .from('care_coins_reward_analytics')
        .select('*')
        .order('reward_date', { ascending: false })
        .limit(30);

      if (error) throw error;
      return data;
    }
  });

  const { data: rewardCategories } = useQuery({
    queryKey: ['careCoinsRewardCategories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('care_coins_transactions')
        .select('reward_category')
        .filter('reward_category', 'not.is', null)
        .order('reward_category');

      if (error) throw error;
      return [...new Set(data.map(t => t.reward_category))];
    }
  });

  return {
    distributeReward,
    rewardAnalytics,
    rewardCategories,
    isLoadingAnalytics
  };
}
