
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { WoundRecord } from "@/hooks/useWoundCare";

export type { WoundRecord };

/**
 * Get all wound records for a patient
 */
export const getWoundRecordsByPatientId = async (patientId: string): Promise<WoundRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('wounds')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching wound records:", error);
    toast.error("Failed to load wound records");
    return [];
  }
}

/**
 * Create a new wound record
 */
export const createWoundRecord = async (
  woundRecord: Omit<WoundRecord, "id" | "created_at" | "updated_at">
): Promise<WoundRecord | null> => {
  try {
    const { data, error } = await supabase
      .from('wounds')
      .insert(woundRecord)
      .select()
      .single();

    if (error) throw error;
    toast.success("Wound record created successfully");
    return data;
  } catch (error) {
    console.error("Error creating wound record:", error);
    toast.error("Failed to create wound record");
    return null;
  }
}

/**
 * Update an existing wound record
 */
export const updateWoundRecord = async (
  id: string, 
  updates: Partial<WoundRecord>
): Promise<WoundRecord | null> => {
  try {
    const { data, error } = await supabase
      .from('wounds')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    toast.success("Wound record updated successfully");
    return data;
  } catch (error) {
    console.error("Error updating wound record:", error);
    toast.error("Failed to update wound record");
    return null;
  }
}

/**
 * Delete a wound record
 */
export const deleteWoundRecord = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('wounds')
      .delete()
      .eq('id', id);

    if (error) throw error;
    toast.success("Wound record deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting wound record:", error);
    toast.error("Failed to delete wound record");
    return false;
  }
}

/**
 * Upload a wound image to storage
 */
export const uploadWoundImage = async (
  patientId: string, 
  file: File
): Promise<string | null> => {
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
    toast.error("Failed to upload wound image");
    return null;
  }
}
