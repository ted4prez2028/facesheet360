
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
    queryFn: async () => {
      const { data, error } = await supabase
        .from('evaluations')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Evaluation[];
    }
  });

  const addEvaluation = useMutation({
    mutationFn: async (evaluation: Omit<Evaluation, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('evaluations')
        .insert(evaluation)
        .select()
        .single();

      if (error) throw error;
      return data;
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
      const { data, error } = await supabase
        .from('evaluations')
        .update(evaluation)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
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
      const { error } = await supabase
        .from('evaluations')
        .delete()
        .eq('id', id);

      if (error) throw error;
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
