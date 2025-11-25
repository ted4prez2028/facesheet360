import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MedicalDiagnosis {
  id?: string;
  patient_id: string;
  icd_code: string;
  description: string;
  clinical_category?: string;
  diagnosis_date?: string;
  diagnosis_rank?: string;
  classification?: string;
  pdpm_comorbidities?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export const useMedicalDiagnoses = (patientId: string) => {
  const queryClient = useQueryClient();

  const { data: diagnoses = [], isLoading } = useQuery({
    queryKey: ['medical-diagnoses', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medical_diagnoses')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MedicalDiagnosis[];
    },
    enabled: !!patientId,
  });

  const addDiagnosis = useMutation({
    mutationFn: async (diagnosis: Omit<MedicalDiagnosis, 'id'>) => {
      const { data, error } = await supabase
        .from('medical_diagnoses')
        .insert(diagnosis)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-diagnoses', patientId] });
      toast.success('Diagnosis added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add diagnosis: ${error.message}`);
    },
  });

  const updateDiagnosis = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MedicalDiagnosis> & { id: string }) => {
      const { data, error } = await supabase
        .from('medical_diagnoses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-diagnoses', patientId] });
      toast.success('Diagnosis updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update diagnosis: ${error.message}`);
    },
  });

  const deleteDiagnosis = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('medical_diagnoses')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-diagnoses', patientId] });
      toast.success('Diagnosis deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete diagnosis: ${error.message}`);
    },
  });

  return {
    diagnoses,
    isLoading,
    addDiagnosis,
    updateDiagnosis,
    deleteDiagnosis,
  };
};
