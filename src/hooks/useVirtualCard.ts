
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
      // Virtual cards not implemented in database yet
      // Return mock data for now
      setCard(null);
      setCards([]);
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
      // Virtual cards not implemented in database yet
      toast.info('Virtual card feature coming soon');
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
