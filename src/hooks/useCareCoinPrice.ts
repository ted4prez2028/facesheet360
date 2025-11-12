import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CareCoinPrice {
  price: number;
  priceFormatted: string;
  source: 'uniswap_v3' | 'default' | 'fallback';
  poolAddress?: string;
  maticUsdPrice?: number;
  timestamp?: string;
  network?: string;
  message?: string;
}

export const useCareCoinPrice = () => {
  return useQuery({
    queryKey: ['carecoin-price'],
    queryFn: async (): Promise<CareCoinPrice> => {
      try {
        const { data, error } = await supabase.functions.invoke('get-carecoin-price');

        if (error) {
          console.error('Error fetching CareCoin price:', error);
          // Return fallback price
          return {
            price: 0.50,
            priceFormatted: '$0.50',
            source: 'fallback',
            message: 'Using default price'
          };
        }

        return data;
      } catch (error) {
        console.error('CareCoin price fetch error:', error);
        return {
          price: 0.50,
          priceFormatted: '$0.50',
          source: 'fallback',
          message: 'Using default price'
        };
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time price
    staleTime: 15000, // Consider data stale after 15 seconds
  });
};