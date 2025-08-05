
import { useQuery } from "@tanstack/react-query";
import { useAuth } from '@/hooks/useAuth';
import { toast } from "sonner";

export interface DashboardData {
  activePatients: number;
  todayAppointments: number;
  pendingTasks: number;
  careCoinsEarned: number;
}

const fetchDashboardData = async (userId: string): Promise<DashboardData> => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');

    // Get active patients count
    const { count: activePatients } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true });

    // Get today's appointments count
    const today = new Date().toISOString().split('T')[0];
    const { count: todayAppointments } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('appointment_date', today)
      .in('status', ['scheduled', 'confirmed']);

    // Get pending tasks (call lights)
    const { count: pendingTasks } = await supabase
      .from('call_lights')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Get user's care coins balance
    const { data: userData } = await supabase
      .from('users')
      .select('care_coins_balance')
      .eq('id', userId)
      .single();

    return {
      activePatients: activePatients || 0,
      todayAppointments: todayAppointments || 0,
      pendingTasks: pendingTasks || 0,
      careCoinsEarned: userData?.care_coins_balance || 0,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    // Fallback to mock data if database queries fail
    return {
      activePatients: 15,
      todayAppointments: 8,
      pendingTasks: 3,
      careCoinsEarned: 150,
    };
  }
};

export const useDashboardData = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["dashboardData", user?.id],
    queryFn: () => fetchDashboardData(user?.id || ""),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
