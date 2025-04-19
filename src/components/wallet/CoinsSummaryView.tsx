
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserCoinsSummary } from '@/lib/api/careCoinsApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { CoinsIcon, TrendingUpIcon, TrendingDownIcon, GiftIcon } from 'lucide-react';

export const CoinsSummaryView = () => {
  const { user } = useAuth();

  const { data: summary, isLoading } = useQuery({
    queryKey: ['userCoinsSummary', user?.id],
    queryFn: () => user?.id ? getUserCoinsSummary(user.id) : null,
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">CareCoins Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <CoinsIcon className="h-4 w-4" />
          CareCoins Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <TrendingUpIcon className="h-4 w-4 text-green-500" />
              Total Earned
            </span>
            <span className="font-medium">{summary?.total_earned || 0}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <TrendingDownIcon className="h-4 w-4 text-red-500" />
              Total Spent
            </span>
            <span className="font-medium">{summary?.total_spent || 0}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <GiftIcon className="h-4 w-4 text-blue-500" />
              Rewards
            </span>
            <span className="font-medium">{summary?.total_rewards || 0}</span>
          </div>
        </div>
        
        {summary && summary.rewards_by_category && Object.keys(summary.rewards_by_category).length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="text-xs text-muted-foreground mb-2">Rewards by Category:</div>
            <div className="space-y-2">
              {Object.entries(summary.rewards_by_category).map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-xs">{category}</span>
                  <span className="text-xs font-medium">{amount}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
