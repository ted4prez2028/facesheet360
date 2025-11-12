import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

/**
 * Hook to automatically process pending CareCoin distributions
 * Listens for new charting_profits records and triggers distribution
 */
export const useCareCoinAutoProcessor = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    console.log('Setting up CareCoin auto-processor...');

    // Subscribe to new charting_profits insertions
    const channel = supabase
      .channel('carecoin-auto-processor')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'charting_profits',
          filter: `status=eq.pending`,
        },
        async (payload) => {
          console.log('New pending CareCoin distribution detected:', payload);
          
          const profit = payload.new;
          
          try {
            // Call the distribute-charting-profit function to mint tokens
            const { data, error } = await supabase.functions.invoke('distribute-charting-profit', {
              body: {
                patientId: profit.patient_id,
                providerId: profit.provider_id,
                chartType: profit.chart_type,
                noteId: profit.chart_record_id
              }
            });

            if (error) {
              console.error('Failed to distribute CareCoins:', error);
              // Mark as failed
              await supabase
                .from('charting_profits')
                .update({ status: 'failed' })
                .eq('id', profit.id);
              return;
            }

            if (data?.success) {
              console.log('CareCoins distributed successfully for:', profit.chart_type);
              // Mark as completed
              await supabase
                .from('charting_profits')
                .update({ status: 'completed' })
                .eq('id', profit.id);
            } else {
              console.error('Distribution returned unsuccessful:', data);
              await supabase
                .from('charting_profits')
                .update({ status: 'failed' })
                .eq('id', profit.id);
            }
          } catch (error) {
            console.error('Error in auto-processor:', error);
            await supabase
              .from('charting_profits')
              .update({ status: 'failed' })
              .eq('id', profit.id);
          }
        }
      )
      .subscribe((status) => {
        console.log('CareCoin auto-processor subscription status:', status);
      });

    // Cleanup subscription on unmount
    return () => {
      console.log('Cleaning up CareCoin auto-processor...');
      supabase.removeChannel(channel);
    };
  }, [user]);
};
