import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useWoundRecords = (patientId: string) => {
  return useQuery({
    queryKey: ['woundRecords', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wound_records')
        .select('*')
        .eq('patient_id', patientId);

      if (error) throw error;
      return data;
    },
    enabled: !!patientId,
  });
};

export const useWoundRecord = (woundRecordId: string) => {
  return useQuery({
    queryKey: ['woundRecord', woundRecordId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wound_records')
        .select('*')
        .eq('id', woundRecordId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!woundRecordId,
  });
};
