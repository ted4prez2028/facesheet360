
import { useQuery } from '@tanstack/react-query';
import { getUserAchievements } from '@/lib/api/careCoinsApi';
import { useAuth } from '@/context/AuthContext';

// Define achievement details
export const ACHIEVEMENT_DETAILS = {
  'bronze_achiever': {
    name: 'Bronze Achiever',
    description: 'Earned your first 100 CareCoins',
    icon: 'Trophy',
    color: '#CD7F32',
  },
  'silver_achiever': {
    name: 'Silver Achiever',
    description: 'Earned 500 CareCoins',
    icon: 'Award',
    color: '#C0C0C0',
  },
  'gold_achiever': {
    name: 'Gold Achiever',
    description: 'Earned 1,000 CareCoins',
    icon: 'Medal',
    color: '#FFD700',
  },
  'platinum_achiever': {
    name: 'Platinum Achiever',
    description: 'Earned 5,000 CareCoins',
    icon: 'Crown',
    color: '#E5E4E2',
  },
};

export const useUserAchievements = () => {
  const { user } = useAuth();

  const { 
    data: achievements, 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ['userAchievements', user?.id],
    queryFn: () => user?.id ? getUserAchievements(user.id) : Promise.resolve([]),
    enabled: !!user?.id,
  });

  const getEnhancedAchievements = () => {
    return achievements?.map(achievement => ({
      ...achievement,
      ...ACHIEVEMENT_DETAILS[achievement.achievement_type as keyof typeof ACHIEVEMENT_DETAILS],
    })) || [];
  };

  const hasAchievement = (type: string) => {
    return achievements?.some(a => a.achievement_type === type) || false;
  };

  return {
    achievements: getEnhancedAchievements(),
    isLoading,
    refetch,
    hasAchievement,
  };
};
