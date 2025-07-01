
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface Evaluation {
  id: string;
  patient_id: string;
  type?: string;
  category?: string;
  score?: string;
  status: string;
  description: string;
  created_by: string;
  revised_by?: string;
  created_at: string;
  updated_at: string;
  [key: string]: any; // Index signature for DataItem compatibility
}

export function useEvaluations(patientId: string) {
  const queryClient = useQueryClient();

  const { data: evaluations, isLoading } = useQuery({
    queryKey: ['evaluations', patientId],
    queryFn: async (): Promise<Evaluation[]> => {
      // Mock data since evaluations table doesn't exist
      return [
        {
          id: '1',
          patient_id: patientId,
          type: 'Physical Assessment',
          category: 'General',
          score: 'Good',
          status: 'completed',
          description: 'Patient shows good overall physical condition with stable vital signs.',
          created_by: 'Dr. Smith',
          revised_by: undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          patient_id: patientId,
          type: 'Cognitive Assessment',
          category: 'Mental Health',
          score: 'Fair',
          status: 'in_progress',
          description: 'Patient demonstrates adequate cognitive function with minor memory concerns.',
          created_by: 'Dr. Johnson',
          revised_by: undefined,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString()
        }
      ];
    }
  });

  const addEvaluation = useMutation({
    mutationFn: async (evaluation: Omit<Evaluation, 'id' | 'created_at' | 'updated_at'>) => {
      // Mock implementation
      const mockEvaluation: Evaluation = {
        ...evaluation,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return mockEvaluation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluations', patientId] });
      toast.success('Evaluation added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add evaluation');
      console.error('Error adding evaluation:', error);
    }
  });

  const updateEvaluation = useMutation({
    mutationFn: async ({ id, ...evaluation }: Partial<Evaluation> & { id: string }) => {
      // Mock implementation - ensure all required fields are present
      const mockUpdatedEvaluation: Evaluation = {
        id,
        patient_id: patientId,
        status: 'updated',
        description: 'Updated evaluation',
        created_by: 'Mock Provider',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...evaluation
      };
      
      return mockUpdatedEvaluation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluations', patientId] });
      toast.success('Evaluation updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update evaluation');
      console.error('Error updating evaluation:', error);
    }
  });

  const deleteEvaluation = useMutation({
    mutationFn: async (id: string) => {
      // Mock implementation
      console.log('Mock deleting evaluation:', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluations', patientId] });
      toast.success('Evaluation deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete evaluation');
      console.error('Error deleting evaluation:', error);
    }
  });

  return {
    evaluations,
    isLoading,
    addEvaluation,
    updateEvaluation,
    deleteEvaluation
  };
}
