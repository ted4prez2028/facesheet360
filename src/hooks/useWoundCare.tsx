
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getWoundRecordsByPatientId, 
  createWoundRecord, 
  updateWoundRecord,
  deleteWoundRecord,
  uploadWoundImage,
  WoundRecord
} from "@/lib/api/woundCareApi";
import { useState } from "react";
import { toast } from "sonner";

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
    queryFn: () => getWoundRecordsByPatientId(patientId),
    enabled: !!patientId,
  });
  
  const createWound = useMutation({
    mutationFn: createWoundRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['woundRecords', patientId] });
    }
  });
  
  const updateWound = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<WoundRecord> }) => 
      updateWoundRecord(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['woundRecords', patientId] });
    }
  });
  
  const deleteWound = useMutation({
    mutationFn: deleteWoundRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['woundRecords', patientId] });
    }
  });
  
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      const imageUrl = await uploadWoundImage(patientId, file);
      return imageUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Error uploading image");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const analyzeWoundImage = async (imageUrl: string): Promise<any> => {
    try {
      setIsAnalyzing(true);
      
      // Call to our edge function that will integrate with OpenAI for analysis
      const response = await fetch(`https://tuembzleutkexrmrzxkg.supabase.co/functions/v1/analyze-wound`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      });
      
      if (!response.ok) {
        throw new Error('Analysis request failed');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error analyzing wound image:", error);
      toast.error("Failed to analyze wound image");
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

export default useWoundRecords;
