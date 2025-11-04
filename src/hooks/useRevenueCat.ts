import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useRevenueCat = () => {
  const [isLoading, setIsLoading] = useState(false);

  const createSubscription = async (planId: string, userId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('revenuecat-subscription', {
        body: { 
          action: 'create',
          planId,
          userId 
        }
      });

      if (error) throw error;
      
      toast.success('Subscription created successfully!');
      return data;
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Failed to create subscription');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const checkSubscription = async (userId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('revenuecat-subscription', {
        body: { 
          action: 'check',
          userId 
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Check subscription error:', error);
      return null;
    }
  };

  const cancelSubscription = async (userId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('revenuecat-subscription', {
        body: { 
          action: 'cancel',
          userId 
        }
      });

      if (error) throw error;
      
      toast.success('Subscription cancelled successfully');
      return data;
    } catch (error) {
      console.error('Cancel subscription error:', error);
      toast.error('Failed to cancel subscription');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createSubscription,
    checkSubscription,
    cancelSubscription,
    isLoading
  };
};
