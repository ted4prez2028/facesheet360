
import { useState } from 'react';
import { requestVirtualCard, getUserCards } from '@/lib/api/careCoinsApi';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { CareCoinsCard } from '@/types';

export const useVirtualCard = () => {
  const [isRequestingCard, setIsRequestingCard] = useState(false);
  const { user } = useAuth();
  
  const { 
    data: cards, 
    isLoading: isLoadingCards, 
    refetch: refetchCards 
  } = useQuery({
    queryKey: ['userCards', user?.id],
    queryFn: () => user?.id ? getUserCards(user.id) : Promise.resolve([]),
    enabled: !!user?.id,
  });

  const requestNewCard = async (cardType: 'virtual' | 'physical' = 'virtual', limitAmount: number = 1000) => {
    if (!user?.id) {
      toast.error("You must be logged in to request a card");
      return;
    }

    setIsRequestingCard(true);
    try {
      const card = await requestVirtualCard(user.id, cardType, limitAmount);
      toast.success(`Successfully requested a new ${cardType} card. It will be processed shortly.`);
      refetchCards();
      return card;
    } catch (error: any) {
      console.error("Card request error:", error);
      toast.error(error.message || "Failed to request card");
    } finally {
      setIsRequestingCard(false);
    }
  };

  const getPendingCards = (): CareCoinsCard[] => {
    return cards?.filter(card => card.status === 'pending') || [];
  };

  const getActiveCards = (): CareCoinsCard[] => {
    return cards?.filter(card => card.status === 'active') || [];
  };

  return {
    cards,
    pendingCards: getPendingCards(),
    activeCards: getActiveCards(),
    isLoading: isLoadingCards,
    isRequestingCard,
    requestNewCard,
    refetchCards,
  };
};
