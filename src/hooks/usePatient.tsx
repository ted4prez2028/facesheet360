
import { useState, useEffect } from 'react';
import { getPatientById } from '@/lib/supabaseApi';
import { Patient } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const usePatient = (patientId: string) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPatient = async () => {
      if (!patientId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Verify authentication first
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          throw new Error(`Authentication error: ${sessionError.message}`);
        }
        if (!sessionData.session) {
          throw new Error("Authentication required. Please log in to view patient details.");
        }
        
        // Try to use the direct RPC method first to bypass RLS
        try {
          console.log("Attempting to fetch patient with direct method");
          const { data: directData, error: directError } = await supabase.rpc(
            'get_patient_by_id',
            { p_patient_id: patientId }
          );
          
          if (directError) {
            console.warn("Direct method failed:", directError);
            throw directError;
          }
          
          if (directData) {
            setPatient(directData);
            setError(null);
            return;
          }
        } catch (directErr) {
          console.warn("Falling back to standard API for patient fetch:", directErr);
          // Fall back to the standard method
        }
        
        // Standard method as fallback
        const data = await getPatientById(patientId);
        setPatient(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching patient:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch patient"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatient();
  }, [patientId]);

  return { patient, isLoading, error };
};
