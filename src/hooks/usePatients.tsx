
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPatients, createPatient, updatePatient } from '@/lib/supabaseApi';
import { toast } from 'sonner';
import { Patient } from '@/types';

export interface PatientType extends Patient {
  // Legacy MongoDB compatibility fields
  _id?: string; 
  name?: string;
  age?: number;
  lastVisit?: string;
}

export const usePatients = (filters = {}) => {
  const queryClient = useQueryClient();
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['patients', filters],
    queryFn: () => getPatients(filters),
  });
  
  // Adapt Supabase data to expected format
  const adaptedPatients = (data || []).map((patient: any): PatientType => {
    // Create a compatible object that includes both old and new fields
    return {
      ...patient,
      _id: patient.id, // For backward compatibility
      name: `${patient.first_name} ${patient.last_name}`, // For backward compatibility
      age: patient.date_of_birth ? calculateAge(patient.date_of_birth) : undefined,
      // Default values for backward compatibility
      condition: 'General checkup',
      status: 'Active',
      lastVisit: new Date().toISOString(),
      assignedDoctor: 'Unassigned'
    };
  });
  
  const createPatientMutation = useMutation({
    mutationFn: (newPatient: Partial<PatientType>) => {
      // Adapt the patient data structure for Supabase
      const supabasePatient: Partial<Patient> = {
        first_name: newPatient.first_name || (newPatient.name ? newPatient.name.split(' ')[0] : ''),
        last_name: newPatient.last_name || (newPatient.name ? newPatient.name.split(' ').slice(1).join(' ') : ''),
        gender: newPatient.gender || 'Unknown',
        phone: newPatient.phone,
        email: newPatient.email,
        medical_record_number: newPatient.medical_record_number,
        insurance_provider: newPatient.insurance_provider,
        policy_number: newPatient.policy_number,
        facial_data: newPatient.facial_data,
        condition: newPatient.condition,
        status: newPatient.status
      };
      
      // Handle date of birth field
      if (newPatient.date_of_birth) {
        supabasePatient.date_of_birth = newPatient.date_of_birth;
      } else if (newPatient.age) {
        const today = new Date();
        today.setFullYear(today.getFullYear() - newPatient.age);
        supabasePatient.date_of_birth = today.toISOString().split('T')[0];
      } else {
        // Default to adult age if nothing provided
        const today = new Date();
        today.setFullYear(today.getFullYear() - 30);
        supabasePatient.date_of_birth = today.toISOString().split('T')[0];
      }
      
      return createPatient(supabasePatient);
    },
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
    mutationFn: ({ id, data }: { id: string; data: Partial<PatientType> }) => {
      // Adapt the patient data structure for Supabase
      const supabasePatient: Partial<Patient> = {};
      
      if (data.first_name || data.name) {
        supabasePatient.first_name = data.first_name || (data.name ? data.name.split(' ')[0] : undefined);
      }
      
      if (data.last_name || data.name) {
        supabasePatient.last_name = data.last_name || (data.name ? data.name.split(' ').slice(1).join(' ') : undefined);
      }
      
      if (data.date_of_birth || data.age) {
        supabasePatient.date_of_birth = data.date_of_birth || 
          (data.age ? new Date(Date.now() - data.age * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined);
      }
      
      if (data.gender) supabasePatient.gender = data.gender;
      if (data.phone) supabasePatient.phone = data.phone;
      if (data.email) supabasePatient.email = data.email;
      if (data.medical_record_number) supabasePatient.medical_record_number = data.medical_record_number;
      if (data.insurance_provider) supabasePatient.insurance_provider = data.insurance_provider;
      if (data.policy_number) supabasePatient.policy_number = data.policy_number;
      if (data.facial_data) supabasePatient.facial_data = data.facial_data;
      if (data.condition) supabasePatient.condition = data.condition;
      if (data.status) supabasePatient.status = data.status;
      
      return updatePatient(id, supabasePatient);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Patient updated successfully');
    },
    onError: (error) => {
      console.error('Error updating patient:', error);
      toast.error('Failed to update patient');
    }
  });

  // Helper function to calculate age from date of birth
  function calculateAge(dateOfBirth: string) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
  
  return {
    patients: adaptedPatients as PatientType[],
    isLoading,
    error,
    refetch,
    createPatient: createPatientMutation.mutate,
    updatePatient: updatePatientMutation.mutate,
    isCreating: createPatientMutation.isPending,
    isUpdating: updatePatientMutation.isPending,
  };
};
