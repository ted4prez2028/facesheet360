
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

export interface TodayAppointment {
  id: string;
  patient: string;
  time: string;
  type: string;
  duration: string;
}

/**
 * Mock hook for today's appointments since appointments table doesn't exist in current schema
 */
export const useAppointmentsToday = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['appointments-today', user?.id],
    queryFn: async (): Promise<TodayAppointment[]> => {
      if (!user?.id) return [];
      
      // Mock data since appointments table doesn't exist
      return [
        {
          id: '1',
          patient: 'John Smith',
          time: '09:00 AM',
          type: 'Check-up',
          duration: '30 min'
        },
        {
          id: '2',
          patient: 'Sarah Johnson',
          time: '10:30 AM',
          type: 'Follow-up',
          duration: '20 min'
        },
        {
          id: '3',
          patient: 'Michael Brown',
          time: '02:00 PM',
          type: 'Consultation',
          duration: '45 min'
        }
      ];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};
