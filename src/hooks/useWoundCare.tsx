
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface WoundRecord {
  id: string;
  patient_id: string;
  location: string;
  description: string;
  image_url: string;
  assessment: string | null;
  stage: string | null;
  infection_status: string | null;
  healing_status: string | null;
  created_at: string;
  updated_at: string;
}

export const useWoundCare = (patientId: string) => {
  const queryClient = useQueryClient();

  const { data: woundRecords = [], isLoading, error, refetch } = useQuery({
    queryKey: ['woundRecords', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wounds')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WoundRecord[];
    },
  });

  const createWound = useMutation({
    mutationFn: async (newRecord: Omit<WoundRecord, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('wounds')
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

  const updateWound = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<WoundRecord> }) => {
      const { data, error } = await supabase
        .from('wounds')
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

  const deleteWound = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('wounds')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['woundRecords', patientId] });
    },
  });

  const uploadImage = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${patientId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('wound_images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('wound_images')
        .getPublicUrl(filePath);
        
      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading wound image:", error);
      return null;
    }
  };

  const analyzeWoundImage = async (imageUrl: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-wound', {
        body: { image_url: imageUrl }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error analyzing wound image:", error);
      return null;
    }
  };

  return {
    woundRecords,
    isLoading,
    error,
    refetch,
    createWound,
    updateWound,
    deleteWound,
    uploadImage,
    analyzeWoundImage
  };
};
