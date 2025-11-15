import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PatientUpdateData {
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  gender?: string;
  email?: string;
  phone?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  insurance_provider?: string;
  insurance_policy_number?: string;
  medical_record_number?: string;
}

export const useUpdatePatient = (patientId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PatientUpdateData) => {
      const { data: updated, error } = await supabase
        .from('patients')
        .update(data)
        .eq('id', patientId)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-profile', patientId] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Patient information updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update patient: ${error.message}`);
    }
  });
};
