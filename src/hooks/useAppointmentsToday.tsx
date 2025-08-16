
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getTodayAppointments } from "@/lib/api/appointmentApi";

export interface TodayAppointment {
  id: string;
  patient: string;
  time: string;
  type: string;
  duration: number; // Changed from string to number to match types/index.ts
}

/**
 * Hook for today's appointments from the database
 */
export const useAppointmentsToday = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['appointments-today', user?.id],
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    queryFn: async (): Promise<TodayAppointment[]> => {
      if (!user?.id) return [];

      try {
        const appointments = await getTodayAppointments(user.id);
        return (appointments || []).map((appointment: any) => ({
          id: appointment.id,
          patient: appointment.patients
            ? `${appointment.patients.first_name} ${appointment.patients.last_name}`
            : 'Unknown Patient',
          time: new Date(appointment.appointment_date).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }),
          type: appointment.notes || 'Appointment',
          duration: 30 // Default duration in minutes as number
        }));
      } catch (error) {
        console.error('Error fetching appointments:', error);
        return [];
      }
    }
  });
};
