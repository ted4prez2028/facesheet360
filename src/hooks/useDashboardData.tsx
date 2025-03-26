
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export interface DashboardData {
  activePatients: number;
  todayAppointments: number;
  pendingTasks: number;
  careCoinsEarned: number;
}

const fetchDashboardData = async (userId: string): Promise<DashboardData> => {
  try {
    // Get active patients count
    const { count: activePatients, error: patientsError } = await supabase
      .from("patients")
      .select("*", { count: "exact", head: true });

    if (patientsError) throw patientsError;

    // Get today's appointments count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { count: todayAppointments, error: appointmentsError } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("provider_id", userId)
      .gte("appointment_date", today.toISOString())
      .lt("appointment_date", tomorrow.toISOString());

    if (appointmentsError) throw appointmentsError;

    // Get pending tasks count (we'll use chart_records that need review as a proxy for tasks)
    const { count: pendingTasks, error: tasksError } = await supabase
      .from("chart_records")
      .select("*", { count: "exact", head: true })
      .eq("provider_id", userId)
      .is("notes", null); // Assuming null notes means it needs review

    if (tasksError) throw tasksError;

    // Get CareCoins earned
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("care_coins_balance")
      .eq("id", userId)
      .single();

    if (userError) throw userError;

    return {
      activePatients: activePatients || 0,
      todayAppointments: todayAppointments || 0,
      pendingTasks: pendingTasks || 0,
      careCoinsEarned: userData?.care_coins_balance || 0,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    toast.error("Failed to load dashboard data");
    return {
      activePatients: 0,
      todayAppointments: 0,
      pendingTasks: 0,
      careCoinsEarned: 0,
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
