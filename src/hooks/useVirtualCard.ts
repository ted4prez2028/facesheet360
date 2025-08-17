
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CareCoinsCard } from '@/types';
import { toast } from 'sonner';

export const useVirtualCard = () => {
  const { user } = useAuth();
  const [card, setCard] = useState<CareCoinsCard | null>(null);
  const [cards, setCards] = useState<CareCoinsCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequestingCard, setIsRequestingCard] = useState(false);

  const fetchCard = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('care_coins_cards')
        .select('*')
        .eq('user_id', user.id);

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data && data.length > 0) {
        const cardData = data[0] as CareCoinsCard;
        setCard(cardData);
        setCards(data as CareCoinsCard[]);
      }
    } catch (error) {
      console.error('Error fetching card:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchCard();
    }
  }, [user, fetchCard]);

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
          card_type: 'virtual' as const,
          status: 'active' as const,
          limit_amount: 1000
        })
        .select()
        .single();

      if (error) throw error;

      const cardData = data as CareCoinsCard;
      setCard(cardData);
      setCards(prev => [...prev, cardData]);
      toast.success('Virtual card created successfully');
    } catch (error) {
      console.error('Error creating card:', error);
      toast.error('Failed to create card');
    }
  };

  const requestNewCard = async (cardType: string, limitAmount: number) => {
    setIsRequestingCard(true);
    try {
      await createCard();
    } finally {
      setIsRequestingCard(false);
    }
  };

  return {
    card,
    cards,
    isLoading,
    createCard,
    fetchCard,
    requestNewCard,
    isRequestingCard
  };
};
