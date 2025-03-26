
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { storeFacialData } from './supabaseApi';

export const registerFacialData = async (patientId: string, facialData: string) => {
  try {
    // Store the facial data in Supabase
    const patient = await storeFacialData(patientId, facialData);
    
    if (!patient) {
      throw new Error('Failed to store facial data');
    }
    
    return patient;
  } catch (error) {
    console.error('Error registering facial data:', error);
    toast.error('Failed to register facial data');
    throw error;
  }
};

export const identifyPatientByFace = async (facialData: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('facial-recognition', {
      body: { action: 'identify', facialData }
    });
    
    if (error) throw error;
    
    if (!data.success) {
      toast.error(data.message || 'No matching patient found');
      return null;
    }
    
    return data.patient;
  } catch (error) {
    console.error('Error identifying patient:', error);
    toast.error('Failed to identify patient');
    throw error;
  }
};
