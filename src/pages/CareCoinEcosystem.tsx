// @ts-nocheck
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Store, Award, TrendingUp, DollarSign, Gift, Lock, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

export default function CareCoinEcosystem() {
  const { user } = useAuth();

  // Fetch merchants
  const { data: merchants = [] } = useQuery({
    queryKey: ['carecoin-merchants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('carecoin_merchants')
        .select('*')
        .eq('active', true)
        .order('merchant_name');
      if (error) throw error;
      return data;
    },
  });

  // Fetch health rewards
  const { data: rewards = [] } = useQuery({
    queryKey: ['health-rewards', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('health_rewards')
        .select('*')
        .eq('user_id', user.id)
        .order('awarded_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch staking positions
  const { data: stakes = [] } = useQuery({
    queryKey: ['carecoin-staking', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('carecoin_staking')
        .select('*')
        .eq('user_id', user.id)
        .order('stake_start_date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const totalRewardsEarned = rewards.reduce((sum: number, r: any) => sum + r.coins_awarded, 0);
  const totalStaked = stakes.filter((s: any) => s.status === 'active').reduce((sum: number, s: any) => sum + s.staked_amount, 0);
  const totalStakingRewards = stakes.reduce((sum: number, s: any) => sum + s.rewards_earned, 0);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">CareCoin Ecosystem</h1>
        <p className="text-muted-foreground">Expanded utility and earning opportunities</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4" />
              Total Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRewardsEarned.toFixed(2)} CC</div>
            <p className="text-xs text-muted-foreground">Health activities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Staked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStaked.toFixed(2)} CC</div>
            <p className="text-xs text-muted-foreground">Earning rewards</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Staking Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{totalStakingRewards.toFixed(2)} CC</div>
            <p className="text-xs text-muted-foreground">Passive income</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Store className="h-4 w-4" />
              Merchants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{merchants.length}</div>
            <p className="text-xs text-muted-foreground">Accepting CareCoins</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="merchants" className="space-y-6">
        <TabsList>
          <TabsTrigger value="merchants">Merchants</TabsTrigger>
          <TabsTrigger value="rewards">Health Rewards</TabsTrigger>
          <TabsTrigger value="staking">Staking</TabsTrigger>
        </TabsList>

        <TabsContent value="merchants">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                CareCoin Merchants
              </CardTitle>
              <CardDescription>Healthcare providers and suppliers accepting CareCoins</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {merchants.map((merchant: any) => (
                <Card key={merchant.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{merchant.merchant_name}</CardTitle>
                        <Badge variant="secondary" className="mt-1 capitalize">
                          {merchant.merchant_type.replace('_', ' ')}
                        </Badge>
                      </div>
                      {merchant.verified && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {merchant.discount_percentage && (
                      <div className="text-sm mb-2">
                        <span className="font-semibold text-primary">
                          {merchant.discount_percentage}% OFF
                        </span>
                        <span className="text-muted-foreground"> with CareCoins</span>
                      </div>
                    )}
                    {merchant.address && (
                      <div className="text-xs text-muted-foreground mb-2">{merchant.address}</div>
                    )}
                    <Button size="sm" className="w-full mt-2">View Details</Button>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Health Rewards Program
              </CardTitle>
              <CardDescription>Earn CareCoins for healthy activities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {rewards.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Gift className="h-16 w-16 mx-auto mb-4" />
                  <p className="text-lg font-medium">Start Earning Rewards!</p>
                  <p className="text-sm mt-2">Complete health activities to earn CareCoins</p>
                  <div className="grid grid-cols-2 gap-4 mt-6 max-w-md mx-auto">
                    <Card className="p-4 text-center">
                      <div className="font-bold text-lg text-primary">10 CC</div>
                      <div className="text-xs text-muted-foreground">Daily vitals check</div>
                    </Card>
                    <Card className="p-4 text-center">
                      <div className="font-bold text-lg text-primary">50 CC</div>
                      <div className="text-xs text-muted-foreground">Preventive care visit</div>
                    </Card>
                  </div>
                </div>
              ) : (
                rewards.map((reward: any) => (
                  <div key={reward.id} className="border rounded-lg p-3 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="capitalize">
                          {reward.reward_type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(reward.activity_date), 'MMM d, yyyy')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-primary">+{reward.coins_awarded} CC</div>
                      <div className="text-xs text-muted-foreground">Reward</div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staking">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                CareCoin Staking
              </CardTitle>
              <CardDescription>Stake CareCoins to earn passive income</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Staking Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-primary/5">
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-primary">5%</div>
                    <div className="text-sm text-muted-foreground">30-day APY</div>
                  </CardContent>
                </Card>
                <Card className="bg-primary/5">
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-primary">8%</div>
                    <div className="text-sm text-muted-foreground">90-day APY</div>
                  </CardContent>
                </Card>
                <Card className="bg-primary/5">
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-primary">12%</div>
                    <div className="text-sm text-muted-foreground">180-day APY</div>
                  </CardContent>
                </Card>
              </div>

              {/* Active Stakes */}
              <div className="space-y-3">
                <h3 className="font-semibold">Your Staking Positions</h3>
                {stakes.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No active stakes</p>
                    <Button>Start Staking</Button>
                  </div>
                ) : (
                  stakes.map((stake: any) => (
                    <div key={stake.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={stake.status === 'active' ? 'default' : 'secondary'}>
                              {stake.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {stake.staking_period_days} days @ {stake.apy_rate}% APY
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Staked:</span> {stake.staked_amount.toFixed(2)} CC
                            </div>
                            <div>
                              <span className="text-muted-foreground">Earned:</span> 
                              <span className="text-green-500 font-medium"> +{stake.rewards_earned.toFixed(2)} CC</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Started:</span> {format(new Date(stake.stake_start_date), 'MMM d, yyyy')}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Ends:</span> {format(new Date(stake.stake_end_date), 'MMM d, yyyy')}
                            </div>
                          </div>
                        </div>
                        {stake.status === 'active' && (
                          <Button variant="outline" size="sm">Unstake</Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}