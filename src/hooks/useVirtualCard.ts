
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CareCoinsCard } from '@/types';
import { toast } from 'sonner';

export const useVirtualCard = () => {
  const { user } = useAuth();
  const [card, setCard] = useState<CareCoinsCard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCard();
    }
  }, [user]);

  const fetchCard = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('care_coins_cards')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setCard(data);
    } catch (error) {
      console.error('Error fetching card:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createCard = async () => {
    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('care_coins_cards')
        .insert({
          user_id: user.id,
          card_type: 'virtual',
          status: 'active',
          limit_amount: 1000
        })
        .select()
        .single();

      if (error) throw error;

      setCard(data);
      toast.success('Virtual card created successfully');
    } catch (error) {
      console.error('Error creating card:', error);
      toast.error('Failed to create card');
    }
  };

  return {
    card,
    isLoading,
    createCard,
    fetchCard
  };
};
