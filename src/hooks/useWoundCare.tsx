
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getWoundRecordsByPatientId,
  createWoundRecord,
  updateWoundRecord,
  deleteWoundRecord,
  uploadWoundImage
} from '@/lib/api/woundCareApi';
import { toast } from 'sonner';

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

export function useWoundCare(patientId: string) {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  
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
  const createMutation = useMutation({
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
  const updateMutation = useMutation({
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
  const deleteMutation = useMutation({
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
  
  return {
    woundRecords,
    isLoading,
    error,
    refetch,
    isUploading,
    createWoundRecord: createMutation.mutate,
    updateWoundRecord: updateMutation.mutate,
    deleteWoundRecord: deleteMutation.mutate,
    uploadImage
  };
}
