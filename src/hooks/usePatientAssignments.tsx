import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getPatientAssignments, 
  createPatientAssignment, 
  deletePatientAssignment,
  getUsersByRole,
  PatientAssignment
} from "@/lib/api/patientAssignmentsApi";
import { toast } from "sonner";

export const usePatientAssignments = (patientId: string) => {
  return useQuery({
    queryKey: ['patient-assignments', patientId],
    queryFn: () => getPatientAssignments(patientId),
    enabled: !!patientId
  });
};

export const useUsersByRole = (role?: string) => {
  return useQuery({
    queryKey: ['users-by-role', role],
    queryFn: () => getUsersByRole(role),
  });
};

export const useCreatePatientAssignment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (assignment: Omit<PatientAssignment, 'id'>) => 
      createPatientAssignment(assignment),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patient-assignments', variables.patient_id] });
      toast.success("Care team member assigned successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to assign care team member: ${error.message}`);
    }
  });
};

export const useDeletePatientAssignment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deletePatientAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-assignments'] });
      toast.success("Care team member removed successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove care team member: ${error.message}`);
    }
  });
};
