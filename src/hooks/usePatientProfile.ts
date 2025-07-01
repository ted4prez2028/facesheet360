
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/types';

export function usePatientProfile(patientId: string) {
  return useQuery({
    queryKey: ['patient-profile', patientId],
    queryFn: async (): Promise<Patient | null> => {
      if (!patientId) return null;
      
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (error) {
        console.error('Error fetching patient profile:', error);
        return null;
      }

      return data as Patient;
    },
    enabled: !!patientId
  });
}
