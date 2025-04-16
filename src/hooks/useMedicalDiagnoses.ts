
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MedicalDiagnosis {
  id: string;
  patient_id: string;
  code: string;
  description: string;
  clinical_category?: string;
  rank?: string;
  classification?: string;
  pdpm_comorbidities?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export function useMedicalDiagnoses(patientId: string) {
  const queryClient = useQueryClient();

  const { data: diagnoses, isLoading } = useQuery({
    queryKey: ['medical-diagnoses', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medical_diagnoses')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MedicalDiagnosis[];
    }
  });

  const addDiagnosis = useMutation({
    mutationFn: async (diagnosis: Omit<MedicalDiagnosis, 'id' | 'created_at' | 'updated_at'>) => {
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
    onError: (error) => {
      toast.error('Failed to add diagnosis');
      console.error('Error adding diagnosis:', error);
    }
  });

  const updateDiagnosis = useMutation({
    mutationFn: async ({ id, ...diagnosis }: Partial<MedicalDiagnosis> & { id: string }) => {
      const { data, error } = await supabase
        .from('medical_diagnoses')
        .update(diagnosis)
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
    onError: (error) => {
      toast.error('Failed to update diagnosis');
      console.error('Error updating diagnosis:', error);
    }
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
    onError: (error) => {
      toast.error('Failed to delete diagnosis');
      console.error('Error deleting diagnosis:', error);
    }
  });

  return {
    diagnoses,
    isLoading,
    addDiagnosis,
    updateDiagnosis,
    deleteDiagnosis
  };
}
