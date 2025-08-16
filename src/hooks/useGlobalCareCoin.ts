import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CareCoinContract {
  id: string;
  contract_address: string;
  deployer_address: string;
  network: string;
  transaction_hash?: string;
  contract_details: Record<string, unknown>;
  abi: unknown[];
  created_at: string;
}

export const useGlobalCareCoin = () => {
  const queryClient = useQueryClient();
  const [localDeployed, setLocalDeployed] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem('carecoin-deployed') === 'true'
  );

  // Check if CareCoin is already deployed
  const { data: existingContract, isLoading } = useQuery({
    queryKey: ['carecoin-contract'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('carecoin_contract')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }

      return data as CareCoinContract | null;
    },
  });

  useEffect(() => {
    if (existingContract) {
      localStorage.setItem('carecoin-deployed', 'true');
      setLocalDeployed(true);
    }
  }, [existingContract]);

  // Deploy CareCoin
  const deployCareCoin = useMutation({
    mutationFn: async (deployerAddress: string) => {
      console.log('Deploying CareCoin with deployer address:', deployerAddress);
      
      const { data, error } = await supabase.functions.invoke('deploy-carecoin', {
        body: { deployerAddress }
      });

      if (error) {
        throw new Error(error.message || 'Failed to deploy contract');
      }

      if (!data.success) {
        throw new Error(data.error || 'Deployment failed');
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['carecoin-contract'] });
      localStorage.setItem('carecoin-deployed', 'true');
      setLocalDeployed(true);
      toast.success(`CareCoin deployed! ${data.contractDetails?.deployerReward || '100'} CARE tokens sent to your wallet.`);
    },
    onError: (error: Error) => {
      console.error('Deployment error:', error);
      toast.error(`Deployment failed: ${error.message}`);
    }
  });

  return {
    existingContract,
    isLoading,
    deployCareCoin,
    isDeployed: localDeployed || !!existingContract,
  };
};