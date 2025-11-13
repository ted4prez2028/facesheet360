import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getImagingStudies, 
  createImagingStudy, 
  updateImagingStudy, 
  deleteImagingStudy,
  ImagingStudy
} from "@/lib/api/imagingApi";
import { toast } from "sonner";

export const useImagingStudies = (patientId: string) => {
  return useQuery({
    queryKey: ['imaging-studies', patientId],
    queryFn: () => getImagingStudies(patientId),
    enabled: !!patientId
  });
};

export const useCreateImagingStudy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (study: Omit<ImagingStudy, 'id'>) => createImagingStudy(study),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['imaging-studies', variables.patient_id] });
      toast.success("Imaging study added successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to add imaging study: ${error.message}`);
    }
  });
};

export const useUpdateImagingStudy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ImagingStudy> }) =>
      updateImagingStudy(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imaging-studies'] });
      toast.success("Imaging study updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update imaging study: ${error.message}`);
    }
  });
};

export const useDeleteImagingStudy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteImagingStudy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imaging-studies'] });
      toast.success("Imaging study deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete imaging study: ${error.message}`);
    }
  });
};
