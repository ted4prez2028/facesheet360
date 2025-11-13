import { useQuery } from "@tanstack/react-query";
import { supabase } from '@/integrations/supabase/client';

export interface AdminStats {
  totalUsers: number;
  totalPatients: number;
  careCoinsCirculation: number;
  platformRevenue: number;
  usersGrowth: number;
  careCoinsGrowth: number;
  revenueGrowth: number;
}

const fetchAdminStats = async (): Promise<AdminStats> => {
  try {
    // Get total users count
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get total patients count  
    const { count: totalPatients } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true });

    // Get total CareCoins in circulation (sum of all user balances)
    const { data: balances } = await supabase
      .from('profiles')
      .select('care_coins_balance');
    
    const careCoinsCirculation = balances?.reduce((sum, profile) => 
      sum + (profile.care_coins_balance || 0), 0) || 0;

    // Get platform revenue (sum of admin_share from charting_profits)
    const { data: profits } = await supabase
      .from('charting_profits')
      .select('admin_share');
    
    const platformRevenue = profits?.reduce((sum, profit) => 
      sum + (Number(profit.admin_share) || 0), 0) || 0;

    // Calculate growth percentages (comparing last 30 days vs previous 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Users growth
    const { count: recentUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString());

    const { count: previousUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sixtyDaysAgo.toISOString())
      .lt('created_at', thirtyDaysAgo.toISOString());

    const usersGrowth = previousUsers && previousUsers > 0 
      ? ((recentUsers || 0) - previousUsers) / previousUsers * 100
      : 0;

    // CareCoins growth
    const { data: recentTransactions } = await supabase
      .from('care_coins_transactions')
      .select('amount')
      .gte('created_at', thirtyDaysAgo.toISOString());

    const { data: previousTransactions } = await supabase
      .from('care_coins_transactions')
      .select('amount')
      .gte('created_at', sixtyDaysAgo.toISOString())
      .lt('created_at', thirtyDaysAgo.toISOString());

    const recentVolume = recentTransactions?.reduce((sum, t) => sum + (Number(t.amount) || 0), 0) || 0;
    const previousVolume = previousTransactions?.reduce((sum, t) => sum + (Number(t.amount) || 0), 0) || 0;

    const careCoinsGrowth = previousVolume > 0 
      ? (recentVolume - previousVolume) / previousVolume * 100
      : 0;

    // Revenue growth
    const { data: recentRevenue } = await supabase
      .from('charting_profits')
      .select('admin_share')
      .gte('created_at', thirtyDaysAgo.toISOString());

    const { data: previousRevenue } = await supabase
      .from('charting_profits')
      .select('admin_share')
      .gte('created_at', sixtyDaysAgo.toISOString())
      .lt('created_at', thirtyDaysAgo.toISOString());

    const recentRevenueTotal = recentRevenue?.reduce((sum, p) => sum + (Number(p.admin_share) || 0), 0) || 0;
    const previousRevenueTotal = previousRevenue?.reduce((sum, p) => sum + (Number(p.admin_share) || 0), 0) || 0;

    const revenueGrowth = previousRevenueTotal > 0 
      ? (recentRevenueTotal - previousRevenueTotal) / previousRevenueTotal * 100
      : 0;

    return {
      totalUsers: totalUsers || 0,
      totalPatients: totalPatients || 0,
      careCoinsCirculation: Math.round(careCoinsCirculation),
      platformRevenue: Math.round(platformRevenue * 100) / 100,
      usersGrowth: Math.round(usersGrowth * 10) / 10,
      careCoinsGrowth: Math.round(careCoinsGrowth * 10) / 10,
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return {
      totalUsers: 0,
      totalPatients: 0,
      careCoinsCirculation: 0,
      platformRevenue: 0,
      usersGrowth: 0,
      careCoinsGrowth: 0,
      revenueGrowth: 0,
    };
  }
};

export const useAdminStats = () => {
  return useQuery({
    queryKey: ["adminStats"],
    queryFn: fetchAdminStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};
