
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserAchievements, ACHIEVEMENT_DETAILS } from '@/hooks/useUserAchievements';
import { Award, Crown, Lock, Medal, Trophy } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/AuthContext';
import { getUserCoinsSummary } from '@/lib/api/careCoinsApi';
import { useQuery } from '@tanstack/react-query';
import { CoinsSummary } from '@/types/health-predictions';

const getAchievementIcon = (achievementType: string) => {
  switch (achievementType) {
    case 'bronze_achiever': return <Trophy className="h-6 w-6" style={{ color: '#CD7F32' }} />;
    case 'silver_achiever': return <Medal className="h-6 w-6" style={{ color: '#C0C0C0' }} />;
    case 'gold_achiever': return <Award className="h-6 w-6" style={{ color: '#FFD700' }} />;
    case 'platinum_achiever': return <Crown className="h-6 w-6" style={{ color: '#E5E4E2' }} />;
    default: return <Award className="h-6 w-6" />;
  }
};

export const AchievementsView = () => {
  const { achievements, isLoading, hasAchievement } = useUserAchievements();
  const { user } = useAuth();
  
  const { data: coinsSummary } = useQuery<CoinsSummary | null>({
    queryKey: ['userCoinsSummary', user?.id],
    queryFn: () => user?.id ? getUserCoinsSummary(user.id) : Promise.resolve(null),
    enabled: !!user?.id,
  });

  const totalEarned = coinsSummary?.total_rewards || 0;
  
  const achievementThresholds = [
    { type: 'bronze_achiever', threshold: 100 },
    { type: 'silver_achiever', threshold: 500 },
    { type: 'gold_achiever', threshold: 1000 },
    { type: 'platinum_achiever', threshold: 5000 }
  ];

  const getProgressToNextAchievement = () => {
    let nextAchievement = null;
    
    for (const achievement of achievementThresholds) {
      if (!hasAchievement(achievement.type)) {
        nextAchievement = achievement;
        break;
      }
    }
    
    if (!nextAchievement) {
      return { type: 'max_level', progress: 100, threshold: 5000, current: totalEarned };
    }
    
    return {
      type: nextAchievement.type,
      threshold: nextAchievement.threshold,
      current: totalEarned,
      progress: Math.min(100, Math.floor((totalEarned / nextAchievement.threshold) * 100))
    };
  };

  const nextAchievement = getProgressToNextAchievement();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Award className="h-5 w-5" />
          CareCoin Achievements
        </CardTitle>
        <CardDescription>
          Earn achievements as you use the CareCoins platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <p className="text-sm font-medium mb-2">Progress to Next Achievement</p>
          <div className="space-y-1">
            <Progress value={nextAchievement.progress} />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{nextAchievement.current} / {nextAchievement.threshold} CareCoins</span>
              <span>
                {nextAchievement.type === 'max_level' 
                  ? 'Max Level Achieved!' 
                  : `${nextAchievement.progress}% to ${ACHIEVEMENT_DETAILS[nextAchievement.type as keyof typeof ACHIEVEMENT_DETAILS]?.name}`}
              </span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          {achievementThresholds.map((achievement) => {
            const isUnlocked = hasAchievement(achievement.type);
            const details = ACHIEVEMENT_DETAILS[achievement.type as keyof typeof ACHIEVEMENT_DETAILS];
            
            return (
              <div 
                key={achievement.type} 
                className={`rounded-lg p-4 flex items-center gap-4 ${
                  isUnlocked 
                    ? 'bg-primary/10 border border-primary/20' 
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}
              >
                <div className={`rounded-full p-2 ${
                  isUnlocked 
                    ? 'bg-primary/20' 
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}>
                  {isUnlocked 
                    ? getAchievementIcon(achievement.type)
                    : <Lock className="h-6 w-6 text-gray-400" />
                  }
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{details.name}</h3>
                    {isUnlocked && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                        Unlocked
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{details.description}</p>
                  
                  {!isUnlocked && (
                    <div className="mt-1">
                      <Progress 
                        value={Math.min(100, Math.floor((totalEarned / achievement.threshold) * 100))} 
                        className="h-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {totalEarned} / {achievement.threshold} CareCoins
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
