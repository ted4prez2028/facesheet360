
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWoundRecords } from './useWoundCare.tsx';

export { useWoundRecords };

export interface WoundRecord {
  id: string;
  patient_id: string;
  description: string;
  location: string;
  image_url: string;
  created_at: string;
  updated_at: string;
  healing_status?: string;
  infection_status?: string;
  assessment?: string;
  stage?: string;
}

export const useWoundRecords_old = (patientId: string) => {
  return useQuery({
    queryKey: ['woundRecords', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wounds')
        .select('*')
        .eq('patient_id', patientId);

      if (error) throw error;
      return data as WoundRecord[];
    },
    enabled: !!patientId,
  });
};

export const useWoundRecord = (woundRecordId: string) => {
  return useQuery({
    queryKey: ['woundRecord', woundRecordId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wounds')
        .select('*')
        .eq('id', woundRecordId)
        .single();

      if (error) throw error;
      return data as WoundRecord;
    },
    enabled: !!woundRecordId,
  });
};
