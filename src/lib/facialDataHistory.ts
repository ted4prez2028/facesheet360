import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface FacialDataHistoryEntry {
  id?: string;
  patient_id: string;
  facial_data: string;
  confidence: number;
  registered_at?: string;
  registered_by?: string;
  notes?: string;
  is_active?: boolean;
}

export const saveFacialDataToHistory = async (
  patientId: string,
  facialData: string,
  confidence: number,
  notes?: string
): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('facial_data_history')
      .insert({
        patient_id: patientId,
        facial_data: facialData,
        confidence: confidence,
        registered_by: user?.id,
        notes: notes,
        is_active: true
      });

    if (error) {
      console.error('Error saving facial data to history:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in saveFacialDataToHistory:', error);
    return false;
  }
};

export const getFacialDataHistory = async (patientId: string) => {
  try {
    const { data, error } = await supabase
      .from('facial_data_history')
      .select('*')
      .eq('patient_id', patientId)
      .order('registered_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching facial data history:', error);
    toast.error('Failed to load facial recognition history');
    return [];
  }
};

export const toggleFacialDataActive = async (
  recordId: string,
  isActive: boolean
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('facial_data_history')
      .update({ is_active: isActive })
      .eq('id', recordId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error updating facial data history:', error);
    return false;
  }
};
