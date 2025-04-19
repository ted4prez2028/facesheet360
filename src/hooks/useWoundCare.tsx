
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface WoundRecord {
  id: string;
  patient_id: string;
  wound_location: string;
  wound_type: string;
  stage: string;
  length: number;
  width: number;
  depth: number;
  exudate_type: string;
  exudate_amount: string;
  wound_bed: string;
  treatment: string;
  created_at: string;
  updated_at: string;
  image_url?: string;
  analysis_result?: any;
}

export const useWoundCare = (patientId: string) => {
  const queryClient = useQueryClient();

  const { data: woundRecords = [], isLoading, error, refetch } = useQuery({
    queryKey: ['woundRecords', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wound_records')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WoundRecord[];
    },
  });

  const createWoundRecord = useMutation({
    mutationFn: async (newRecord: Omit<WoundRecord, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('wound_records')
        .insert([newRecord])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['woundRecords', patientId] });
    },
  });

  const updateWoundRecord = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WoundRecord> & { id: string }) => {
      const { data, error } = await supabase
        .from('wound_records')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['woundRecords', patientId] });
    },
  });

  const deleteWoundRecord = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('wound_records')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['woundRecords', patientId] });
    },
  });

  const analyzeWoundImage = async (imageUrl: string) => {
    const { data, error } = await supabase.functions.invoke('analyze-wound', {
      body: { image_url: imageUrl }
    });

    if (error) throw error;
    return data;
  };

  return {
    woundRecords,
    isLoading,
    error,
    refetch,
    createWoundRecord,
    updateWoundRecord,
    deleteWoundRecord,
    analyzeWoundImage
  };
};
