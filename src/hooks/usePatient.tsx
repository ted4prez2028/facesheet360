
import { useState, useEffect } from 'react';
import { getPatientById } from '@/lib/supabaseApi';
import { Patient } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
        
        // Directly query the patients table with RLS
        const { data, error: patientError } = await supabase
          .from('patients')
          .select('*')
          .eq('id', patientId)
          .single();
        
        if (patientError) {
          console.error("Error fetching patient with direct query:", patientError);
          
          // Fallback to standard API
          console.log("Attempting fallback to standard API");
          const fallbackData = await getPatientById(patientId);
          
          if (fallbackData) {
            setPatient(fallbackData);
            setError(null);
            return;
          } else {
            throw new Error("Patient not found");
          }
        }
        
        setPatient(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching patient:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch patient"));
        
        // Display a user-friendly error message
        toast.error("Unable to load patient data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatient();
  }, [patientId]);

  return { patient, isLoading, error };
};
