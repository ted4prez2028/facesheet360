import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, DollarSign, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { toast } from 'sonner';

interface AnalyticsData {
  date: string;
  total_transactions: number;
  total_volume: number;
  inflow: number;
  outflow: number;
  charting_revenue: number;
  admin_fees: number;
  active_users: number;
}

const CareCoinsAnalytics: React.FC = () => {
  const { isAdmin, isLoading: adminLoading } = useAdminStatus();
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    if (isAdmin) {
      fetchAnalytics();
    }
  }, [isAdmin, timeRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const { data, error } = await supabase
        .from('carecoin_analytics')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) throw error;

      setAnalytics((data || []) as AnalyticsData[]);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  if (adminLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">Checking permissions...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>
              This analytics dashboard is only available to administrators.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const totalVolume = analytics.reduce((sum, day) => sum + (day.total_volume || 0), 0);
  const totalInflow = analytics.reduce((sum, day) => sum + (day.inflow || 0), 0);
  const totalOutflow = analytics.reduce((sum, day) => sum + (day.outflow || 0), 0);
  const totalAdminFees = analytics.reduce((sum, day) => sum + (day.admin_fees || 0), 0);
  const totalChartingRevenue = analytics.reduce((sum, day) => sum + (day.charting_revenue || 0), 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CareCoins Analytics</h1>
          <p className="text-muted-foreground">Money flow tracking and insights</p>
        </div>
        <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
          <TabsList>
            <TabsTrigger value="7d">7 Days</TabsTrigger>
            <TabsTrigger value="30d">30 Days</TabsTrigger>
            <TabsTrigger value="90d">90 Days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Volume</p>
                <p className="text-2xl font-bold">{totalVolume.toLocaleString()} CC</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Inflow</p>
                <p className="text-2xl font-bold flex items-center gap-2">
                  {totalInflow.toLocaleString()} CC
                  <ArrowDownRight className="h-5 w-5 text-green-500" />
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Outflow</p>
                <p className="text-2xl font-bold flex items-center gap-2">
                  {totalOutflow.toLocaleString()} CC
                  <ArrowUpRight className="h-5 w-5 text-red-500" />
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Admin Fees</p>
                <p className="text-2xl font-bold">{totalAdminFees.toLocaleString()} CC</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Breakdown</CardTitle>
          <CardDescription>CareCoins earned by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Charting Revenue</p>
                <p className="text-sm text-muted-foreground">From patient charting activities</p>
              </div>
              <p className="text-xl font-bold">{totalChartingRevenue.toLocaleString()} CC</p>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Platform Fees (10%)</p>
                <p className="text-sm text-muted-foreground">Admin share from charting</p>
              </div>
              <p className="text-xl font-bold text-purple-600">{totalAdminFees.toLocaleString()} CC</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Breakdown</CardTitle>
          <CardDescription>Detailed money flow by day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Date</th>
                  <th className="text-right p-2">Transactions</th>
                  <th className="text-right p-2">Volume</th>
                  <th className="text-right p-2">Inflow</th>
                  <th className="text-right p-2">Outflow</th>
                  <th className="text-right p-2">Fees</th>
                  <th className="text-right p-2">Active Users</th>
                </tr>
              </thead>
              <tbody>
                {analytics.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-muted-foreground">
                      No analytics data available for this time range
                    </td>
                  </tr>
                ) : (
                  analytics.map((day) => (
                    <tr key={day.date} className="border-b hover:bg-muted/50">
                      <td className="p-2">{new Date(day.date).toLocaleDateString()}</td>
                      <td className="text-right p-2">{day.total_transactions}</td>
                      <td className="text-right p-2">{day.total_volume.toLocaleString()}</td>
                      <td className="text-right p-2 text-green-600">{day.inflow.toLocaleString()}</td>
                      <td className="text-right p-2 text-red-600">{day.outflow.toLocaleString()}</td>
                      <td className="text-right p-2 text-purple-600">{day.admin_fees.toLocaleString()}</td>
                      <td className="text-right p-2">{day.active_users}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CareCoinsAnalytics;