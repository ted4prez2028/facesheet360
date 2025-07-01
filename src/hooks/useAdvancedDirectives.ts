
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface AdvancedDirective {
  id: string;
  patient_id: string;
  directive_type: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  start_date: string;
  end_date?: string;
  created_by?: string;
}

export function useAdvancedDirectives(patientId: string) {
  const queryClient = useQueryClient();

  const { data: directives, isLoading } = useQuery({
    queryKey: ['advanced-directives', patientId],
    queryFn: async () => {
      // Mock data since advanced_directives table doesn't exist
      return [
        {
          id: '1',
          patient_id: patientId,
          directive_type: 'DNR',
          description: 'Do Not Resuscitate order',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          start_date: new Date().toISOString(),
          created_by: 'Dr. Smith'
        }
      ] as AdvancedDirective[];
    }
  });

  const addDirective = useMutation({
    mutationFn: async (directive: Omit<AdvancedDirective, 'id' | 'created_at' | 'updated_at'>) => {
      // Mock implementation
      return {
        ...directive,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advanced-directives', patientId] });
      toast.success('Advanced directive added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add advanced directive');
      console.error('Error adding advanced directive:', error);
    }
  });

  const updateDirective = useMutation({
    mutationFn: async ({ id, ...directive }: Partial<AdvancedDirective> & { id: string }) => {
      // Mock implementation
      return {
        ...directive,
        id,
        updated_at: new Date().toISOString()
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advanced-directives', patientId] });
      toast.success('Advanced directive updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update advanced directive');
      console.error('Error updating advanced directive:', error);
    }
  });

  const deleteDirective = useMutation({
    mutationFn: async (id: string) => {
      // Mock implementation
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advanced-directives', patientId] });
      toast.success('Advanced directive deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete advanced directive');
      console.error('Error deleting advanced directive:', error);
    }
  });

  return {
    directives,
    isLoading,
    addDirective,
    updateDirective,
    deleteDirective
  };
}
