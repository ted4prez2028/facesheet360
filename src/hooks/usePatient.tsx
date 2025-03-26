
import { useState, useEffect } from 'react';
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
        setError(null);
        
        // Verify authentication first
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          throw new Error(`Authentication error: ${sessionError.message}`);
        }
        if (!sessionData.session) {
          throw new Error("Authentication required. Please log in to view patient details.");
        }
        
        console.log("Attempting to fetch patient with ID:", patientId);
        
        // Try direct Edge Function approach first
        try {
          const { data: edgeFunctionData, error: edgeFunctionError } = await supabase.functions.invoke('get-patient-by-id', {
            body: { patientId }
          });
          
          if (edgeFunctionError) {
            console.error("Edge function error:", edgeFunctionError);
            throw new Error(`Failed to fetch patient via edge function: ${edgeFunctionError.message}`);
          }
          
          if (edgeFunctionData) {
            console.log("Successfully retrieved patient data via edge function");
            setPatient(edgeFunctionData);
            return;
          }
        } catch (edgeFuncErr) {
          console.error("Error using edge function:", edgeFuncErr);
          // Continue to fallback methods
        }
        
        // Fallback to direct query
        try {
          const { data: directData, error: directError } = await supabase
            .from('patients')
            .select('*')
            .eq('id', patientId)
            .maybeSingle();
          
          if (directError) {
            console.error("Error with direct query:", directError);
            throw directError;
          }
          
          if (directData) {
            console.log("Successfully retrieved patient with direct query");
            setPatient(directData);
            return;
          }
        } catch (directErr) {
          console.error("Direct query fallback failed:", directErr);
          // Continue to next fallback
        }
        
        // If we get here, no data was found
        throw new Error("Patient not found");
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
