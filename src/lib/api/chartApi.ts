import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define the ChartRecord interface locally if it's not exported from types
export interface ChartRecord {
  id: string;
  created_at: string;
  patient_id: string | null;
  provider_id: string | null;
  notes: string | null;
  vitals: string | null;
  diagnosis: string | null;
  treatment_plan: string | null;
  record_type?: string;
  record_date?: string;
  vital_signs?: any;
  medications?: any;
  updated_at?: string;
}

/**
 * Create a new chart record
 */
export const createChartRecord = async (chartRecord: Omit<ChartRecord, "id" | "created_at">): Promise<ChartRecord | null> => {
  try {
    const { data, error } = await supabase
      .from('chart_records')
      .insert([chartRecord])
      .select()
      .single();

    if (error) throw error;
    return data as ChartRecord;
  } catch (error) {
    console.error("Error creating chart record:", error);
    toast.error("Failed to create chart record");
    return null;
  }
};

/**
 * Update an existing chart record
 */
export const updateChartRecord = async (id: string, updates: Partial<ChartRecord>): Promise<ChartRecord | null> => {
  try {
    const { data, error } = await supabase
      .from('chart_records')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ChartRecord;
  } catch (error) {
    console.error("Error updating chart record:", error);
    toast.error("Failed to update chart record");
    return null;
  }
};

/**
 * Get a chart record by ID
 */
export const getChartRecordById = async (id: string): Promise<ChartRecord | null> => {
  try {
    const { data, error } = await supabase
      .from('chart_records')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as ChartRecord;
  } catch (error) {
    console.error("Error fetching chart record:", error);
    return null;
  }
};

/**
 * Get all chart records for a patient
 */
export const getChartRecordsByPatientId = async (patientId: string): Promise<ChartRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('chart_records')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as ChartRecord[];
  } catch (error) {
    console.error("Error fetching chart records:", error);
    return [];
  }
};

/**
 * Delete a chart record by ID
 */
export const deleteChartRecord = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('chart_records')
      .delete()
      .eq('id', id);

    if (error) throw error;
    toast.success("Chart record deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting chart record:", error);
    toast.error("Failed to delete chart record");
    return false;
  }
};
