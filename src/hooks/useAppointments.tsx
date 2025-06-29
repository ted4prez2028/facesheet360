
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getAppointments, 
  getPatientAppointments, 
  getTodayAppointments,
  addAppointment, 
  updateAppointment, 
  deleteAppointment,
  Appointment 
} from "@/lib/api/appointmentApi";
import { toast } from "sonner";

// Keys for react-query
const appointmentsKey = "appointments";
const todayAppointmentsKey = "today-appointments";
const patientAppointmentsKey = "patient-appointments";

// Hook to fetch all appointments
export const useAppointments = () => {
  return useQuery({
    queryKey: [appointmentsKey],
    queryFn: getAppointments,
  });
};

// Hook to fetch today's appointments
export const useTodayAppointments = (providerId?: string) => {
  return useQuery({
    queryKey: [todayAppointmentsKey, providerId],
    queryFn: () => getTodayAppointments(providerId),
  });
};

// Hook to fetch appointments for a specific patient
export const usePatientAppointments = (patientId: string) => {
  return useQuery({
    queryKey: [patientAppointmentsKey, patientId],
    queryFn: () => getPatientAppointments(patientId),
    enabled: !!patientId, // Only run query if patientId is provided
  });
};

// Hook to create a new appointment
export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (appointment: Appointment) => addAppointment(appointment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [appointmentsKey] });
      queryClient.invalidateQueries({ queryKey: [todayAppointmentsKey] });
      toast.success("Appointment scheduled successfully");
    },
    onError: (error: unknown) => {
      toast.error(`Failed to schedule appointment: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  });
};

// Hook to update an existing appointment
export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<Appointment> }) => 
      updateAppointment(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [appointmentsKey] });
      queryClient.invalidateQueries({ queryKey: [todayAppointmentsKey] });
      toast.success("Appointment updated successfully");
    },
    onError: (error: unknown) => {
      toast.error(`Failed to update appointment: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  });
};

// Hook to delete an appointment
export const useDeleteAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [appointmentsKey] });
      queryClient.invalidateQueries({ queryKey: [todayAppointmentsKey] });
      toast.success("Appointment cancelled successfully");
    },
    onError: (error: unknown) => {
      toast.error(`Failed to cancel appointment: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  });
};
