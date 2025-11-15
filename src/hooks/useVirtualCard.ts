// @ts-nocheck

import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (user) {
      fetchCard();
    }
  }, [user]);

  const fetchCard = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('virtual_cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedCards = (data || []).map(card => ({
        ...card,
        card_type: card.card_type as 'virtual' | 'physical',
        status: card.status as 'pending' | 'active' | 'suspended'
      }));

      setCards(typedCards);
      if (typedCards.length > 0) {
        setCard(typedCards[0]);
      }
    } catch (error) {
      console.error('Error fetching card:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createCard = async (cardType: 'virtual' | 'physical' = 'virtual', limitAmount: number = 500) => {
    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    try {
      // Generate card number for virtual cards
      const last_four = Math.floor(1000 + Math.random() * 9000).toString();
      
      const { data, error } = await supabase
        .from('virtual_cards')
        .insert({
          user_id: user.id,
          card_type: cardType,
          last_four: last_four,
          status: 'active',
          limit_amount: limitAmount,
          current_balance: 0
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(`${cardType === 'virtual' ? 'Virtual' : 'Physical'} card created successfully`);
      await fetchCard();
      return data;
    } catch (error) {
      console.error('Error creating card:', error);
      toast.error('Failed to create card');
    }
  };

  const requestNewCard = async (cardType: 'virtual' | 'physical', limitAmount: number) => {
    setIsRequestingCard(true);
    try {
      await createCard(cardType, limitAmount);
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
