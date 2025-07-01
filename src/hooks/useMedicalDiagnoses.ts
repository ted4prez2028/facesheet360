
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface MedicalDiagnosis {
  id: string;
  patient_id: string;
  code: string;
  description: string;
  clinical_category?: string;
  category?: string;
  rank?: string;
  classification?: string;
  pdpm_comorbidities?: string;
  date?: string;
  status: string;
  created_at: string;
  updated_at: string;
  createdDate?: string;
  createdBy?: string;
  [key: string]: any; // Index signature for DataItem compatibility
}

export function useMedicalDiagnoses(patientId: string) {
  const queryClient = useQueryClient();

  const { data: diagnoses, isLoading } = useQuery({
    queryKey: ['medical-diagnoses', patientId],
    queryFn: async () => {
      // Mock data since medical_diagnoses table doesn't exist
      const mockDiagnoses: MedicalDiagnosis[] = [
        {
          id: '1',
          patient_id: patientId,
          code: 'I10',
          description: 'Essential (primary) hypertension',
          clinical_category: 'Cardiovascular',
          category: 'Primary',
          rank: '1',
          classification: 'Chronic',
          pdpm_comorbidities: 'Hypertension',
          date: new Date().toISOString(),
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          createdDate: new Date().toISOString(),
          createdBy: 'Dr. Smith'
        },
        {
          id: '2',
          patient_id: patientId,
          code: 'E11.9',
          description: 'Type 2 diabetes mellitus without complications',
          clinical_category: 'Endocrine',
          category: 'Primary',
          rank: '2',
          classification: 'Chronic',
          pdpm_comorbidities: 'Diabetes',
          date: new Date(Date.now() - 86400000).toISOString(),
          status: 'active',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString(),
          createdDate: new Date(Date.now() - 86400000).toISOString(),
          createdBy: 'Dr. Johnson'
        }
      ];
      
      return mockDiagnoses;
    }
  });

  const addDiagnosis = useMutation({
    mutationFn: async (diagnosis: Omit<MedicalDiagnosis, 'id' | 'created_at' | 'updated_at'>) => {
      // Mock implementation
      const mockDiagnosis: MedicalDiagnosis = {
        ...diagnosis,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return mockDiagnosis;
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
      // Mock implementation - ensure all required fields are present
      const mockUpdatedDiagnosis: MedicalDiagnosis = {
        id,
        patient_id: patientId,
        code: 'Updated Code',
        description: 'Updated diagnosis',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...diagnosis
      };
      
      return mockUpdatedDiagnosis;
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
      // Mock implementation
      console.log('Mock deleting diagnosis:', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-diagnoses', patientId] });
      toast.success('Diagnosis deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete diagnosis');
      console.error('Error deleting diagnosis');
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
