import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getLabResults, 
  createLabResult, 
  updateLabResult, 
  deleteLabResult,
  LabResult
} from "@/lib/api/labsApi";
import { toast } from "sonner";

export const useLabResults = (patientId: string) => {
  return useQuery({
    queryKey: ['lab-results', patientId],
    queryFn: () => getLabResults(patientId),
    enabled: !!patientId
  });
};

export const useCreateLabResult = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (labResult: Omit<LabResult, 'id'>) => createLabResult(labResult),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lab-results', variables.patient_id] });
      toast.success("Lab result added successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to add lab result: ${error.message}`);
    }
  });
};

export const useUpdateLabResult = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<LabResult> }) =>
      updateLabResult(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-results'] });
      toast.success("Lab result updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update lab result: ${error.message}`);
    }
  });
};

export const useDeleteLabResult = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteLabResult,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-results'] });
      toast.success("Lab result deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete lab result: ${error.message}`);
    }
  });
};
