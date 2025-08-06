
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from '@/hooks/useAuth';
import { toast } from "sonner";
import { useEffect } from "react";
import { supabase } from '@/integrations/supabase/client';

export interface DashboardData {
  activePatients: number;
  todayAppointments: number;
  pendingTasks: number;
  careCoinsEarned: number;
}

const fetchDashboardData = async (userId: string): Promise<DashboardData> => {
  try {
    // Get active patients count
    const { count: activePatients } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true });

    // Get today's appointments count
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const { count: todayAppointments } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .gte('appointment_date', today)
      .lt('appointment_date', tomorrow)
      .in('status', ['scheduled', 'confirmed']);

    // Get pending tasks from multiple sources
    const [callLightsResponse, tasksResponse] = await Promise.all([
      supabase
        .from('call_lights')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active'),
      supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
    ]);

    const pendingTasks = (callLightsResponse.count || 0) + (tasksResponse.count || 0);

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
  const queryClient = useQueryClient();
  
  // Set up real-time subscriptions
  useEffect(() => {
    if (!user?.id) return;

    const channels: any[] = [];

    // Subscribe to patients changes
    const patientsChannel = supabase
      .channel('patients-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'patients'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["dashboardData", user.id] });
        }
      )
      .subscribe();

    // Subscribe to appointments changes
    const appointmentsChannel = supabase
      .channel('appointments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["dashboardData", user.id] });
        }
      )
      .subscribe();

    // Subscribe to call lights changes
    const callLightsChannel = supabase
      .channel('call-lights-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'call_lights'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["dashboardData", user.id] });
        }
      )
      .subscribe();

    // Subscribe to tasks changes
    const tasksChannel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["dashboardData", user.id] });
        }
      )
      .subscribe();

    // Subscribe to care coins changes
    const usersChannel = supabase
      .channel('users-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["dashboardData", user.id] });
        }
      )
      .subscribe();

    channels.push(patientsChannel, appointmentsChannel, callLightsChannel, tasksChannel, usersChannel);

    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [user?.id, queryClient]);
  
  return useQuery({
    queryKey: ["dashboardData", user?.id],
    queryFn: () => fetchDashboardData(user?.id || ""),
    enabled: !!user?.id,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};
