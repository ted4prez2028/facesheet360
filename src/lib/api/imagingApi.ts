// @ts-nocheck
import { supabase } from "@/integrations/supabase/client";

export interface ImagingStudy {
  id?: string;
  patient_id: string;
  study_type: string;
  body_part?: string;
  modality?: string;
  findings?: string;
  impression?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'reviewed';
  ordered_by?: string;
  performed_at?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  image_url?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export const getImagingStudies = async (patientId: string) => {
  const { data, error } = await supabase
    .from('imaging_studies')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const createImagingStudy = async (study: Omit<ImagingStudy, 'id'>) => {
  const { data, error } = await supabase
    .from('imaging_studies')
    .insert(study)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateImagingStudy = async (id: string, updates: Partial<ImagingStudy>) => {
  const { data, error } = await supabase
    .from('imaging_studies')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteImagingStudy = async (id: string) => {
  const { error } = await supabase
    .from('imaging_studies')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};
