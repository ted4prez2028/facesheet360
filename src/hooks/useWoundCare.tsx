
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface WoundRecord {
  id: string;
  patient_id: string;
  image_url: string;
  location: string;
  description: string;
  assessment: string | null;
  stage: string | null;
  infection_status: string | null;
  healing_status: string | null;
  created_at: string;
  updated_at: string;
}

interface WoundAnalysis {
  stage: string;
  infection_status: string;
  healing_status: string;
  assessment: string;
}

export const useWoundRecords = (patientId: string) => {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const { 
    data: woundRecords = [], 
    isLoading,
    error 
  } = useQuery({
    queryKey: ['woundRecords', patientId],
    queryFn: async () => {
      if (!patientId) return [];
      
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
  
  const createWound = useMutation({
    mutationFn: async (wound: Omit<WoundRecord, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from('wounds')
        .insert(wound)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['woundRecords', patientId] });
      toast.success('Wound record created successfully');
    },
    onError: (error: Error) => {
      console.error("Error creating wound record:", error);
      toast.error('Failed to create wound record');
    }
  });
  
  const updateWound = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string, updates: Partial<WoundRecord> }) => {
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
      toast.success('Wound record updated successfully');
    },
    onError: (error: Error) => {
      console.error("Error updating wound record:", error);
      toast.error('Failed to update wound record');
    }
  });
  
  const deleteWound = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('wounds')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['woundRecords', patientId] });
      toast.success('Wound record deleted successfully');
    },
    onError: (error: Error) => {
      console.error("Error deleting wound record:", error);
      toast.error('Failed to delete wound record');
    }
  });
  
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const filePath = `${patientId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('wound_images')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('wound_images')
        .getPublicUrl(filePath);
        
      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading wound image:", error);
      toast.error('Failed to upload wound image');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const analyzeWoundImage = async (imageUrl: string): Promise<WoundAnalysis | null> => {
    try {
      setIsAnalyzing(true);
      
      const { data, error } = await supabase.functions.invoke('analyze-wound', {
        body: { imageUrl }
      });
      
      if (error) {
        console.error("Analysis request failed:", error);
        throw new Error('Analysis request failed');
      }
      
      return data as WoundAnalysis;
    } catch (error) {
      console.error("Error analyzing wound image:", error);
      toast.error('Failed to analyze wound image');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  return {
    woundRecords,
    isLoading,
    error,
    isUploading,
    isAnalyzing,
    createWound,
    updateWound,
    deleteWound,
    uploadImage,
    analyzeWoundImage
  };
};
