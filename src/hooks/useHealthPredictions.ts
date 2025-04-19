
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { HealthPrediction, RiskAssessmentData } from '@/types/predictions';
import { toast } from 'sonner';

export const useHealthPredictions = (patientId?: string) => {
  const queryClient = useQueryClient();

  const { data: predictions, isLoading } = useQuery({
    queryKey: ['healthPredictions', patientId],
    queryFn: async () => {
      if (!patientId) return [];
      const { data, error } = await supabase
        .from('health_predictions')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as HealthPrediction[];
    },
    enabled: !!patientId,
  });

  const assessRisks = useMutation({
    mutationFn: async (assessmentData: RiskAssessmentData) => {
      if (!patientId) throw new Error('Patient ID is required');
      
      const { data, error } = await supabase.rpc('assess_health_risks', {
        patient_id_param: patientId,
        assessment_data: assessmentData
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['healthPredictions', patientId] });
      toast.success('Health risk assessment completed');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to complete health risk assessment');
    }
  });

  return {
    predictions,
    isLoading,
    assessRisks
  };
};
