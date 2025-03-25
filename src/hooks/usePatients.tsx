
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPatients, createPatient, updatePatient } from '@/lib/mongodb';
import { toast } from 'sonner';

export interface PatientType {
  _id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  condition: string;
  status: 'Active' | 'Stable' | 'Critical';
  lastVisit: string;
  assignedDoctor: string;
  medicalHistory?: string[];
  medications?: string[];
  allergies?: string[];
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    respiratoryRate?: number;
  };
}

export const usePatients = (filters = {}) => {
  const queryClient = useQueryClient();
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['patients', filters],
    queryFn: () => getPatients(filters),
  });
  
  const createPatientMutation = useMutation({
    mutationFn: (newPatient: Omit<PatientType, '_id'>) => createPatient(newPatient),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Patient added successfully');
    },
    onError: (error) => {
      console.error('Error creating patient:', error);
      toast.error('Failed to add patient');
    }
  });
  
  const updatePatientMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PatientType> }) => 
      updatePatient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Patient updated successfully');
    },
    onError: (error) => {
      console.error('Error updating patient:', error);
      toast.error('Failed to update patient');
    }
  });
  
  return {
    patients: data as PatientType[] || [],
    isLoading,
    error,
    refetch,
    createPatient: createPatientMutation.mutate,
    updatePatient: updatePatientMutation.mutate,
    isCreating: createPatientMutation.isPending,
    isUpdating: updatePatientMutation.isPending,
  };
};
