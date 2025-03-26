
import { useState, useEffect } from 'react';
import { Patient } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useRolePermissions } from './useRolePermissions';

export const usePatient = (patientId: string) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { hasRole, isAssignedToPatient } = useRolePermissions();

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
        
        // If user is doctor or admin, they can access all patients
        const isDoctor = await hasRole('doctor');
        const isAdmin = await hasRole('admin');
        
        // Check if we have direct access to this patient
        const hasAccess = isDoctor || isAdmin || await isAssignedToPatient(patientId);
        console.log(`User has access to patient: ${hasAccess ? 'yes' : 'no'}`);
        
        // Try with Edge Function first which has proper permission handling
        try {
          const { data: edgeFunctionData, error: edgeFunctionError } = await supabase.functions.invoke('get-patient-by-id', {
            body: { patientId }
          });
          
          if (edgeFunctionError) {
            console.error("Edge function error:", edgeFunctionError);
            // Continue to fallback if edge function fails
          } else if (edgeFunctionData) {
            console.log("Successfully retrieved patient data via edge function");
            setPatient(edgeFunctionData);
            return;
          }
        } catch (edgeFuncErr) {
          console.error("Error using edge function:", edgeFuncErr);
          // Continue to fallback methods
        }
        
        // Fallback to using get_all_patients function which bypasses RLS
        try {
          const { data: rpcData, error: rpcError } = await supabase
            .rpc('get_all_patients')
            .eq('id', patientId)
            .maybeSingle();
          
          if (rpcError) {
            console.error("RPC error:", rpcError);
            // Continue to next fallback
          } else if (rpcData) {
            console.log("Successfully retrieved patient with RPC");
            setPatient(rpcData);
            return;
          }
        } catch (rpcErr) {
          console.error("RPC fallback failed:", rpcErr);
          // Continue to next fallback
        }
        
        // Last resort - direct query, might still fail due to RLS
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
          } else {
            throw new Error("Patient not found");
          }
        } catch (directErr) {
          console.error("Direct query fallback failed:", directErr);
          throw directErr;
        }
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
  }, [patientId, hasRole, isAssignedToPatient]);

  return { patient, isLoading, error };
};
