
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from '@/integrations/supabase/client';

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
    queryFn: async (): Promise<TodayAppointment[]> => {
      if (!user?.id) return [];
      
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients:patient_id (
            name
          )
        `)
        .gte('appointment_date', todayStart.toISOString())
        .lt('appointment_date', todayEnd.toISOString())
        .order('appointment_date', { ascending: true });

      if (error) {
        console.error('Error fetching appointments:', error);
        return [];
      }

      return (data || []).map((appointment: any) => ({
        id: appointment.id,
        patient: appointment.patients?.name || 'Unknown Patient',
        time: new Date(appointment.appointment_date).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        type: appointment.appointment_type || 'Appointment',
        duration: appointment.duration_minutes || 30
      }));
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};
