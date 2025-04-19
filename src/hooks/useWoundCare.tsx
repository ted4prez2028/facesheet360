
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface WoundRecord {
  id: string;
  patient_id: string;
  location: string;
  description: string;
  image_url: string;
  healing_status?: string;
  infection_status?: string;
  assessment?: string;
  stage?: string;
  created_at: string;
  updated_at: string;
}

// Function to fetch wound records
const getWoundRecordsByPatientId = async (patientId: string): Promise<WoundRecord[]> => {
  const { data, error } = await supabase
    .from('wounds')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as WoundRecord[];
};

// Function to create a new wound record
const createWoundRecord = async (record: Omit<WoundRecord, "id" | "created_at" | "updated_at">): Promise<WoundRecord> => {
  const { data, error } = await supabase
    .from('wounds')
    .insert(record)
    .select()
    .single();

  if (error) throw error;
  return data as WoundRecord;
};

// Function to update a wound record
const updateWoundRecord = async (id: string, updates: Partial<WoundRecord>): Promise<WoundRecord> => {
  const { data, error } = await supabase
    .from('wounds')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as WoundRecord;
};

// Function to delete a wound record
const deleteWoundRecord = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('wounds')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Function to upload a wound image
const uploadWoundImage = async (patientId: string, file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const filePath = `${patientId}/${Date.now()}.${fileExt}`;
  
  const { error } = await supabase.storage
    .from('wound_images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });
    
  if (error) throw error;
  
  const { data } = supabase.storage
    .from('wound_images')
    .getPublicUrl(filePath);
    
  return data.publicUrl;
};

// Function to analyze wound image using AI
const analyzeWoundImage = async (imageUrl: string) => {
  try {
    // This would call an edge function or external API for analysis
    // For now, returning mock data
    return {
      assessment: "The wound appears to be healing well with minimal signs of infection.",
      stage: "2",
      infection_status: "No signs of infection",
      healing_status: "Healing well"
    };
  } catch (error) {
    console.error("Error analyzing wound image:", error);
    return null;
  }
};

export function useWoundRecords(patientId: string) {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Fetch wound records for a specific patient
  const {
    data: woundRecords = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['woundRecords', patientId],
    queryFn: () => getWoundRecordsByPatientId(patientId),
    enabled: !!patientId,
  });
  
  // Create mutation
  const createWound = useMutation({
    mutationFn: (record: Omit<WoundRecord, 'id' | 'created_at' | 'updated_at'>) => {
      return createWoundRecord(record);
    },
    onSuccess: () => {
      toast.success('Wound record created successfully');
      queryClient.invalidateQueries({ queryKey: ['woundRecords', patientId] });
    },
    onError: (error) => {
      console.error('Error creating wound record:', error);
      toast.error('Failed to create wound record');
    },
  });
  
  // Update mutation
  const updateWound = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<WoundRecord> }) => {
      return updateWoundRecord(id, updates);
    },
    onSuccess: () => {
      toast.success('Wound record updated successfully');
      queryClient.invalidateQueries({ queryKey: ['woundRecords', patientId] });
    },
    onError: (error) => {
      console.error('Error updating wound record:', error);
      toast.error('Failed to update wound record');
    },
  });
  
  // Delete mutation
  const deleteWound = useMutation({
    mutationFn: (id: string) => {
      return deleteWoundRecord(id);
    },
    onSuccess: () => {
      toast.success('Wound record deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['woundRecords', patientId] });
    },
    onError: (error) => {
      console.error('Error deleting wound record:', error);
      toast.error('Failed to delete wound record');
    },
  });
  
  // Image upload function
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      const imageUrl = await uploadWoundImage(patientId, file);
      setIsUploading(false);
      return imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      setIsUploading(false);
      return null;
    }
  };

  // Image analysis function
  const analyzeImage = async (imageUrl: string) => {
    try {
      setIsAnalyzing(true);
      const analysis = await analyzeWoundImage(imageUrl);
      setIsAnalyzing(false);
      return analysis;
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast.error('Failed to analyze image');
      setIsAnalyzing(false);
      return null;
    }
  };
  
  return {
    woundRecords,
    isLoading,
    error,
    refetch,
    isUploading,
    isAnalyzing,
    createWound,
    updateWound,
    deleteWound,
    uploadImage,
    analyzeWoundImage: analyzeImage
  };
}
