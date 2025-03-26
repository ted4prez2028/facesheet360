
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface VitalSigns {
  id: string;
  patient_id: string;
  date_recorded: string;
  temperature?: number;
  blood_pressure?: string;
  heart_rate?: number;
  respiratory_rate?: number;
  oxygen_saturation?: number;
  height?: number;
  weight?: number;
  notes?: string;
}

interface LabResult {
  id: string;
  patient_id: string;
  date_performed: string;
  test_name: string;
  test_result: string;
  normal_range?: string;
  units?: string;
  flagged?: boolean;
  notes?: string;
}

interface MedicationRecord {
  id: string;
  patient_id: string;
  prescribed_date: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration?: string;
  instructions?: string;
  status: "active" | "discontinued" | "completed";
}

interface ImagingRecord {
  id: string;
  patient_id: string;
  date_performed: string;
  imaging_type: string;
  body_area: string;
  findings?: string;
  image_url?: string;
  notes?: string;
}

// Hook for fetching vital signs
export const useVitalSigns = (patientId: string | null) => {
  return useQuery({
    queryKey: ['vital-signs', patientId],
    queryFn: async () => {
      if (!patientId) return [];
      
      const { data, error } = await supabase
        .from('vital_signs')
        .select('*')
        .eq('patient_id', patientId)
        .order('date_recorded', { ascending: false });
        
      if (error) throw error;
      return data as VitalSigns[];
    },
    enabled: !!patientId
  });
};

// Hook for fetching lab results
export const useLabResults = (patientId: string | null) => {
  return useQuery({
    queryKey: ['lab-results', patientId],
    queryFn: async () => {
      if (!patientId) return [];
      
      const { data, error } = await supabase
        .from('lab_results')
        .select('*')
        .eq('patient_id', patientId)
        .order('date_performed', { ascending: false });
        
      if (error) throw error;
      return data as LabResult[];
    },
    enabled: !!patientId
  });
};

// Hook for fetching medications
export const useMedications = (patientId: string | null) => {
  return useQuery({
    queryKey: ['medications', patientId],
    queryFn: async () => {
      if (!patientId) return [];
      
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('patient_id', patientId)
        .order('prescribed_date', { ascending: false });
        
      if (error) throw error;
      return data as MedicationRecord[];
    },
    enabled: !!patientId
  });
};

// Hook for fetching imaging records
export const useImagingRecords = (patientId: string | null) => {
  return useQuery({
    queryKey: ['imaging-records', patientId],
    queryFn: async () => {
      if (!patientId) return [];
      
      const { data, error } = await supabase
        .from('imaging_records')
        .select('*')
        .eq('patient_id', patientId)
        .order('date_performed', { ascending: false });
        
      if (error) throw error;
      return data as ImagingRecord[];
    },
    enabled: !!patientId
  });
};

// Hook for creating/updating vital signs
export const useVitalSignsMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const saveVitalSigns = async (vitalSigns: Omit<VitalSigns, 'id'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('vital_signs')
        .insert(vitalSigns)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { saveVitalSigns, isLoading, error };
};

// Hook for creating/updating lab results
export const useLabResultsMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const saveLabResult = async (labResult: Omit<LabResult, 'id'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('lab_results')
        .insert(labResult)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { saveLabResult, isLoading, error };
};

// Hook for creating/updating medications
export const useMedicationsMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const saveMedication = async (medication: Omit<MedicationRecord, 'id'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('medications')
        .insert(medication)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { saveMedication, isLoading, error };
};

// Hook for creating/updating imaging records
export const useImagingRecordsMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const saveImagingRecord = async (imagingRecord: Omit<ImagingRecord, 'id'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('imaging_records')
        .insert(imagingRecord)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { saveImagingRecord, isLoading, error };
};
