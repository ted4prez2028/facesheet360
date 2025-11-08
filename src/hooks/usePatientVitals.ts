
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { VitalSigns } from '@/types';

export function usePatientVitals(patientId: string) {
  return useQuery({
    queryKey: ['patient-vitals', patientId],
    queryFn: async (): Promise<VitalSigns | null> => {
      if (!patientId) return null;
      
      const { data, error } = await supabase
        .from('patient_vitals')
        .select('*')
        .eq('patient_id', patientId)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching patient vitals:', error);
        return null;
      }

      if (!data) return null;

      // Map patient_vitals to VitalSigns format
      return {
        ...data,
        date_recorded: data.recorded_at,
        updated_at: data.created_at
      } as VitalSigns;
    },
    enabled: !!patientId
  });
}
