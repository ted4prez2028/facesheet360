
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export interface WoundRecord {
  id: string;
  patient_id: string;
  created_at: string;
  updated_at: string;
  location: string;
  description: string;
  image_url: string;
  stage?: string | null;
  healing_status?: string | null;
  infection_status?: string | null;
  assessment?: string | null;
}

export const useWoundCare = (patientId: string) => {
  const queryClient = useQueryClient();

  const { data: woundRecords = [], isLoading, refetch } = useQuery({
    queryKey: ['wounds', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wounds')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WoundRecord[];
    },
    enabled: !!patientId
  });

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${patientId}/wounds/${fileName}`;

      const { data: storageData, error: storageError } = await supabase
        .storage
        .from('wound-images')
        .upload(filePath, file);

      if (storageError) throw storageError;

      const { data: urlData } = await supabase
        .storage
        .from('wound-images')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      return null;
    }
  };

  const createWound = useMutation({
    mutationFn: async (woundData: Omit<WoundRecord, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('wounds')
        .insert(woundData)
        .select()
        .single();

      if (error) throw error;
      
      // Request AI analysis
      try {
        await supabase.functions.invoke('analyze-wound', {
          body: { wound_id: data.id }
        });
      } catch (aiError) {
        console.error('Error requesting AI analysis:', aiError);
        // Continue as the analysis can happen asynchronously
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wounds', patientId] });
    },
    onError: (error) => {
      toast.error(`Error creating wound record: ${(error as Error).message}`);
    }
  });

  const updateWound = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WoundRecord> & { id: string }) => {
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
      queryClient.invalidateQueries({ queryKey: ['wounds', patientId] });
    },
    onError: (error) => {
      toast.error(`Error updating wound record: ${(error as Error).message}`);
    }
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
      queryClient.invalidateQueries({ queryKey: ['wounds', patientId] });
    },
    onError: (error) => {
      toast.error(`Error deleting wound record: ${(error as Error).message}`);
    }
  });

  return {
    woundRecords,
    isLoading,
    refetch,
    uploadImage,
    createWound,
    updateWound,
    deleteWound
  };
};
