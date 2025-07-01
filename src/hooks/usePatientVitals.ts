
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { VitalSigns } from '@/types';

export function usePatientVitals(patientId: string) {
  return useQuery({
    queryKey: ['patient-vitals', patientId],
    queryFn: async (): Promise<VitalSigns | null> => {
      if (!patientId) return null;
      
      const { data, error } = await supabase
        .from('vital_signs')
        .select('*')
        .eq('patient_id', patientId)
        .order('date_recorded', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching patient vitals:', error);
        return null;
      }

      return data as VitalSigns;
    },
    enabled: !!patientId
  });
}
