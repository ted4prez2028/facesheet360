import { supabase } from "@/integrations/supabase/client";

export interface PatientNote {
  id?: string;
  patient_id: string;
  note_type: 'progress' | 'assessment' | 'plan' | 'general' | 'discharge';
  note_content: string;
  created_by: string;
  created_at?: string;
  updated_at?: string;
  is_locked?: boolean;
}

export const getPatientNotes = async (patientId: string) => {
  const { data, error } = await supabase
    .from('patient_notes')
    .select(`
      *,
      users!patient_notes_created_by_fkey(name, email)
    `)
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching patient notes:', error);
    throw error;
  }
  return data;
};

export const createPatientNote = async (note: Omit<PatientNote, 'id'>) => {
  const { data, error } = await supabase
    .from('patient_notes')
    .insert(note)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updatePatientNote = async (id: string, updates: Partial<PatientNote>) => {
  const { data, error } = await supabase
    .from('patient_notes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deletePatientNote = async (id: string) => {
  const { error } = await supabase
    .from('patient_notes')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};
