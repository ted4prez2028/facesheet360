
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Define interfaces for the data models
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
  const queryClient = useQueryClient();
  
  // Set up realtime subscription
  useEffect(() => {
    if (!patientId) return;
    
    const channel = supabase
      .channel(`vitals-${patientId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'patient_vitals',
          filter: `patient_id=eq.${patientId}`
        },
        () => {
          // Invalidate and refetch when vitals change
          queryClient.invalidateQueries({ queryKey: ['vital-signs', patientId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [patientId, queryClient]);
  
  return useQuery({
    queryKey: ['vital-signs', patientId],
    queryFn: async (): Promise<VitalSigns[]> => {
      if (!patientId) return [];
      
      const { data, error } = await supabase
        .from('patient_vitals')
        .select('*')
        .eq('patient_id', patientId)
        .order('recorded_at', { ascending: false });

      if (error) {
        console.error('Error fetching vitals:', error);
        return [];
      }

      return (data || []).map(vital => ({
        id: vital.id,
        patient_id: vital.patient_id,
        date_recorded: vital.recorded_at,
        temperature: vital.temperature || undefined,
        blood_pressure: vital.blood_pressure_systolic && vital.blood_pressure_diastolic 
          ? `${vital.blood_pressure_systolic}/${vital.blood_pressure_diastolic}` 
          : undefined,
        heart_rate: vital.heart_rate || undefined,
        respiratory_rate: vital.respiratory_rate || undefined,
        oxygen_saturation: vital.oxygen_saturation || undefined,
        height: vital.height || undefined,
        weight: vital.weight || undefined,
        notes: vital.notes || undefined
      }));
    },
    enabled: !!patientId
  });
};

// Hook for fetching lab results
export const useLabResults = (patientId: string | null) => {
  return useQuery({
    queryKey: ['lab-results', patientId],
    queryFn: async (): Promise<LabResult[]> => {
      if (!patientId) return [];
      
      // Mock data since lab_results table doesn't exist
      return [
        {
          id: '1',
          patient_id: patientId,
          date_performed: new Date().toISOString(),
          test_name: 'Complete Blood Count',
          test_result: 'Normal',
          normal_range: '4.5-11.0',
          units: 'x10^3/uL',
          flagged: false,
          notes: 'All values within normal range'
        },
        {
          id: '2',
          patient_id: patientId,
          date_performed: new Date(Date.now() - 86400000).toISOString(),
          test_name: 'Blood Glucose',
          test_result: '95',
          normal_range: '70-100',
          units: 'mg/dL',
          flagged: false,
          notes: 'Fasting glucose normal'
        }
      ];
    },
    enabled: !!patientId
  });
};

// Hook for fetching medications
export const useMedications = (patientId: string | null) => {
  return useQuery({
    queryKey: ['medications', patientId],
    queryFn: async (): Promise<MedicationRecord[]> => {
      if (!patientId) return [];
      
      // Mock data since medications table doesn't exist
      return [
        {
          id: '1',
          patient_id: patientId,
          prescribed_date: new Date().toISOString(),
          medication_name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Once daily',
          duration: '30 days',
          instructions: 'Take with food',
          status: 'active'
        },
        {
          id: '2',
          patient_id: patientId,
          prescribed_date: new Date(Date.now() - 2592000000).toISOString(),
          medication_name: 'Metformin',
          dosage: '500mg',
          frequency: 'Twice daily',
          duration: '90 days',
          instructions: 'Take with meals',
          status: 'active'
        }
      ];
    },
    enabled: !!patientId
  });
};

// Hook for fetching imaging records
export const useImagingRecords = (patientId: string | null) => {
  return useQuery({
    queryKey: ['imaging-records', patientId],
    queryFn: async (): Promise<ImagingRecord[]> => {
      if (!patientId) return [];
      
      // Mock data since imaging_records table doesn't exist
      return [
        {
          id: '1',
          patient_id: patientId,
          date_performed: new Date().toISOString(),
          imaging_type: 'X-Ray',
          body_area: 'Chest',
          findings: 'Normal chest X-ray. No acute findings.',
          notes: 'Routine screening'
        },
        {
          id: '2',
          patient_id: patientId,
          date_performed: new Date(Date.now() - 5184000000).toISOString(),
          imaging_type: 'MRI',
          body_area: 'Brain',
          findings: 'No abnormalities detected.',
          notes: 'Follow-up scan'
        }
      ];
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
      // Mock implementation since vital_signs table doesn't exist
      const mockData: VitalSigns = {
        ...vitalSigns,
        id: Date.now().toString()
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return mockData;
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
      // Mock implementation since lab_results table doesn't exist
      const mockData: LabResult = {
        ...labResult,
        id: Date.now().toString()
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return mockData;
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
      // Mock implementation since medications table doesn't exist
      const mockData: MedicationRecord = {
        ...medication,
        id: Date.now().toString()
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return mockData;
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
      // Mock implementation since imaging_records table doesn't exist
      const mockData: ImagingRecord = {
        ...imagingRecord,
        id: Date.now().toString()
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return mockData;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { saveImagingRecord, isLoading, error };
};
