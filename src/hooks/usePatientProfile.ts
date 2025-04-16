
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePatientProfile(patientId: string) {
  return useQuery({
    queryKey: ['patient-profile', patientId],
    queryFn: async () => {
      const { data: patient, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (error) throw error;
      return patient;
    }
  });
}
