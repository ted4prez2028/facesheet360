
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/types';

export function usePatientProfile(patientId: string) {
  return useQuery({
    queryKey: ['patient-profile', patientId],
    queryFn: async (): Promise<Patient | null> => {
      if (!patientId) return null;
      
      console.log('Fetching patient profile for:', patientId);
      
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (error) {
        console.error('Error fetching patient profile:', error);
        return null;
      }

      console.log('Fetched patient data:', data);

      // Map database fields to Patient type fields
      return {
        ...data,
        emergency_contact_name: data.emergency_contact,
        emergency_contact_phone: data.emergency_phone,
        insurance_number: data.insurance_policy_number
      } as Patient;
    },
    enabled: !!patientId,
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true, // Refetch when component mounts
  });
}
