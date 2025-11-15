import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Evaluation {
  id: string;
  patient_id: string;
  evaluation_type: string;
  evaluator_id: string;
  evaluation_date: string;
  findings: any;
  recommendations?: string;
  follow_up_required?: boolean;
  follow_up_date?: string;
  status: string;
  created_at: string;
  updated_at: string;
  // Legacy fields for compatibility
  type?: string;
  category?: string;
  score?: string;
  description: string;
  created_by: string;
  revised_by?: string;
  [key: string]: any;
}

export function useEvaluations(patientId: string) {
  const queryClient = useQueryClient();

  const { data: evaluations = [], isLoading } = useQuery({
    queryKey: ['evaluations', patientId],
    queryFn: async (): Promise<Evaluation[]> => {
      const { data, error } = await supabase
        .from('evaluations')
        .select('*')
        .eq('patient_id', patientId)
        .order('evaluation_date', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(evaluation => ({
        ...evaluation,
        type: evaluation.evaluation_type,
        category: 'General',
        description: evaluation.recommendations || 'Evaluation completed',
        created_by: evaluation.evaluator_id,
        score: evaluation.status === 'completed' ? 'Complete' : 'Pending'
      })) as Evaluation[];
    },
    enabled: !!patientId
  });

  const addEvaluation = useMutation({
    mutationFn: async (evaluation: Omit<Evaluation, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('evaluations')
        .insert({
          patient_id: evaluation.patient_id,
          evaluation_type: evaluation.type || evaluation.evaluation_type || 'Standard',
          evaluator_id: evaluation.created_by,
          evaluation_date: new Date().toISOString(),
          findings: { description: evaluation.description },
          recommendations: evaluation.description,
          status: evaluation.status || 'completed'
        })
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
        .update({
          evaluation_type: evaluation.type || evaluation.evaluation_type,
          findings: { description: evaluation.description },
          recommendations: evaluation.description,
          status: evaluation.status
        })
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
