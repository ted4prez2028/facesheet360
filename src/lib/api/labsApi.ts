// @ts-nocheck
import { supabase } from "@/integrations/supabase/client";

export interface LabResult {
  id?: string;
  patient_id: string;
  test_name: string;
  test_category?: string;
  result_value?: string;
  result_unit?: string;
  reference_range?: string;
  status: 'pending' | 'completed' | 'reviewed';
  ordered_by?: string;
  performed_at?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export const getLabResults = async (patientId: string) => {
  const { data, error } = await supabase
    .from('lab_results')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const createLabResult = async (labResult: Omit<LabResult, 'id'>) => {
  const { data, error } = await supabase
    .from('lab_results')
    .insert(labResult)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateLabResult = async (id: string, updates: Partial<LabResult>) => {
  const { data, error } = await supabase
    .from('lab_results')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteLabResult = async (id: string) => {
  const { error } = await supabase
    .from('lab_results')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};
