
import { useQuery } from "@tanstack/react-query";
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
    // Mock data since the required tables don't exist in the database
    return {
      activePatients: 15,
      todayAppointments: 8,
      pendingTasks: 3,
      careCoinsEarned: 150,
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
