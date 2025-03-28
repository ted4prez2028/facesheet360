
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export interface TodayAppointment {
  id: string;
  patient: string;
  time: string;
  type: string;
  duration: string;
}

/**
 * Fetches today's appointments for the logged-in provider
 */
export const useAppointmentsToday = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['appointments-today', user?.id],
    queryFn: async (): Promise<TodayAppointment[]> => {
      if (!user?.id) return [];
      
      try {
        // Get today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Fetch today's appointments
        const { data: appointments, error } = await supabase
          .from('appointments')
          .select(`
            id,
            appointment_date,
            status,
            notes,
            patients:patient_id (
              first_name,
              last_name
            )
          `)
          .eq('provider_id', user.id)
          .gte('appointment_date', today.toISOString())
          .lt('appointment_date', tomorrow.toISOString())
          .order('appointment_date', { ascending: true });
          
        if (error) throw error;
        
        if (!appointments || appointments.length === 0) {
          console.log("No appointments found for today");
          return [];
        }
        
        // Format the data
        return appointments.map(appointment => {
          const patient = appointment.patients as any;
          const appointmentDate = new Date(appointment.appointment_date);
          
          // Determine appointment type and duration based on notes or status
          let type = "Check-up";
          let duration = "30 min";
          
          if (appointment.notes) {
            const notesLower = appointment.notes.toLowerCase();
            if (notesLower.includes("follow")) {
              type = "Follow-up";
              duration = "20 min";
            } else if (notesLower.includes("consult")) {
              type = "Consultation";
              duration = "45 min";
            } else if (notesLower.includes("procedure") || notesLower.includes("surgery")) {
              type = "Procedure";
              duration = "60 min";
            }
          }
          
          return {
            id: appointment.id,
            patient: `${patient.first_name} ${patient.last_name}`,
            time: appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type,
            duration
          };
        });
      } catch (error) {
        console.error("Error fetching today's appointments:", error);
        toast.error("Failed to load today's appointments");
        return [];
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};
