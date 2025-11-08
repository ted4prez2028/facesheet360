import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';

export const useRealtimeBalance = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    if (!user) return;

    // Set initial balance
    setBalance(user.care_coins_balance || 0);

    // Subscribe to profile changes for balance updates
    const profileChannel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Real-time balance update:', payload);
          const newBalance = payload.new.care_coins_balance;
          setBalance(newBalance);
          
          // Invalidate related queries
          queryClient.invalidateQueries({ queryKey: ['care-coins-balance'] });
          queryClient.invalidateQueries({ queryKey: ['care-coins-transactions'] });
        }
      )
      .subscribe();

    // Subscribe to transaction changes
    const transactionChannel = supabase
      .channel('transaction-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'care_coins_transactions',
        },
        (payload) => {
          console.log('New transaction detected:', payload);
          
          // Check if transaction involves current user
          const transaction = payload.new;
          if (
            transaction.user_id === user.id ||
            transaction.from_user_id === user.id ||
            transaction.to_user_id === user.id
          ) {
            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ['care-coins-transactions'] });
            queryClient.invalidateQueries({ queryKey: ['care-coins-balance'] });
          }
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(profileChannel);
      supabase.removeChannel(transactionChannel);
    };
  }, [user, queryClient]);

  return { balance };
};
