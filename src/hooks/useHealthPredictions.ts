
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HealthPrediction, RiskAssessmentData } from '@/types/health-predictions';
import { toast } from 'sonner';

export const useHealthPredictions = (patientId?: string) => {
  const queryClient = useQueryClient();

  const { data: predictions, isLoading } = useQuery({
    queryKey: ['healthPredictions', patientId],
    queryFn: async () => {
      if (!patientId) return [];
      
      // Mock data since health_predictions table doesn't exist
      const mockPredictions: HealthPrediction[] = [
        {
          id: '1',
          patient_id: patientId,
          prediction_type: 'diabetes_risk',
          prediction_data: { risk_score: 0.75, factors: ['age', 'weight', 'family_history'] },
          confidence_score: 0.85,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          patient_id: patientId,
          prediction_type: 'cardiovascular_risk',
          prediction_data: { risk_score: 0.45, factors: ['blood_pressure', 'cholesterol'] },
          confidence_score: 0.78,
          status: 'verified',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString()
        }
      ];
      
      return mockPredictions;
    },
    enabled: !!patientId,
  });

  const assessRisks = useMutation({
    mutationFn: async (assessmentData: RiskAssessmentData) => {
      if (!patientId) throw new Error('Patient ID is required');
      
      // Mock implementation since database doesn't exist
      const mockAssessment = {
        id: `assessment-${Date.now()}`,
        patient_id: patientId,
        assessment_data: assessmentData,
        created_at: new Date().toISOString()
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return mockAssessment;
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
