
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePatientVitals(patientId: string) {
  return useQuery({
    queryKey: ['patient-vitals', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vital_signs')
        .select('*')
        .eq('patient_id', patientId)
        .order('date_recorded', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    }
  });
}
