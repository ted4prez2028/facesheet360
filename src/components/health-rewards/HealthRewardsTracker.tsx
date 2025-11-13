import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Trophy, TrendingUp, Target, Award, Footprints } from 'lucide-react';

export function HealthRewardsTracker() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: dailyProgress } = useQuery({
    queryKey: ['daily-health-progress', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      // Mock daily goals data
      return {
        stepsGoal: 10000,
        stepsCompleted: 6500,
        vitalsChecked: true,
        medicationsTaken: 2,
        medicationsTotal: 3,
        waterIntake: 6,
        waterGoal: 8,
      };
    },
    enabled: !!user,
  });

  const claimReward = useMutation({
    mutationFn: async (rewardType: string) => {
      if (!user) throw new Error('Not authenticated');
      
      const rewardAmounts: Record<string, number> = {
        daily_steps: 10,
        vitals_check: 5,
        medication_adherence: 15,
        water_intake: 5,
      };

      const { error } = await supabase
        .from('health_rewards')
        .insert({
          user_id: user.id,
          reward_type: rewardType,
          reward_amount: rewardAmounts[rewardType] || 10,
          activity_date: new Date().toISOString().split('T')[0],
          coins_awarded: rewardAmounts[rewardType] || 10,
        });

      if (error) throw error;

      // Update user balance
      await supabase.rpc('increment_balance', {
        user_id: user.id,
        amount: rewardAmounts[rewardType] || 10
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-health-progress'] });
      toast.success('Reward claimed! CareCoins added to your wallet');
    },
  });

  const stepsProgress = dailyProgress ? (dailyProgress.stepsCompleted / dailyProgress.stepsGoal) * 100 : 0;
  const medsProgress = dailyProgress ? (dailyProgress.medicationsTaken / dailyProgress.medicationsTotal) * 100 : 0;
  const waterProgress = dailyProgress ? (dailyProgress.waterIntake / dailyProgress.waterGoal) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Daily Health Goals
        </CardTitle>
        <CardDescription>Complete activities to earn CareCoins</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Steps */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Footprints className="h-4 w-4" />
              <span className="text-sm font-medium">Daily Steps</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {dailyProgress?.stepsCompleted.toLocaleString()} / {dailyProgress?.stepsGoal.toLocaleString()}
              </span>
              {stepsProgress >= 100 && (
                <Badge variant="default" className="text-xs">
                  <Award className="h-3 w-3 mr-1" />
                  +10 CC
                </Badge>
              )}
            </div>
          </div>
          <Progress value={stepsProgress} />
        </div>

        {/* Vitals Check */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">Vitals Check</span>
            </div>
            {dailyProgress?.vitalsChecked ? (
              <Badge variant="default" className="text-xs">
                <Award className="h-3 w-3 mr-1" />
                +5 CC
              </Badge>
            ) : (
              <Button size="sm" variant="outline">Log Vitals</Button>
            )}
          </div>
        </div>

        {/* Medication Adherence */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="text-sm font-medium">Medication Adherence</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {dailyProgress?.medicationsTaken} / {dailyProgress?.medicationsTotal}
              </span>
              {medsProgress >= 100 && (
                <Badge variant="default" className="text-xs">
                  <Award className="h-3 w-3 mr-1" />
                  +15 CC
                </Badge>
              )}
            </div>
          </div>
          <Progress value={medsProgress} />
        </div>

        {/* Water Intake */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">💧 Water Intake</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {dailyProgress?.waterIntake} / {dailyProgress?.waterGoal} glasses
              </span>
              {waterProgress >= 100 && (
                <Badge variant="default" className="text-xs">
                  <Award className="h-3 w-3 mr-1" />
                  +5 CC
                </Badge>
              )}
            </div>
          </div>
          <Progress value={waterProgress} />
        </div>

        <div className="pt-4 border-t">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Complete all goals to earn bonus CareCoins!
            </p>
            <Button className="w-full">View All Rewards</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}