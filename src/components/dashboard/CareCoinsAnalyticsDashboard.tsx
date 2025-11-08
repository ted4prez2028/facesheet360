import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Coins, TrendingUp, Users, DollarSign, PieChart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const CareCoinsAnalyticsDashboard = () => {
  const { user } = useAuth();

  // Fetch overall analytics
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['carecoin-analytics'],
    queryFn: async () => {
      // Get total circulation
      const { data: profiles } = await supabase
        .from('profiles')
        .select('care_coins_balance');

      const totalCirculation = profiles?.reduce(
        (sum, p) => sum + Number(p.care_coins_balance || 0),
        0
      ) || 0;

      // Get transaction breakdown
      const { data: transactions } = await supabase
        .from('care_coins_transactions')
        .select('amount, transaction_type');

      const earned = transactions
        ?.filter(t => t.transaction_type === 'earned')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      const spent = Math.abs(
        transactions
          ?.filter(t => t.transaction_type === 'spent')
          .reduce((sum, t) => sum + Number(t.amount), 0) || 0
      );

      const platformFees = transactions
        ?.filter(t => t.transaction_type === 'platform_fee')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      // Get charting profits
      const { data: chartingProfits } = await supabase
        .from('charting_profits')
        .select('total_amount, patient_share, provider_share, admin_share');

      const totalChartingRevenue = chartingProfits?.reduce(
        (sum, p) => sum + Number(p.total_amount || 0),
        0
      ) || 0;

      const totalPatientEarnings = chartingProfits?.reduce(
        (sum, p) => sum + Number(p.patient_share || 0),
        0
      ) || 0;

      const totalProviderEarnings = chartingProfits?.reduce(
        (sum, p) => sum + Number(p.provider_share || 0),
        0
      ) || 0;

      const totalAdminFees = chartingProfits?.reduce(
        (sum, p) => sum + Number(p.admin_share || 0),
        0
      ) || 0;

      // Get active users count
      const { count: activeUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gt('care_coins_balance', 0);

      return {
        totalCirculation,
        earned,
        spent,
        platformFees,
        totalChartingRevenue,
        totalPatientEarnings,
        totalProviderEarnings,
        totalAdminFees,
        activeUsers: activeUsers || 0,
      };
    },
    enabled: !!user,
  });

  // Fetch category breakdown
  const { data: categoryData } = useQuery({
    queryKey: ['carecoin-category-breakdown'],
    queryFn: async () => {
      const { data: transactions } = await supabase
        .from('care_coins_transactions')
        .select('transaction_type, amount');

      const breakdown: Record<string, number> = {};
      transactions?.forEach(t => {
        const type = t.transaction_type;
        breakdown[type] = (breakdown[type] || 0) + Math.abs(Number(t.amount));
      });

      return Object.entries(breakdown).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }));
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Loading analytics...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const distributionData = [
    { name: 'Patient Share', value: analytics?.totalPatientEarnings || 0 },
    { name: 'Provider Share', value: analytics?.totalProviderEarnings || 0 },
    { name: 'Admin Fees', value: analytics?.totalAdminFees || 0 },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">CareCoin Analytics</h1>
        <p className="text-muted-foreground">Platform-wide CareCoin metrics and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Circulation</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.totalCirculation.toLocaleString() || 0} CC
            </div>
            <p className="text-xs text-muted-foreground">Active in user wallets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{analytics?.earned.toLocaleString() || 0} CC
            </div>
            <p className="text-xs text-muted-foreground">All-time earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {(analytics?.platformFees + analytics?.totalAdminFees).toLocaleString() || 0} CC
            </div>
            <p className="text-xs text-muted-foreground">Admin earnings (10%)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">With CareCoins balance</p>
          </CardContent>
        </Card>
      </div>

      {/* Charting Revenue Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Charting Profit Distribution</CardTitle>
          <CardDescription>
            Breakdown of CareCoins distributed from charting activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">Total Charting Revenue</p>
                  <p className="text-xs text-muted-foreground">All charting activities</p>
                </div>
                <p className="text-2xl font-bold">
                  {analytics?.totalChartingRevenue.toLocaleString() || 0} CC
                </p>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50 dark:bg-green-950">
                <div>
                  <p className="text-sm font-medium">Patient Earnings (40%)</p>
                  <p className="text-xs text-muted-foreground">Direct patient share</p>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {analytics?.totalPatientEarnings.toLocaleString() || 0} CC
                </p>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50 dark:bg-blue-950">
                <div>
                  <p className="text-sm font-medium">Provider Earnings (50%)</p>
                  <p className="text-xs text-muted-foreground">Healthcare staff share</p>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {analytics?.totalProviderEarnings.toLocaleString() || 0} CC
                </p>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg bg-purple-50 dark:bg-purple-950">
                <div>
                  <p className="text-sm font-medium">Admin Fees (10%)</p>
                  <p className="text-xs text-muted-foreground">Platform maintenance</p>
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  {analytics?.totalAdminFees.toLocaleString() || 0} CC
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Transaction Categories
          </CardTitle>
          <CardDescription>Volume by transaction type</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name="CareCoins" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
